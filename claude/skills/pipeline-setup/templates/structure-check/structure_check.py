#!/usr/bin/env python3
"""structure_check.py — diff-scoped maintainability gate, any stack.

Subcommands (structure-check.sh wraps them and finds the tools):
  check     <repo> <base> <head> [--json] [--allow-deps a,b]
            what `git diff base head` adds: complexity, size, duplication,
            import boundaries, new dependencies. Exit 0 pass, 1 violation.
  calibrate <repo> <ref> [--write]
            measures every function and file at <ref> and prints the
            thresholds: warn = p95, fail = p99 of each class, rounded up.
            --write puts them into the config file.
  summary   <repo> <ref> [--json]
            the whole codebase at <ref>: the numbers the close and the
            weekly compare.
  compare   <repo> <refA> <refB>
            two summaries side by side, with the delta (markdown).

Config: structure-check.json beside this file, or $STRUCTURE_CONFIG.
Tools from the environment: LIZARD, JSCPD, TS_LIB (structure-check.sh sets
them). Exit 2 on a usage or tool error.

Blind spots, by design: structure only, never behavior. CCN is cyclomatic,
not cognitive. Duplication finds token clones, not a second implementation
of a helper under another name. Boundaries are regexes over added lines.
"""
import argparse
import collections
import json
import math
import os
import re
import shutil
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.environ.get("STRUCTURE_CONFIG") or os.path.join(HERE, "structure-check.json")


# ---------------------------------------------------------------- plumbing

def die(msg):
    print("structure-check: " + msg, file=sys.stderr)
    sys.exit(2)


def run(cmd, cwd=None, check=True):
    p = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    if check and p.returncode != 0:
        die("%s failed: %s" % (" ".join(cmd[:3]), p.stderr.strip()[:400]))
    return p.stdout


def git(repo, *args, check=True):
    return run(["git", "-c", "core.quotePath=false", "-C", repo, *args], check=check)


def rev(repo, ref):
    return git(repo, "rev-parse", "--verify", ref + "^{commit}").strip()


def load_config():
    try:
        with open(CONFIG_PATH) as fh:
            return json.load(fh)
    except (OSError, ValueError) as e:
        die("cannot read config %s: %s" % (CONFIG_PATH, e))


class Worktree:
    """A detached worktree of one sha, removed on exit. Nothing in the repo changes."""

    def __init__(self, repo, sha):
        self.repo, self.sha = repo, sha
        self.path = tempfile.mkdtemp(prefix="structure-" + sha[:10] + "-")
        os.rmdir(self.path)

    def __enter__(self):
        git(self.repo, "worktree", "add", "--quiet", "--detach", self.path, self.sha)
        return self.path

    def __exit__(self, *exc):
        git(self.repo, "worktree", "remove", "--force", self.path, check=False)
        shutil.rmtree(self.path, ignore_errors=True)
        git(self.repo, "worktree", "prune", check=False)


class Classifier:
    def __init__(self, cfg):
        self.langs = cfg["languages"]
        self.test = [re.compile(p) for p in cfg.get("testPaths", [])]
        self.exclude = [re.compile(p) for p in cfg.get("exclude", [])]

    def lang(self, path):
        ext = os.path.splitext(path)[1]
        for name, spec in self.langs.items():
            if ext in spec["ext"]:
                return name
        return None

    def excluded(self, path):
        return any(p.search(path) for p in self.exclude)

    def cls(self, path):
        return "test" if any(p.search(path) for p in self.test) else "product"


def tracked_code(repo, sha, clf):
    out = []
    for path in git(repo, "ls-tree", "-r", "--name-only", sha).splitlines():
        if clf.lang(path) and not clf.excluded(path):
            out.append(path)
    return out


def diff_added(repo, base, head):
    """{path: {line_no: text}} of the lines head adds, plus the status of each path."""
    status = {}
    for line in git(repo, "diff", "--no-renames", "--name-status", base, head).splitlines():
        st, path = line.split("\t", 1)
        status[path] = st[0]
    added = collections.defaultdict(dict)
    current, lineno = None, 0
    hunk = re.compile(r"^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@")
    for line in git(repo, "diff", "--no-renames", "-U0", "--no-color", base, head).splitlines():
        if line.startswith("+++ "):
            current = line[6:] if line.startswith("+++ b/") else None
        elif line.startswith(("--- ", "diff --git", "index ")):
            continue
        else:
            m = hunk.match(line)
            if m:
                lineno = int(m.group(1))
            elif current and line.startswith("+"):
                added[current][lineno] = line[1:]
                lineno += 1
    return status, added


# ---------------------------------------------------------------- measuring

def functions(tree, paths, clf):
    """Every function in paths (relative to tree): path, name, start, end, nloc, ccn."""
    rows = []
    by_tool = collections.defaultdict(list)
    for p in paths:
        lang = clf.lang(p)
        by_tool[(clf.langs[lang]["tool"], lang)].append(p)
    for (tool, lang), files in by_tool.items():
        for i in range(0, len(files), 300):
            chunk = files[i:i + 300]
            if tool == "tsparser":
                out = run(["node", os.path.join(HERE, "tsfuncs.mjs"), *chunk], cwd=tree)
                found = json.loads(out or "[]")
            else:
                import csv
                lizard = os.environ.get("LIZARD") or "lizard"
                out = run([lizard, "--csv", *chunk], cwd=tree, check=False)
                found = []
                for rec in csv.reader(out.splitlines()):
                    if len(rec) < 11 or not rec[0].isdigit():
                        continue
                    found.append({"path": rec[6], "name": rec[7], "nloc": int(rec[0]),
                                  "ccn": int(rec[1]), "start": int(rec[9]), "end": int(rec[10])})
            seen = collections.Counter()
            for f in found:
                f["path"] = os.path.normpath(f["path"])
                seen[(f["path"], f["name"])] += 1
                f["key"] = "%s#%d" % (f["name"], seen[(f["path"], f["name"])])
                f["lang"], f["cls"] = lang, clf.cls(f["path"])
                rows.append(f)
    return rows


def file_nloc(tree, path):
    try:
        with open(os.path.join(tree, path), errors="replace") as fh:
            return sum(1 for line in fh if line.strip())
    except OSError:
        return 0


def base_functions(repo, sha, paths, clf):
    tmp = tempfile.mkdtemp(prefix="structure-base-")
    present = []
    try:
        for p in paths:
            text = git(repo, "show", "%s:%s" % (sha, p), check=False)
            if not text:
                continue
            os.makedirs(os.path.join(tmp, os.path.dirname(p)), exist_ok=True)
            with open(os.path.join(tmp, p), "w") as fh:
                fh.write(text)
            present.append(p)
        rows = functions(tmp, present, clf) if present else []
        sizes = {p: file_nloc(tmp, p) for p in present}
        return {(f["path"], f["key"]): f for f in rows}, sizes
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def clones(tree, cfg, clf):
    """jscpd over the tree: [(pathA, startA, endA, pathB, startB, endB)] plus line totals per class."""
    dup = cfg.get("duplication", {})
    out_dir = tempfile.mkdtemp(prefix="structure-jscpd-")
    jscpd = os.environ.get("JSCPD") or "jscpd"
    ignore = ",".join(dup.get("ignore", ["**/node_modules/**", "**/dist/**", "**/vendor/**", ".git/**"]))
    cmd = [jscpd, "--min-tokens", str(dup.get("minTokens", 50)), "--min-lines", str(dup.get("minLines", 5)),
           "--reporters", "json", "--output", out_dir, "--silent", "--ignore", ignore]
    if dup.get("formats"):
        cmd += ["--format", ",".join(dup["formats"])]
    try:
        run(cmd + ["."], cwd=tree, check=False)
        with open(os.path.join(out_dir, "jscpd-report.json")) as fh:
            report = json.load(fh)
    except (OSError, ValueError):
        return None
    finally:
        shutil.rmtree(out_dir, ignore_errors=True)
    pairs = []
    for d in report.get("duplicates", []):
        a, b = d["firstFile"], d["secondFile"]
        line = lambda f, k: f.get(k + "Loc", {}).get("line", f.get(k))
        pairs.append((os.path.normpath(a["name"]), line(a, "start"), line(a, "end"),
                      os.path.normpath(b["name"]), line(b, "start"), line(b, "end")))
    return pairs


def cloned_lines(pairs, clf):
    spans = collections.defaultdict(set)
    for pa, sa, ea, pb, sb, eb in pairs:
        if clf.excluded(pa) or clf.excluded(pb):
            continue
        spans[pa].update(range(sa, ea + 1))
        spans[pb].update(range(sb, eb + 1))
    return spans


def pct(values, q):
    if not values:
        return 0
    s = sorted(values)
    return s[min(len(s) - 1, max(0, math.ceil(q / 100.0 * len(s)) - 1))]


# ---------------------------------------------------------------- the rules

def boundary_hits(cfg, path, lines):
    """lines: {line_no: text}. Yields (rule, line_no, text) for each forbidden import."""
    for rule in cfg.get("boundaries", []):
        if not re.search(rule["files"], path):
            continue
        if rule.get("except") and re.search(rule["except"], path):
            continue
        forbid = re.compile(rule["forbid"])
        for n, text in lines.items():
            if forbid.search(text):
                yield rule, n, text.strip()


def dependency_findings(repo, base, head, status, cfg, allow):
    viol, warn = [], []
    deps = cfg.get("dependencies", {})
    pinned = deps.get("requirePinned", True)
    for path in status:
        name = os.path.basename(path)
        if name == "package.json" and "node_modules/" not in path:
            def keys(sha):
                try:
                    j = json.loads(git(repo, "show", "%s:%s" % (sha, path), check=False) or "{}")
                except ValueError:
                    return {}
                out = {}
                for sec in ("dependencies", "devDependencies", "peerDependencies", "optionalDependencies"):
                    out.update(j.get(sec, {}))
                return out
            old, new = keys(base), keys(head)
            for dep, ver in new.items():
                if dep not in old and dep not in allow:
                    viol.append(("dependency", path, 0, "new direct dependency %s@%s" % (dep, ver)))
                elif dep in old and old[dep] != ver:
                    warn.append(("dependency", path, 0, "bump %s %s -> %s" % (dep, old[dep], ver)))
                if pinned and re.match(r"^[\^~*]|^latest$|^x$|\|\||>", str(ver)) and dep not in allow:
                    viol.append(("dependency", path, 0, "unpinned version %s@%s" % (dep, ver)))
        elif name == "go.mod":
            def mods(sha):
                text = git(repo, "show", "%s:%s" % (sha, path), check=False)
                found = {}
                for m in re.finditer(r"^\s*(?:require\s+)?([\w.\-/]+\.[\w.\-/]+)\s+(v[\w.\-+]+)(.*)$", text, re.M):
                    found[m.group(1)] = (m.group(2), "// indirect" in m.group(3))
                return found
            old, new = mods(base), mods(head)
            for mod, (ver, indirect) in new.items():
                if mod in old:
                    if old[mod][0] != ver:
                        warn.append(("dependency", path, 0, "bump %s %s -> %s" % (mod, old[mod][0], ver)))
                elif indirect:
                    warn.append(("dependency", path, 0, "new indirect %s %s" % (mod, ver)))
                elif mod.split("/")[-1] not in allow and mod not in allow:
                    viol.append(("dependency", path, 0, "new direct dependency %s %s" % (mod, ver)))
        elif re.match(r"requirements.*\.txt$", name):
            old = set(re.findall(r"^([A-Za-z0-9_.\-]+)", git(repo, "show", "%s:%s" % (base, path), check=False), re.M))
            for line in git(repo, "show", "%s:%s" % (head, path), check=False).splitlines():
                m = re.match(r"^([A-Za-z0-9_.\-]+)(.*)$", line.strip())
                if not m or m.group(1) in allow:
                    continue
                if m.group(1) not in old:
                    viol.append(("dependency", path, 0, "new direct dependency " + line.strip()))
                if pinned and "==" not in m.group(2):
                    viol.append(("dependency", path, 0, "unpinned version " + line.strip()))
        elif name in deps.get("otherManifests", []):
            warn.append(("dependency", path, 0, "manifest changed: read it (no parser for this format)"))
    return viol, warn


# ---------------------------------------------------------------- check

def check(repo, base_ref, head_ref, allow, as_json):
    cfg = load_config()
    clf = Classifier(cfg)
    base, head = rev(repo, base_ref), rev(repo, head_ref)
    if subprocess.run(["git", "-C", repo, "merge-base", "--is-ancestor", base, head]).returncode != 0:
        print("structure-check: warning: %s is not an ancestor of %s; the diff is a tree diff" % (base_ref, head_ref),
              file=sys.stderr)
    status, added = diff_added(repo, base, head)
    code = [p for p in status if status[p] != "D" and clf.lang(p) and not clf.excluded(p)]
    viol, warn = [], []
    thresholds = cfg.get("thresholds", {})
    file_limits = cfg.get("fileLines", {})

    with Worktree(repo, head) as tree:
        head_fns = functions(tree, code, clf)
        base_fns, base_sizes = base_functions(repo, base, [p for p in code if status[p] != "A"], clf)

        # complexity and function size: a changed function, new or taken across the line
        for f in head_fns:
            lines = added.get(f["path"], {})
            if not any(f["start"] <= n <= f["end"] for n in lines):
                continue
            t = thresholds.get("%s/%s" % (f["lang"], f["cls"]))
            if not t:
                continue
            was = base_fns.get((f["path"], f["key"]))
            where = "%s:%d %s" % (f["path"], f["start"], f["name"])
            for metric, label in (("ccn", "complexity"), ("nloc", "function size")):
                v = f[metric]
                if v > t[metric + "_fail"]:
                    already = was is not None and was[metric] > t[metric + "_fail"]
                    (warn if already else viol).append(
                        (label, f["path"], f["start"], "%s %s=%d > %d%s" % (
                            f["name"], metric, v, t[metric + "_fail"], " (already over at base)" if already else "")))
                elif v > t[metric + "_warn"]:
                    warn.append((label, f["path"], f["start"], "%s %s=%d > p95 %d" % (f["name"], metric, v, t[metric + "_warn"])))

        # file size
        for p in code:
            lim = file_limits.get(clf.cls(p))
            if not lim or not added.get(p):
                continue
            n = file_nloc(tree, p)
            before = base_sizes.get(p, 0)
            if n > lim["fail"] and before <= lim["fail"]:
                viol.append(("file size", p, 0, "%d lines > %d" % (n, lim["fail"])))
            elif n > lim["warn"]:
                warn.append(("file size", p, 0, "%d lines > p95 %d" % (n, lim["warn"])))

        # duplication: the share of added lines that sit in a clone
        pairs = clones(tree, cfg, clf)
        if pairs is None:
            warn.append(("duplication", "-", 0, "jscpd produced no report; duplication not measured"))
        else:
            spans = cloned_lines(pairs, clf)
            totals = collections.Counter()
            in_clone = collections.Counter()
            first_hit = {}
            for p in code:
                cls = clf.cls(p)
                for n, text in added.get(p, {}).items():
                    if not text.strip():
                        continue
                    totals[cls] += 1
                    if n in spans.get(p, ()):
                        in_clone[cls] += 1
                        first_hit.setdefault(cls, "%s:%d" % (p, n))
            rate = cfg.get("duplication", {}).get("rate", {})
            fails_on = cfg.get("duplication", {}).get("failOn", ["product"])
            for cls in totals:
                share = 100.0 * in_clone[cls] / totals[cls]
                limit = rate.get(cls)
                if limit is None or share <= limit:
                    continue
                msg = "%.2f%% of %d added %s lines in clones > %.2f%% (first: %s)" % (
                    share, totals[cls], cls, limit, first_hit.get(cls, "-"))
                (viol if cls in fails_on else warn).append(("duplication", "-", 0, msg))

    # boundaries: added lines only
    for p in status:
        if status[p] == "D" or clf.excluded(p):
            continue
        for rule, n, text in boundary_hits(cfg, p, added.get(p, {})):
            viol.append(("boundary", p, n, "%s: %s  [%s]" % (rule["id"], text[:120], rule.get("rule", "doctrine"))))

    dv, dw = dependency_findings(repo, base, head, status, cfg, allow)
    viol += dv
    warn += dw

    if as_json:
        print(json.dumps({"base": base, "head": head,
                          "violations": [dict(zip(("check", "path", "line", "detail"), v)) for v in viol],
                          "warnings": [dict(zip(("check", "path", "line", "detail"), w)) for w in warn]}, indent=2))
    else:
        for kind, rows in (("VIOLATION", viol), ("warning", warn)):
            for check_name, path, line, detail in rows:
                loc = path if not line else "%s:%d" % (path, line)
                print("%-9s %-13s %s  %s" % (kind, check_name, loc, detail))
        print("structure-check: %d violation(s), %d warning(s) · %s..%s" % (len(viol), len(warn), base[:10], head[:10]))
    return 1 if viol else 0


# ---------------------------------------------------------------- whole tree

def measure_tree(repo, ref, cfg, clf):
    sha = rev(repo, ref)
    with Worktree(repo, sha) as tree:
        paths = tracked_code(repo, sha, clf)
        fns = functions(tree, paths, clf)
        sizes = {p: file_nloc(tree, p) for p in paths}
        pairs = clones(tree, cfg, clf)
        spans = cloned_lines(pairs or [], clf)
        dup_lines, all_lines = collections.Counter(), collections.Counter()
        for p in paths:
            cls = clf.cls(p)
            all_lines[cls] += sizes[p]
            dup_lines[cls] += len(spans.get(p, ()))
        boundary = 0
        for p in paths:
            try:
                with open(os.path.join(tree, p), errors="replace") as fh:
                    lines = {i + 1: t for i, t in enumerate(fh)}
            except OSError:
                continue
            boundary += sum(1 for _ in boundary_hits(cfg, p, lines))
    return sha, paths, fns, sizes, dup_lines, all_lines, boundary


def calibrate(repo, ref, write):
    cfg = load_config()
    clf = Classifier(cfg)
    sha, paths, fns, sizes, dup_lines, all_lines, _ = measure_tree(repo, ref, cfg, clf)
    groups = collections.defaultdict(list)
    for f in fns:
        groups["%s/%s" % (f["lang"], f["cls"])].append(f)
    thresholds, report = {}, {}
    for key, rows in sorted(groups.items()):
        ccn, nloc = [r["ccn"] for r in rows], [r["nloc"] for r in rows]
        thresholds[key] = {"ccn_warn": pct(ccn, 95), "nloc_warn": pct(nloc, 95),
                           "ccn_fail": pct(ccn, 99), "nloc_fail": pct(nloc, 99)}
        report[key] = {"n": len(rows), "ccn_max": max(ccn), "nloc_max": max(nloc)}
    file_lines = {}
    for cls in ("product", "test"):
        vals = [n for p, n in sizes.items() if clf.cls(p) == cls]
        if vals:
            file_lines[cls] = {"warn": pct(vals, 95), "fail": pct(vals, 99)}
    rate = {cls: round(100.0 * dup_lines[cls] / all_lines[cls], 2) if all_lines[cls] else 0.0
            for cls in all_lines}
    result = {"calibratedAt": sha, "thresholds": thresholds, "fileLines": file_lines,
              "duplicationRate": rate, "measured": report}
    print(json.dumps(result, indent=2))
    if write:
        cfg["calibratedAt"] = sha
        cfg["thresholds"] = thresholds
        cfg["fileLines"] = file_lines
        cfg.setdefault("duplication", {})["rate"] = rate
        with open(CONFIG_PATH, "w") as fh:
            json.dump(cfg, fh, indent=2)
            fh.write("\n")
        print("structure-check: thresholds written to " + CONFIG_PATH, file=sys.stderr)
    return 0


def summary(repo, ref):
    cfg = load_config()
    clf = Classifier(cfg)
    sha, paths, fns, sizes, dup_lines, all_lines, boundary = measure_tree(repo, ref, cfg, clf)
    t = cfg.get("thresholds", {})
    over95 = over99 = 0
    for f in fns:
        lim = t.get("%s/%s" % (f["lang"], f["cls"]))
        if not lim:
            continue
        if f["ccn"] > lim["ccn_fail"] or f["nloc"] > lim["nloc_fail"]:
            over99 += 1
        elif f["ccn"] > lim["ccn_warn"] or f["nloc"] > lim["nloc_warn"]:
            over95 += 1
    prod = [f for f in fns if f["cls"] == "product"]
    return {
        "ref": ref, "sha": sha, "files": len(paths), "functions": len(fns),
        "lines_product": all_lines["product"], "lines_test": all_lines["test"],
        "over_p95": over95, "over_p99": over99,
        "ccn_max": max([f["ccn"] for f in prod] or [0]),
        "ccn_avg": round(sum(f["ccn"] for f in prod) / len(prod), 2) if prod else 0,
        "duplication_product_pct": round(100.0 * dup_lines["product"] / all_lines["product"], 2) if all_lines["product"] else 0,
        "duplication_test_pct": round(100.0 * dup_lines["test"] / all_lines["test"], 2) if all_lines["test"] else 0,
        "boundary_violations": boundary,
    }


def compare(repo, a, b):
    sa, sb = summary(repo, a), summary(repo, b)
    print("| measure | %s (%s) | %s (%s) | delta |" % (a, sa["sha"][:10], b, sb["sha"][:10]))
    print("|---|---|---|---|")
    for k in sa:
        if k in ("ref", "sha"):
            continue
        va, vb = sa[k], sb[k]
        delta = round(vb - va, 2) if isinstance(va, (int, float)) else ""
        print("| %s | %s | %s | %s |" % (k, va, vb, ("+%s" % delta) if isinstance(delta, (int, float)) and delta > 0 else delta))
    return 0


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    c = sub.add_parser("check")
    c.add_argument("repo"); c.add_argument("base"); c.add_argument("head")
    c.add_argument("--json", action="store_true")
    c.add_argument("--allow-deps", default=os.environ.get("ALLOW_DEPS", ""))
    k = sub.add_parser("calibrate")
    k.add_argument("repo"); k.add_argument("ref"); k.add_argument("--write", action="store_true")
    s = sub.add_parser("summary")
    s.add_argument("repo"); s.add_argument("ref"); s.add_argument("--json", action="store_true")
    m = sub.add_parser("compare")
    m.add_argument("repo"); m.add_argument("a"); m.add_argument("b")
    args = ap.parse_args()
    repo = os.path.abspath(args.repo)
    if args.cmd == "check":
        allow = {x.strip() for x in args.allow_deps.split(",") if x.strip()}
        return check(repo, args.base, args.head, allow, args.json)
    if args.cmd == "calibrate":
        return calibrate(repo, args.ref, args.write)
    if args.cmd == "summary":
        print(json.dumps(summary(repo, args.ref), indent=2))
        return 0
    return compare(repo, args.a, args.b)


if __name__ == "__main__":
    sys.exit(main())

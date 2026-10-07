// The blind text test of a film for viewers who do not know the work (users, newcomers).
//   node blind.mjs <text.md> <out.md>
// <text.md> holds the film's on-screen text, in order, and nothing else. A fresh Sonnet 5.5 (low)
// session with no tools, no settings and no CLAUDE.md reads it, explains the subject back in five
// sentences and lists every word that blocked it. <out.md> gets the text and the answer.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const [textArg, outArg] = process.argv.slice(2);
if (!textArg || !outArg) {
  console.error('usage: node blind.mjs <text.md> <out.md>');
  process.exit(2);
}
const text = fs.readFileSync(textArg, 'utf8').trim();
if (!text) {
  console.error(`blind.mjs: ${textArg} is empty`);
  process.exit(1);
}

const prompt = `Below is all the text a short film shows on screen, in the order the viewer sees it. You know nothing else about the subject, and you cannot ask.

1. Explain what the film is about, back to its author, in five sentences of your own.
2. List every word or phrase that blocked you or that you had to guess, one per line, with why. Write "none" if nothing did.

--- the film's text ---
${text}
--- end ---`;

const r = spawnSync(
  'claude',
  ['-p', prompt, '--model', 'claude-sonnet-5-5', '--effort', 'low', '--tools', '', '--setting-sources', '', '--strict-mcp-config', '--no-session-persistence', '--system-prompt', 'You are a reader with no context. Read the text literally and answer only from it.'],
  {cwd: path.dirname(path.resolve(textArg)), encoding: 'utf8', timeout: 300000},
);
if (r.error || r.status !== 0) {
  console.error(`blind.mjs: the reader did not run (${r.error?.code || `exit ${r.status}`}). It needs the claude CLI on PATH, signed in.\n${(r.stderr || '').trim()}`);
  process.exit(1);
}
fs.mkdirSync(path.dirname(path.resolve(outArg)), {recursive: true});
fs.writeFileSync(outArg, `# Blind text test\n\nThe reader: a fresh Sonnet 5.5 (low) session, no context.\n\n## The text\n\n${text}\n\n## What the reader understood\n\n${r.stdout.trim()}\n`);
console.log(r.stdout.trim());

// Per-function cyclomatic complexity and length for .ts/.tsx/.js/.jsx, from
// the TypeScript compiler's own parser: the fallback for TS, where lizard
// loses function boundaries in TSX. Usage: node tsfuncs.mjs <file>...
// Prints one JSON array: {path, name, start, end, nloc, ccn, params}.
// CCN = 1 + if, ?:, case, for/for-in/for-of/while/do, catch, &&, ||, ??
// (and their assignment forms), counted in the function's own body —
// nested functions are measured on their own. NLOC = non-blank lines of the
// whole span, nested functions included (the length a reader scrolls).
// A Playwright describe-block callback is a container, not a function: it is
// skipped and the tests inside it are measured.
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'

const require = createRequire(import.meta.url)
const ts = require(process.env.TS_LIB || 'typescript')
const K = ts.SyntaxKind

const branching = new Set([
  K.IfStatement, K.ConditionalExpression, K.CaseClause, K.ForStatement, K.ForInStatement,
  K.ForOfStatement, K.WhileStatement, K.DoStatement, K.CatchClause,
])
const logical = new Set([
  K.AmpersandAmpersandToken, K.BarBarToken, K.QuestionQuestionToken,
  K.AmpersandAmpersandEqualsToken, K.BarBarEqualsToken, K.QuestionQuestionEqualsToken,
])

function isFunction(node) {
  return ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node) ||
    ts.isMethodDeclaration(node) || ts.isConstructorDeclaration(node) || ts.isGetAccessor(node) ||
    ts.isSetAccessor(node)
}

function nameOf(node) {
  if (node.name && ts.isIdentifier(node.name)) return node.name.text
  if (ts.isConstructorDeclaration(node)) return 'constructor'
  const parent = node.parent
  if (parent && ts.isVariableDeclaration(parent) && ts.isIdentifier(parent.name)) return parent.name.text
  if (parent && ts.isPropertyAssignment(parent) && ts.isIdentifier(parent.name)) return parent.name.text
  if (parent && ts.isCallExpression(parent) && parent.parent && ts.isVariableDeclaration(parent.parent) &&
    ts.isIdentifier(parent.parent.name)) return parent.parent.name.text
  if (parent && ts.isCallExpression(parent) && /^(test|it)(\.\w+)*$/.test(parent.expression.getText())) {
    const title = parent.arguments[0]
    if (title && (ts.isStringLiteral(title) || ts.isNoSubstitutionTemplateLiteral(title) || ts.isTemplateExpression(title)))
      return 'test ' + title.getText().slice(1, 61)
  }
  return '(anonymous)'
}

function complexity(fn) {
  let ccn = 1
  const visit = (node) => {
    if (node !== fn && isFunction(node)) return
    if (branching.has(node.kind)) ccn += 1
    if (ts.isBinaryExpression(node) && logical.has(node.operatorToken.kind)) ccn += 1
    ts.forEachChild(node, visit)
  }
  ts.forEachChild(fn, visit)
  return ccn
}

function isDescribeBlock(node) {
  const parent = node.parent
  return Boolean(parent && ts.isCallExpression(parent) && parent.arguments.includes(node) &&
    /(^|\.)describe(\.\w+)*$/.test(parent.expression.getText()))
}

const out = []
for (const path of process.argv.slice(2)) {
  const text = readFileSync(path, 'utf8')
  const kind = /\.tsx$/.test(path) ? ts.ScriptKind.TSX : /\.jsx$/.test(path) ? ts.ScriptKind.JSX : /\.[cm]?js$/.test(path) ? ts.ScriptKind.JS : ts.ScriptKind.TS
  const source = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, kind)
  const lines = text.split('\n')
  const walk = (node) => {
    if (isFunction(node) && node.body && !isDescribeBlock(node)) {
      const start = source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1
      const end = source.getLineAndCharacterOfPosition(node.getEnd()).line + 1
      let nloc = 0
      for (let i = start - 1; i < end; i++) {
        const s = lines[i].trim()
        if (s && !s.startsWith('//') && !s.startsWith('/*') && !s.startsWith('*')) nloc += 1
      }
      out.push({ path, name: nameOf(node), start, end, nloc, ccn: complexity(node), params: node.parameters.length })
    }
    ts.forEachChild(node, walk)
  }
  walk(source)
}
process.stdout.write(JSON.stringify(out))

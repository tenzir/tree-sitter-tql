// Checks what the queries capture and where unterminated literals end, which
// the corpus tests cannot express.

const assert = require("node:assert");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { test } = require("node:test");

const Parser = require("tree-sitter");
const language = require("../bindings/node");

const parser = new Parser();
parser.setLanguage(language);

const query = (name) =>
  new Parser.Query(
    language,
    readFileSync(
      join(__dirname, "..", "queries", "tql", `${name}.scm`),
      "utf8",
    ),
  );

/** The text of the nodes that `name` captures with `capture` in `source`. */
const captured = (name, capture, source) =>
  query(name)
    .captures(parser.parse(source).rootNode)
    .filter((c) => c.name === capture)
    .map((c) => c.node.text);

test("unterminated literals run to the end of the input", () => {
  for (const [source, type, literal] of [
    ['x = "a\ny = 1', "string", '"a\ny = 1'],
    ['x = r#"a"\ny = 1', "string", 'r#"a"\ny = 1'],
    ['x = f"a {b("c\ny = 1', "format_expr", 'f"a {b("c\ny = 1'],
    ["x = 1 /* a\ny = 2", "comment", "/* a\ny = 2"],
  ]) {
    const tree = parser.parse(source);
    const node = tree.rootNode.descendantForIndex(source.length - 1);
    let literalNode = node;
    while (literalNode.type !== type) literalNode = literalNode.parent;
    assert.strictEqual(literalNode.text, literal, source);
    assert.strictEqual(tree.rootNode.hasError, false, source);
  }
  // The text of an unterminated format string follows its opening quote.
  const tree = parser.parse('x = f"a {b');
  const format = tree.rootNode.descendantForIndex(4);
  assert.strictEqual(format.type, "format_expr");
  assert.deepStrictEqual(
    format.namedChildren.map((n) => [n.type, n.text]),
    [["format_text", "a {b"]],
  );
});

test("indentation of verbatim text excludes replacements", () => {
  const source = 'x = f"a\n  b{[\n  1\n]}c\n  d"';
  assert.deepStrictEqual(captured("indents", "indent.auto", source), [
    "a\n  b",
    "c\n  d",
  ]);
  assert.deepStrictEqual(captured("indents", "indent", source), ["[\n  1\n]"]);
  assert.deepStrictEqual(captured("indents", "indent.auto", 'x = f"a {['), [
    "a {[",
  ]);
});

test("brackets pair within their node", () => {
  const source = "x = f(a, [1, {b: 2}])";
  const matches = query("brackets")
    .matches(parser.parse(source).rootNode)
    .map((m) => m.captures.map((c) => `${c.name}:${c.node.startIndex}`));
  assert.deepStrictEqual(matches.sort(), [
    ["open:13", "close:18"],
    ["open:5", "close:20"],
    ["open:9", "close:19"],
  ]);
});

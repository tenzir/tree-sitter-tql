/**
 * @file The Tenzir Query Language (TQL) is a pipeline-style dataflow language.
 * @author Tenzir <engineering@tenzir.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const KEYWORDS = [
  "let",
  "if",
  "else",
  "match",
  "and",
  "or",
  "not",
  "move",
  "in",
  "this",
  "?",
  ".",
  "...",
  "[",
  "]",
  "{",
  "}",
  ":",
];

const BUILTIN_VARIABLES = ["_"];
const BOOLEAN_LITERALS = ["true", "false"];
const NULL_LITERAL = "null";

const HIGHLIGHT_NODE_CAPTURES = [
  // NOTE: Capture dollar-prefixed globals as builtin variables to inherit the
  // highlight color from editor themes until native @variable styling is
  // widely supported. Keep this aligned with HIGHLIGHT_STRUCTURAL_PATTERNS.
  { node: "dollar_var", capture: "@variable.builtin" },
  { node: "global_sigil", capture: "@keyword" },
  { node: "metadata_sigil", capture: "@keyword" },
  { node: "meta_selector", capture: "@attribute" },
  { node: "number", capture: "@number" },
  { node: "string", capture: "@string" },
  { node: "format_expr", capture: "@string" },
  { node: "ip", capture: "@constant" },
  { node: "subnet", capture: "@constant" },
  { node: "time", capture: "@number" },
  { node: "duration", capture: "@number" },
  { node: "frontmatter_open", capture: "@comment" },
  { node: "frontmatter_close", capture: "@comment" },
  { node: "comment", capture: "@comment" },
];

const HIGHLIGHT_STRUCTURAL_PATTERNS = [
  `(invocation\n  operator: (entity) @function.call)`,
  `(call_expression\n  (entity) @function.call)`,
  `(call_expression\n  method: (entity) @function.method)`,
  // NOTE: Structural fallback so dollar-prefixed identifiers highlighted as
  // builtin variables even when not parsed as dollar_var (e.g., errors).
  `((identifier) @variable.builtin (#match? @variable.builtin "^\\$[A-Za-z_]\\w*$"))`,
];

const PUNCTUATION_BRACKETS = ["(", ")"];
const PUNCTUATION_DELIMITERS = [","];
const OPERATORS = ["=", "=>", "|", "::", "==", "!=", ">", ">=", "<", "<="];
const ARITHMETIC_OPERATORS = ["+", "-", "*", "/"];

const KEYWORD = literalEnum(KEYWORDS);
const BUILTIN = literalEnum(BUILTIN_VARIABLES);
const BOOLEAN = literalEnum(BOOLEAN_LITERALS);

module.exports = grammar({
  name: "tql",

  extras: ($) => [
    token(
      choice(
        /[ \t\r]+/, // Regular whitespace except newlines
        seq("\\", /[ \t]*/, "\n"), // Backslash line continuation
      ),
    ),
    $.comment, // Comments appear as explicit nodes
  ],

  word: ($) => $.identifier,

  conflicts: ($) => [
    // These are necessary conflicts
    [$.record],
    [$.list], // Needed for if [ ... ] disambiguation
    [$.field_selector, $.primary_expression], // For 'this' ambiguity
    [$.argument, $.primary_expression],
  ],

  rules: {
    // Entry point - a TQL program
    program: ($) =>
      seq(
        repeat("\n"),
        optional(seq($.frontmatter, repeat("\n"))),
        optional($.pipeline),
      ),

    frontmatter: ($) =>
      seq(
        field("open", $.frontmatter_open),
        field("body", optional($.frontmatter_body)),
        field("close", $.frontmatter_close),
      ),

    frontmatter_open: (_) => token(seq("---", /[ \t]*\r?\n/)),

    frontmatter_close: (_) =>
      choice(token(seq("---", /[ \t]*\r?\n/)), token(seq("---", /[ \t]*/))),

    frontmatter_body: ($) => repeat1($.frontmatter_line),

    frontmatter_line: (_) =>
      token(
        choice(
          /[ \t]*\r?\n/,
          seq(/[ \t]*-*(?:[^-\r\n][^\r\n]*)/, /\r?\n/),
        ),
      ),

    // Comments should be explicit nodes but handled as extras
    comment: (_) =>
      token(
        choice(
          seq("//", /[^\n\r]*/),
          seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/"),
        ),
      ),

    // Pipeline is a sequence of statements separated by newlines or pipes
    pipeline: ($) =>
      prec.left(
        seq(
          $.statement,
          repeat(prec.left(seq(repeat1(choice("\n", "|")), $.statement))),
          repeat(choice("\n", "|")),
        ),
      ),

    statement: ($) =>
      choice(
        $.let_statement,
        $.if_statement,
        $.match_statement,
        $.assignment,
        $.invocation,
      ),

    let_statement: ($) =>
      prec(
        2,
        seq(
          KEYWORD.LET,
          field("name", $.dollar_var),
          "=",
          field("value", $.expression),
        ),
      ),

    if_statement: ($) =>
      prec(
        2,
        seq(
          KEYWORD.IF,
          field("condition", $.expression),
          field("consequence", alias($.block, $.then_block)),
          optional(
            seq(
              KEYWORD.ELSE,
              field(
                "alternative",
                choice($.if_statement, alias($.block, $.else_block)),
              ),
            ),
          ),
        ),
      ),

    match_statement: ($) =>
      prec(
        2,
        seq(
          KEYWORD.MATCH,
          field("expr", $.expression),
          "{",
          repeat("\n"),
          repeat(seq($.match_arm, repeat(choice("\n", ",")))),
          "}",
        ),
      ),

    match_arm: ($) =>
      seq(commaSep1($.expression), "=>", "{", repeat("\n"), $.pipeline, "}"),

    invocation: ($) =>
      seq(
        field("operator", $.entity),
        optional(
          field(
            "arguments",
            choice(alias($.parenthesized_arguments, $.arguments), $.arguments),
          ),
        ),
        optional(
          seq(
            $.pipeline_block,
            optional(seq(",", repeat("\n"), field("arguments", $.arguments))),
          ),
        ),
      ),

    pipeline_block: ($) => seq("{", repeat("\n"), $.pipeline, "}"),

    block: ($) =>
      seq("{", repeat("\n"), field("body", optional($.pipeline)), "}"),

    assignment: ($) =>
      prec.right(
        0,
        seq(field("left", $.selector), "=", field("right", $.expression)),
      ),

    selector: ($) => choice($.meta_selector, $.field_selector),

    // Meta selector - more flexible to allow any identifier after @
    meta_selector: ($) =>
      seq(field("sigil", alias("@", $.metadata_sigil)), $.identifier),

    field_selector: ($) =>
      choice(
        KEYWORD.THIS,
        seq(
          optional(seq(KEYWORD.THIS, ".")),
          $.identifier,
          optional("?"),
          repeat(seq(".", $.identifier, optional("?"))),
        ),
      ),

    entity: ($) =>
      seq(
        $.identifier,
        repeat(seq(alias($.module_separator, "::"), $.identifier)),
      ),

    arguments: ($) => commaSep1($.argument),

    parenthesized_arguments: ($) =>
      prec.dynamic(
        1,
        seq(
          "(",
          repeat1("\n"),
          commaSep1($.argument),
          optional(seq(repeat("\n"), ",")),
          repeat("\n"),
          ")",
        ),
      ),

    // Arguments can be expressions or assignments (for named arguments)
    argument: ($) =>
      choice(
        $.assignment, // Named argument: foo=bar (when in argument position)
        $.expression,
      ),

    expression: ($) =>
      prec.left(
        choice(
          $.binary_expression,
          $.unary_expression,
          $.member_expression,
          $.index_expression,
          $.call_expression,
          $.lambda_expression,
          $.primary_expression,
        ),
      ),

    primary_expression: ($) =>
      choice(
        $.literal,
        $.format_expr,
        $.identifier,
        $.dollar_var,
        $.meta_selector,
        KEYWORD.THIS,
        BUILTIN._,
        $.list,
        $.record,
        seq("(", repeat("\n"), $.expression, repeat("\n"), ")"),
      ),

    literal: ($) =>
      choice(
        NULL_LITERAL,
        BOOLEAN.TRUE,
        BOOLEAN.FALSE,
        $.number,
        $.string,
        $.ip,
        $.subnet,
        $.time,
        $.duration,
      ),

    // Binary expressions - allow newlines after operators for continuation
    binary_expression: ($) =>
      choice(
        // Lowest precedence: else (precedence 1)
        prec.left(
          1,
          seq($.expression, KEYWORD.ELSE, repeat("\n"), $.expression),
        ),
        // if has precedence 2
        prec.left(2, seq($.expression, KEYWORD.IF, repeat("\n"), $.expression)),
        prec.left(3, seq($.expression, KEYWORD.OR, repeat("\n"), $.expression)),
        prec.left(
          4,
          seq($.expression, KEYWORD.AND, repeat("\n"), $.expression),
        ),
        prec.left(
          6,
          seq(
            $.expression,
            choice("==", "!=", ">", ">=", "<", "<=", KEYWORD.IN),
            repeat("\n"),
            $.expression,
          ),
        ),
        // 'not in' is handled specially - parsed as 'not (x in y)'
        prec.left(
          6,
          seq(
            $.expression,
            seq(KEYWORD.NOT, KEYWORD.IN),
            repeat("\n"),
            $.expression,
          ),
        ),
        prec.left(
          7,
          seq($.expression, choice("+", "-"), repeat("\n"), $.expression),
        ),
        prec.left(
          8,
          seq($.expression, choice("*", "/"), repeat("\n"), $.expression),
        ),
      ),

    // Unary operators
    unary_expression: ($) =>
      choice(
        prec(5, seq(choice(KEYWORD.NOT, KEYWORD.MOVE), $.expression)),
        prec(9, seq(choice("+", "-"), $.expression)),
      ),

    // Member access
    member_expression: ($) =>
      prec.left(
        11,
        choice(
          seq($.expression, ".", $.identifier, optional("?")),
          seq($.expression, ".?", $.identifier),
        ),
      ),

    // Index access
    index_expression: ($) =>
      prec.left(11, seq($.expression, "[", $.expression, "]", optional("?"))),

    // Function calls
    call_expression: ($) =>
      choice(
        // Regular function call: foo()
        seq($.entity, "(", commaSep($.call_argument), repeat("\n"), ")"),
        // Method call (UFCS): a.b()
        prec(
          12,
          seq(
            field("receiver", $.expression),
            ".",
            field("method", $.entity),
            "(",
            commaSep($.call_argument),
            repeat("\n"),
            ")",
          ),
        ),
      ),

    // Arguments in function calls can be assignments or expressions
    call_argument: ($) =>
      seq(
        repeat("\n"),
        choice(
          $.assignment, // Named argument: foo=bar
          $.expression,
        ),
      ),

    format_expr: ($) =>
      seq(
        token(seq("f", '"')),
        repeat(choice($.format_text, $.format_replacement)),
        token.immediate('"'),
      ),

    format_text: ($) =>
      prec.right(
        repeat1(
          choice(
            token.immediate(/[^{"\\]+/),
            token.immediate("{{"),
            token.immediate("}}"),
            token.immediate(/\\./),
          ),
        ),
      ),

    format_replacement: ($) => seq("{", $.expression, "}"),

    // Lambda expression
    lambda_expression: ($) =>
      prec.right(2, seq($.identifier, "=>", $.expression)),

    list: ($) =>
      seq(
        "[",
        repeat("\n"),
        sep(
          choice($.expression, $.spread),
          seq(repeat("\n"), ",", repeat("\n")),
        ),
        optional(","),
        repeat("\n"),
        "]",
      ),

    record: ($) =>
      seq(
        "{",
        repeat("\n"),
        sep(
          choice($.record_field, $.spread),
          seq(repeat("\n"), ",", repeat("\n")),
        ),
        optional(","),
        repeat("\n"),
        "}",
      ),

    record_field: ($) =>
      seq(
        field("key", choice($.identifier, $.string)),
        ":",
        repeat("\n"),
        field("value", $.expression),
      ),

    spread: ($) => seq("...", $.expression),

    // Identifier - keywords are handled with higher precedence
    identifier: ($) => /[a-zA-Z_][a-zA-Z0-9_]*/,

    dollar_var: ($) =>
      seq(field("sigil", alias("$", $.global_sigil)), $.identifier),

    number: ($) =>
      token(
        seq(
          /\d+(?:_\d+)*/,
          optional(seq(".", /\d+(?:_\d+)*/)),
          optional(seq(/[eE]/, optional(choice("+", "-")), /\d+(?:_\d+)*/)),
          optional(
            choice(
              "k",
              "M",
              "G",
              "T",
              "P",
              "E",
              "Ki",
              "Mi",
              "Gi",
              "Ti",
              "Pi",
              "Ei",
            ),
          ),
        ),
      ),

    string: ($) =>
      choice(
        token(seq(optional("b"), '"', repeat(choice(/[^"\\]/, /\\./)), '"')),
        token(seq(optional("b"), "'", repeat(choice(/[^'\\]/, /\\./)), "'")),
        token(rawStringRegex("r")),
        token(rawStringRegex("br")),
      ),

    metadata_sigil: (_) => "@",

    global_sigil: (_) => "$",

    module_separator: (_) => token(prec(1, "::")),

    ip: ($) =>
      token(
        choice(
          // IPv4 address
          /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/,
          // IPv6 address - more restrictive pattern
          // Full form: 8 groups of 4 hex digits
          /([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}/,
          // Compressed forms with :: (must have multiple hex digits or colon groups)
          /::([0-9a-fA-F]{1,4}:)+[0-9a-fA-F]{1,4}/, // At least one group before the final segment
          /::[0-9a-fA-F]{2,4}/, // Or at least 2 hex digits after ::
          /([0-9a-fA-F]{1,4}:){1,7}:/,
          prec(-1, "::"), // IPv6 unspecified address
          // IPv4-mapped IPv6
          /::ffff:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/,
          // Other compressed forms
          /([0-9a-fA-F]{1,4}:){1,6}:([0-9a-fA-F]{1,4}:){0,5}[0-9a-fA-F]{1,4}/,
          /([0-9a-fA-F]{1,4}:){1,5}:([0-9a-fA-F]{1,4}:){0,4}[0-9a-fA-F]{1,4}/,
          /([0-9a-fA-F]{1,4}:){1,4}:([0-9a-fA-F]{1,4}:){0,3}[0-9a-fA-F]{1,4}/,
          /([0-9a-fA-F]{1,4}:){1,3}:([0-9a-fA-F]{1,4}:){0,2}[0-9a-fA-F]{1,4}/,
          /([0-9a-fA-F]{1,4}:){1,2}:([0-9a-fA-F]{1,4}:)?[0-9a-fA-F]{1,4}/,
          /::1/, // localhost special case
        ),
      ),

    subnet: ($) =>
      prec(
        10,
        choice(
          // IPv4 subnet
          /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\/\d{1,2}/,
          // IPv6 subnet (simplified patterns)
          /::\/\d{1,3}/,
          /::ffff:[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\/\d{1,3}/,
          /[0-9a-fA-F:]+\/\d{1,3}/,
        ),
      ),

    time: ($) =>
      token(
        seq(
          /\d{4}-\d{2}-\d{2}/,
          optional(
            seq(
              "T",
              /\d{2}:\d{2}:\d{2}/,
              optional(seq(".", /\d{1,9}/)),
              optional(choice("Z", seq(/[+-]\d{2}:\d{2}/))),
            ),
          ),
        ),
      ),

    duration: ($) =>
      /\d+(ns|us|ms|s|sec|seconds?|m|min|minutes?|h|hr|hours?|d|days?|w|weeks?|y|years?)/,
  },
});

module.exports.highlightConstants = {
  KEYWORDS,
  BUILTIN_VARIABLES,
  BOOLEAN_LITERALS,
  NULL_LITERAL,
  NODE_CAPTURES: HIGHLIGHT_NODE_CAPTURES,
  STRUCTURAL_PATTERNS: HIGHLIGHT_STRUCTURAL_PATTERNS,
  PUNCTUATION_BRACKETS,
  PUNCTUATION_DELIMITERS,
  OPERATORS,
  ARITHMETIC_OPERATORS,
};

function literalEnum(literals) {
  return literals.reduce((acc, literal, index) => {
    let key = literal.toUpperCase().replace(/[^A-Z0-9_]+/g, "_");
    if (key.length === 0) {
      key = `LITERAL_${index}`;
    }
    while (Object.prototype.hasOwnProperty.call(acc, key)) {
      key = `${key}_${index}`;
    }
    acc[key] = literal;
    return acc;
  }, {});
}

function rawStringRegex(prefix, maxHashes = 8) {
  const variants = [];
  variants.push(`${prefix}"[^"]*"`);
  for (let i = 1; i <= maxHashes; i += 1) {
    const hashes = "#".repeat(i);
    const allowedQuotes = [];
    for (let k = 0; k < i; k += 1) {
      const innerHashes = "#".repeat(k);
      allowedQuotes.push(`"${innerHashes}[^#]`);
    }
    const baseChar = '[^\"]';
    const body = allowedQuotes.length
      ? `${baseChar}|${allowedQuotes.join("|")}`
      : baseChar;
    variants.push(`${prefix}${hashes}"(?:${body})*"${hashes}`);
  }
  return new RegExp(`(?:${variants.join("|")})`);
}

// Helper functions for common grammar patterns

// Zero or more occurrences of rule separated by separator
function sep(rule, separator) {
  return optional(sep1(rule, separator));
}

// One or more occurrences of rule separated by separator
function sep1(rule, separator) {
  return seq(rule, repeat(seq(separator, rule)));
}

// One or more occurrences with optional newlines after separator
function sep1_newline(rule, separator) {
  return seq(rule, repeat(seq(separator, repeat("\n"), rule)));
}

// Comma-separated list (zero or more)
function commaSep(rule) {
  return sep(rule, ",");
}

// Comma-separated list (one or more)
function commaSep1(rule) {
  return sep1_newline(rule, ",");
}

// Used for pipeline-style separators with multiple occurrences allowed
function separated(rule, separator) {
  return optional(separated1(rule, separator));
}

function separated1(rule, separator) {
  return seq(rule, repeat(seq(repeat1(separator), rule)));
}

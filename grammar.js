/**
 * @file The Tenzir Query Language (TQL) is a pipeline-style dataflow language.
 * @author Tenzir <engineering@tenzir.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

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
    [$.pipeline_block, $.pipeline_expr], // Both are '{' pipeline '}'
    [$.list], // Needed for if [ ... ] disambiguation
    [$.field_selector, $.primary_expression], // For 'this' ambiguity
  ],

  rules: {
    // Entry point - a TQL program
    program: ($) => seq(repeat("\n"), optional($.pipeline)),

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
          "let",
          field("name", $.dollar_var),
          "=",
          field("value", $.expression),
        ),
      ),

    if_statement: ($) =>
      prec(
        2,
        seq(
          "if",
          field("condition", $.expression),
          field("consequence", alias($.block, $.then_block)),
          optional(
            seq(
              "else",
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
          "match",
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
        optional(field("arguments", $.arguments)),
        optional($.pipeline_block),
      ),

    pipeline_block: ($) => seq("{", repeat("\n"), $.pipeline, "}"),

    block: ($) => seq("{", repeat("\n"), field("body", optional($.pipeline)), "}"),

    assignment: ($) =>
      prec.right(
        0,
        seq(field("left", $.selector), "=", field("right", $.expression)),
      ),

    selector: ($) => choice($.meta_selector, $.field_selector),

    // Meta selector - more flexible to allow any identifier after @
    meta_selector: ($) => seq("@", $.identifier),

    field_selector: ($) =>
      seq(
        optional(seq("this", ".")),
        $.identifier,
        repeat(seq(".", $.identifier)),
      ),

    entity: ($) => sep1($.identifier, "::"),

    arguments: ($) => commaSep1($.argument),

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
        $.identifier,
        $.dollar_var,
        "this",
        "_",
        $.list,
        $.record,
        $.pipeline_expr,
        seq("(", $.expression, ")"),
      ),

    literal: ($) =>
      choice(
        "null",
        "true",
        "false",
        $.number,
        $.string,
        $.ip,
        $.subnet,
        $.duration,
      ),

    // Binary expressions - allow newlines after operators for continuation
    binary_expression: ($) =>
      choice(
        // Lowest precedence: else (precedence 1)
        prec.left(1, seq($.expression, "else", repeat("\n"), $.expression)),
        // if has precedence 2
        prec.left(2, seq($.expression, "if", repeat("\n"), $.expression)),
        prec.left(3, seq($.expression, "or", repeat("\n"), $.expression)),
        prec.left(4, seq($.expression, "and", repeat("\n"), $.expression)),
        prec.left(
          6,
          seq(
            $.expression,
            choice("==", "!=", ">", ">=", "<", "<=", "in"),
            repeat("\n"),
            $.expression,
          ),
        ),
        // 'not in' is handled specially - parsed as 'not (x in y)'
        prec.left(
          6,
          seq($.expression, seq("not", "in"), repeat("\n"), $.expression),
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
        prec(5, seq("not", $.expression)),
        prec(9, seq(choice("+", "-"), $.expression)),
      ),

    // Member access
    member_expression: ($) =>
      prec.left(
        11,
        choice(
          seq($.expression, ".", $.identifier),
          seq($.expression, ".?", $.identifier),
        ),
      ),

    // Index access
    index_expression: ($) =>
      prec.left(11, seq($.expression, "[", $.expression, "]")),

    // Function calls
    call_expression: ($) =>
      choice(
        // Regular function call: foo()
        seq($.entity, "(", commaSep($.call_argument), ")"),
        // Method call (UFCS): a.b()
        prec(
          12,
          seq(
            field("receiver", $.expression),
            ".",
            field("method", $.entity),
            "(",
            commaSep($.call_argument),
            ")",
          ),
        ),
      ),

    // Arguments in function calls can be assignments or expressions
    call_argument: ($) =>
      choice(
        $.assignment, // Named argument: foo=bar
        $.expression,
      ),

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

    // Nested pipeline expression: { pipeline }
    pipeline_expr: ($) => seq("{", repeat("\n"), $.pipeline, repeat("\n"), "}"),

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

    dollar_var: ($) => /\$[a-zA-Z_][a-zA-Z0-9_]*/,

    number: ($) => /\d+(\.\d+)?([eE][+-]?\d+)?/,

    string: ($) =>
      choice(
        seq('"', repeat(choice(/[^"\\]+/, /\\./)), '"'),
        seq("'", repeat(choice(/[^'\\]+/, /\\./)), "'"),
      ),

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
          // Note: standalone :: removed to avoid conflict with module paths
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

    duration: ($) =>
      /\d+(ns|us|ms|s|sec|seconds?|m|min|minutes?|h|hr|hours?|d|days?|w|weeks?|y|years?)/,
  },
});

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

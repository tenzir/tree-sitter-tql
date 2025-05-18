/**
 * @file The Tenzir Query Language (TQL) is a pipeline-style dataflow language.
 * @author Tenzir <engineering@tenzir.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "tql",

  rules: {
    // TODO: add the actual grammar rules
    source_file: $ => "hello"
  }
});

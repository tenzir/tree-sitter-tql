# Tree-sitter TQL 🌳

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

This repository hosts the tree-sitter grammar for **TQL**, the [Tenzir Query
Language](https://docs.tenzir.com/explanations/language).

Features:

- 🚀 Complete syntax support for TQL pipelines, operators, and expressions
- 📝 Proper handling of significant newlines and pipe separators
- 🔢 Support for all TQL literal types, including strings, numbers, IP addresses,
  and durations
- 🔀 Control flow structures, including `if`, `else`, and `match`
- 📦 Module paths and function calls
- 💬 Line and block comments
- 🧠 Tree-sitter queries for highlights, indentation, folds, injections, and locals

## Usage

See the official Tenzir documentation for editor setup instructions:
[Set up syntax highlighting](https://docs.tenzir.com/guides/development/setup-syntax-highlighting).

### Queries

The grammar ships its queries in `queries/tql/`, with a copy in
`languages/tql/` for Zed. Editor integrations can rely on these captures:

- `highlights.scm`: standard highlight names, such as `@keyword`, `@string`,
  and `@comment`.
- `indents.scm`: `@indent`, `@outdent`, and `@indent.auto`, as described below.
- `folds.scm`: `@fold` on blocks, lists, records, and front matter.
- `injections.scm`: `@injection.content` with the `injection.language`
  property.
- `locals.scm`: `@local.scope` and `@local.definition` for lambda parameters.
- `brackets.scm`: `@open` and `@close` on the brackets of the same node, as in
  Zed.

In `indents.scm`, an `@indent` node indents the lines inside it by one level
and an `@outdent` token closes such a node, so a line that starts with it keeps
the indentation of the line that opened the node. Strings, format strings,
comments, and the body of front matter carry `@indent.auto`, as in
nvim-treesitter: their text is verbatim, so a line inside them keeps the
indentation of the line before. The YAML front matter injects the `yaml`
language into its body.

### Unterminated literals

A string, format string, or block comment without its closing delimiter runs to
the end of the input. It parses as a node of the same type as its closed form,
`string`, `format_expr`, or `comment`, so that editors keep highlighting it as a
string or comment while it is being typed. For example, `x = "hello` parses as
an assignment of a `string` that spans `"hello`. A format string without its
closing quote is a `format_expr` without children. An unterminated literal is
not an `ERROR` node; it ends at the end of the input without its closing
delimiter.

## Development

Contributions are welcome! 🎉

### Setup

1. Clone the repository and install dependencies:

   ```bash
   git clone https://github.com/tenzir/tree-sitter-tql
   cd tree-sitter-tql
   npm install
   npm exec -- lefthook install
   ```

2. Regenerate the parser (and highlights) when needed:

   ```bash
   npm run generate
   ```

> [!NOTE]
> Highlights, indentation, folding, and locals queries stay in sync because
> they are generated and committed alongside the parser. CI re-runs the
> generator and fails if the checked-in files would change, so always execute
> `npm run generate` after touching the grammar or related constants.

### Playground

To interactively test the grammar:

```bash
npm run start
# or
npx tree-sitter playground
```

This opens a web interface where you can input TQL code and see the parse tree
in real time.

## License

This project is licensed under the [MIT License](LICENSE).

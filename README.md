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

## Development

Contributions are welcome! 🎉

### Setup

1. Clone the repository and install dependencies:

   ```bash
   git clone https://github.com/tenzir/tree-sitter-tql
   cd tree-sitter-tql
   npm install
   npm exec lefthook -- install
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

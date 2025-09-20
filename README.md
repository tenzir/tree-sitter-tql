# Tree-sitter TQL

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This repository hosts the tree-sitter grammar for **TQL**, the [Tenzir Query Language](https://docs.tenzir.com/explanations/language).

Features:

- 🚀 Complete syntax support for TQL pipelines, operators, and expressions
- 📝 Proper handling of significant newlines and pipe separators
- 🔢 Support for all TQL literal types (strings, numbers, IPs, durations, etc.)
- 🔀 Control flow structures (if/else, match statements)
- 📦 Module paths and function calls
- 💬 Comments (line and block)

# Usage

## Node.js

```bash
pnpm add tree-sitter-tql
```

## Rust

Add to your `Cargo.toml`:

```toml
[dependencies]
tree-sitter = "0.22"
tree-sitter-tql = { git = "https://github.com/tenzir/tree-sitter-tql" }
```

## Neovim

Configure `nvim-treesitter` to install directly from this repository:

```lua
require('nvim-treesitter.parsers').get_parser_configs().tql = {
  install_info = {
    url = 'https://github.com/tenzir/tree-sitter-tql',
    files = { 'src/parser.c' },
  },
  filetype = 'tql',
}

require('nvim-treesitter.configs').setup {
  ensure_installed = { 'tql' },
  highlight = { enable = true },
}
```

Or using [lazy.nvim](https://github.com/folke/lazy.nvim):

```lua
{
  'nvim-treesitter/nvim-treesitter',
  opts = function(_, opts)
    require('nvim-treesitter.parsers').get_parser_configs().tql = {
      install_info = {
        url = 'https://github.com/tenzir/tree-sitter-tql',
        files = { 'src/parser.c' },
      },
      filetype = 'tql',
    }
    opts.ensure_installed = vim.list_extend(opts.ensure_installed or {}, { 'tql' })
  end,
}
```

# Development

Contributions are welcome! 🎉

## Setup

```bash
# Clone the repository
git clone https://github.com/tenzir/tree-sitter-tql
cd tree-sitter-tql

# Install dependencies
pnpm install

# Generate the parser
pnpm tree-sitter generate
```

> Tree-sitter CLI version: both local development and CI are pinned to `tree-sitter-cli@0.25.4`. Install that exact version (`pnpm add -g tree-sitter-cli@0.25.4` or use `npx tree-sitter@0.25.4`) before regenerating parser artifacts. When upgrading the CLI, update the workflows (`tree-sitter/setup-action/cli@v2` `version` input), regenerate `src/parser.c` and related files, and commit the changes together.

## Testing

The grammar includes a comprehensive test suite in the `test/corpus/` directory:

```bash
# Run all tests
pnpm tree-sitter test

# Run specific test
pnpm tree-sitter test --include "Simple assignment"

# Run tests from a specific file
pnpm tree-sitter test test/corpus/statements.txt

# Update test expectations
pnpm tree-sitter test --update
```

## Grammar Development

The grammar is defined in `grammar.js`. To regenerate the parser after grammar
changes:

```bash
pnpm tree-sitter generate
pnpm tree-sitter test
```

## Playground

To interactively test the grammar:

```bash
pnpm start
# or
pnpm tree-sitter playground
```

This opens a web interface where you can input TQL code and see the parse tree in real time.

## Contributing

Contributions are welcome! Please ensure:

1. All tests pass (`pnpm tree-sitter test`).
2. New features include test cases.
3. Grammar changes are documented.

## Continuous Integration

- GitHub Actions runs the `CI` workflow on pushes and pull requests touching the grammar, bindings, or examples.
- The matrix covers Linux, macOS, and Windows runners to exercise parser generation and binding smoke tests for Rust, Node.js, Python, Go, and Swift.
- Example pipelines in `examples/**` are parsed to provide quick coverage feedback.
- Scanner fuzzing is triggered automatically whenever `src/scanner.c` changes.

## Publishing

- Pushing a tag (for example `v0.2.0`) triggers the `Publish packages` workflow.
- The workflow generates a GitHub release with source and Wasm artifacts, then builds and publishes wheels and an sdist to PyPI.
- Configure a repository secret `PYPI_API_TOKEN` (optionally scoped to a `pypi` environment) containing an API token created at https://pypi.org/manage/account/token.
- Follow the [tree-sitter publishing guide](https://tree-sitter.github.io/tree-sitter/creating-parsers/6-publishing.html): update the version with `tree-sitter version`, commit, tag, and push the tag to run the release pipeline.
- npm and crates.io publishing steps can be added later by extending the workflow with `package-npm.yml` or `package-crates.yml` from [tree-sitter/workflows](https://github.com/tree-sitter/workflows).

# License

This project is licensed under the [MIT License](LICENSE).

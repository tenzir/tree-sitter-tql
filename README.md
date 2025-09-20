# Tree-sitter TQL

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This repository hosts the tree-sitter grammar for **TQL**, the [Tenzir Query Language](https://docs.tenzir.com/explanations/language).

## Features

- Complete syntax support for TQL pipelines, operators, and expressions
- Proper handling of significant newlines and pipe separators
- Support for all TQL literal types (strings, numbers, IPs, durations, etc.)
- Control flow structures (if/else, match statements)
- Module paths and function calls
- Comments (line and block)

## Installation

### Node.js

```bash
pnpm add tree-sitter-tql
```

### Rust

Add to your `Cargo.toml`:

```toml
[dependencies]
tree-sitter = "0.22"
tree-sitter-tql = { git = "https://github.com/tenzir/tree-sitter-tql" }
```

## Development

### Prerequisites

- Node.js (v16 or higher)
- pnpm (v8 or higher) - This project uses pnpm as its package manager
- tree-sitter CLI (`pnpm add -g tree-sitter-cli`)

### Setup

```bash
# Clone the repository
git clone https://github.com/tenzir/tree-sitter-tql
cd tree-sitter-tql

# Install dependencies
pnpm install

# Generate the parser
pnpm tree-sitter generate
```

### Testing

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

#### Test Organization

- `test/corpus/comments.txt` - Comment handling
- `test/corpus/expressions.txt` - Expression parsing and precedence
- `test/corpus/literals.txt` - All TQL literal types
- `test/corpus/statements.txt` - Statement types (let, if, match, assignments)
- `test/corpus/pipelines.txt` - Pipeline composition
- `test/corpus/real_world.txt` - Real-world TQL examples
- `test/corpus/tenzir_examples.txt` - Examples from Tenzir's test suite

### Grammar Development

The grammar is defined in `grammar.js`. Key design decisions:

1. **Significant Newlines**: Newlines are statement separators (like pipes) and are not included in `extras`
2. **Comment Handling**: Comments use `token(choice(...))` pattern to take lexer priority over the `/` operator
3. **Operator Precedence**: Follows the C++ parser implementation with 9 precedence levels
4. **Conflicts**: Only 2 necessary conflicts for lookahead disambiguation

To regenerate the parser after grammar changes:

```bash
pnpm tree-sitter generate
pnpm tree-sitter test
```

### Playground

To interactively test the grammar:

```bash
pnpm start
# or
pnpm tree-sitter playground
```

This opens a web interface where you can input TQL code and see the parse tree in real-time.

## Examples

### Basic Pipeline

```tql
from file, data.json
| where status == "active"
| select user, timestamp
| sort timestamp desc
```

### Control Flow

```tql
if severity == "critical" {
  alert
  exit 1
} else {
  log "Non-critical event"
}
```

### Complex Assignment

```tql
result = {
  total: count(),
  average: sum(value) / count(),
  items: collect(name)
}
```

## Language Support

### Editor Integration

- **Neovim**: Use [nvim-treesitter](https://github.com/nvim-treesitter/nvim-treesitter)
- **Emacs**: Use [tree-sitter-langs](https://github.com/emacs-tree-sitter/tree-sitter-langs)
- **VS Code**: Extension coming soon

### Neovim Setup

- Download the `tree-sitter-tql-<version>-bundle.tar.gz` asset from the latest GitHub release and extract it somewhere on your runtime path (e.g. `~/.local/share/nvim/site/pack/treesitter/start/tree-sitter-tql`).
- Point `nvim-treesitter` at the extracted files:

```lua
require('nvim-treesitter.parsers').get_parser_configs().tql = {
  install_info = {
    files = { 'src/parser.c', 'src/node-types.json' },
    url = '/absolute/path/to/tree-sitter-tql',
    branch = 'main',
  },
  filetype = 'tql',
}

require('nvim-treesitter.configs').setup {
  ensure_installed = { 'tql' },
  highlight = { enable = true },
}
```

- Alternatively, install directly from this repository with `:TSInstallFromGrammar https://github.com/tenzir/tree-sitter-tql` (requires a recent `nvim-treesitter`).
- We plan to upstream this configuration so it becomes available via `:TSInstall tql` once the grammar stabilises.

### Syntax Highlighting

The grammar provides detailed node types suitable for syntax highlighting:

- Keywords: `if`, `else`, `match`, `let`
- Operators: `and`, `or`, `not`, `in`
- Literals: strings, numbers, booleans, IPs, durations
- Comments: line (`//`) and block (`/* */`)
- Identifiers and module paths

## Contributing

Contributions are welcome! Please ensure:

1. All tests pass (`pnpm tree-sitter test`)
2. New features include test cases
3. Grammar changes are documented

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

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Based on the [Tenzir](https://tenzir.com) Query Language specification
- Grammar design inspired by tree-sitter grammars for JavaScript and Rust
- Test cases derived from Tenzir's comprehensive test suite

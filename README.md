# Tree-sitter TQL 🌳

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

This repository hosts the tree-sitter grammar for **TQL**, the [Tenzir Query Language](https://docs.tenzir.com/explanations/language).

Features:

- 🚀 Complete syntax support for TQL pipelines, operators, and expressions
- 📝 Proper handling of significant newlines and pipe separators
- 🔢 Support for all TQL literal types (strings, numbers, IPs, durations, etc.)
- 🔀 Control flow structures (if/else, match statements)
- 📦 Module paths and function calls
- 💬 Comments (line and block)
- 📏 Indentation guidance for braces, pipelines, and collections via Tree-sitter indent queries
- 🔻 Folding queries for blocks, match statements, and collection literals

# Usage

## Zed

The [tenzir/zed-tql](https://github.com/tenzir/zed-tql) extension bundles the
latest highlights and parser for TQL. Install it from the repository or through
the Zed extensions view.

## Neovim

Lazy.nvim example that registers the parser and filetype. Tree-sitter queries
(highlights, indents, folds) ship in `queries/tql`, so no extra build step is
required:

<details>
<summary>Lazy.nvim example</summary>

```lua
return {
  'nvim-treesitter/nvim-treesitter',
  build = ':TSUpdate',
  dependencies = {
    'tenzir/tree-sitter-tql',
  },
  opts = function(_, opts)
    opts.ensure_installed = {
      'bash',
      'c',
      'comment',
      'cpp',
      'fish',
      'json',
      'lua',
      'markdown',
      'python',
      'r',
      'tql',
      'yaml',
    }

    opts.highlight = {
      enable = true,
      additional_vim_regex_highlighting = true,
    }

    opts.incremental_selection = {
      enable = true,
      keymaps = {
        init_selection = '<CR>',
        scope_incremental = '<CR>',
        node_incremental = '<TAB>',
        node_decremental = '<S-TAB>',
      },
    }

    return opts
  end,
  config = function(_, opts)
    local parser_config = require('nvim-treesitter.parsers').get_parser_configs()
    parser_config.tql = {
      install_info = {
        url = 'https://github.com/tenzir/tree-sitter-tql',
        files = { 'src/parser.c' },
        branch = 'main',
      },
      filetype = 'tql',
    }

    require('nvim-treesitter.configs').setup(opts)
    vim.filetype.add({ extension = { tql = 'tql' } })
  end,
}
```

</details>

# Development

Contributions are welcome! 🎉

## Setup

1. Clone the repository and install dependencies:

   ```bash
   git clone https://github.com/tenzir/tree-sitter-tql
   cd tree-sitter-tql
   npm install
   ```

2. Regenerate the parser (and highlights) when needed:

   ```bash
   npm run generate
   ```

> [!NOTE]
> Highlights, indentation, and folding queries stay in sync because they are
> generated and committed alongside the parser. CI re-runs the generator and
> fails if the checked-in files would change, so always execute
> `npm run generate` after touching the grammar or related constants.

## Testing

The grammar includes a comprehensive test suite in the `test/corpus/` directory:

1. Run all tests: `npx tree-sitter test`
2. Run a specific test: `npx tree-sitter test --include "Simple assignment"`
3. Run a test corpus file: `npx tree-sitter test test/corpus/statements.txt`
4. Update expectations: `npx tree-sitter test --update`
5. Run Node binding tests: `npm test`

## Grammar Development

The grammar is defined in `grammar.js`. To regenerate the parser after grammar
changes:

```bash
npx tree-sitter generate
npx tree-sitter test
```

## Playground

To interactively test the grammar:

```bash
npm run start
# or
npx tree-sitter playground
```

This opens a web interface where you can input TQL code and see the parse tree in real time.

## Contributing

Contributions are welcome! Please ensure:

1. All tests pass (`npx tree-sitter test`).
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

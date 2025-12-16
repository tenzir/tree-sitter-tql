# Claude Code Instructions

Project-specific instructions for Claude Code in this repository.

## Project Overview

Tree-sitter grammar for the Tenzir Query Language (TQL), a pipeline-style
dataflow language. Grammar changes must mirror the AST emitted by
`tenzir --dump-ast '<pipeline>'`—use this as ground truth.

## Key Files

- `grammar.js` — authoritative grammar definition; edit here
- `src/` — generated artifacts; never hand-edit
- `test/corpus/*.txt` — test fixtures with expected ASTs
- `bindings/` — language bindings (C, Node, Rust, Python, Go, Swift)
- `queries/` — highlight, indent, fold, and injection queries

## Development Workflow

```bash
# 1. Edit grammar.js
# 2. Regenerate parser and queries
npm run generate

# 3. Run tests
npx tree-sitter test              # all tests
npx tree-sitter test --include X  # specific test

# 4. Interactive playground
npm run start
```

Verify AST expectations: `tenzir --dump-ast '<pipeline>'`

## Version Bumping

When releasing, use `tree-sitter version` to bump all version files at once:

```bash
npx tree-sitter version <VERSION>  # e.g., 1.0.1
npm run generate                    # regenerate parser with new version
npx tree-sitter test                # verify tests pass
```

This updates `package.json`, `Cargo.toml`, `pyproject.toml`, and
`tree-sitter.json` in a single command. Do not manually edit version strings.

## Style

- 2-space indentation; run `npx prettier --write grammar.js` if needed
- Grammar rules: `lower_snake_case`; shared tokens: `ALL_CAPS`
- Do not hand-edit generated query files; run `npm run generate`

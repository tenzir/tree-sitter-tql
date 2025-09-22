# Repository Guidelines

This file contains AI agent guidelines for contributing to the Tenzir
tree-sitter grammar repository.

## Project Overview

- Tree-sitter grammar for the Tenzir Query Language (TQL), a pipeline-style
  dataflow language.
- Grammar changes must mirror the AST emitted by `tenzir --dump-ast '<pipeline>'`.
- Highlight-related constants exported from `grammar.js` feed editor tooling;
  regenerate downstream artifacts instead of touching generated files.

## Project Structure & Module Organization

- `grammar.js` holds the authoritative tree-sitter DSL; edit grammar logic here.
- Regenerated artifacts land in `src/`; treat them as build outputs and never
  hand-edit.
- `test/corpus/*.txt` contain fixtures with `==================` titles and
  `---` AST blocks that mirror canonical parse trees.
- `bindings/` offers consumers for C, Node, Rust, Python, Go, and Swift; keep
  changes aligned with the generated parser.
- `examples/` stores reference TQL programs.

## Development Workflow

1. Edit `grammar.js` to add or adjust syntax rules.
2. Run `pnpm run generate` to refresh `src/` artifacts and regenerate highlight queries.
3. Execute `pnpm tree-sitter test` (optionally scoped with `--include`).
4. Open the playground via `pnpm start` for interactive validation.

## Highlight Generation

- `scripts/generate-highlights.mjs` builds both `languages/tql/highlights.scm`
  (for Zed and other consumers) and `queries/tql/highlights.scm` (for
  tree-sitter runtime use) from the exported `highlightConstants`. Run it via
  `pnpm run generate` whenever those constants change.
- The `Update Zed Extension` workflow invokes the script and syncs the Zed
  grammar; keep the script and exports in lockstep with grammar changes.
- Do not hand-edit generated highlight files; regenerate them through the
  script.

## Build, Test & Development Commands

- `pnpm install`: install dependencies, including `tree-sitter-cli@0.25.x`.
- `pnpm run generate`: refresh `src/parser.c`, `src/scanner.c`, and regenerate
  highlight queries after grammar edits.
- `pnpm tree-sitter test [--include "Case" | --update]`: run corpus tests
  selectively or regenerate expectations.
- `pnpm test`: execute Node binding smoke tests via `node --test`.
- `pnpm start`: open the tree-sitter playground; `tenzir --dump-ast '<pipeline>'`
  supplies ground-truth ASTs.

## Coding Style & Naming Conventions

- Follow 2-space indentation and the spacing emitted by Prettier; wrap long
  alternatives for readability.
- Run `pnpm exec prettier --check grammar.js test/corpus` and fix issues with
  `--write` when needed.
- Name grammar rules in lower_snake_case, reserve ALL_CAPS for shared tokens,
  and keep helper comments focused on ambiguity or precedence.
- Markdown follows `markdownlint-cli`; aim for ~80-character prose lines.

## Testing Guidelines

- Expand coverage by adding corpus blocks that pair real pipelines with expected
  ASTs; include edge cases and regressions.
- Use narrow `--include` runs while iterating, then run the full suite before
  pushing.
- Validate tricky constructs against `tenzir --dump-ast` and annotate
  intentional differences inside the corpus file.

## Continuous Integration

- GitHub Actions runs CI on pushes and PRs touching grammar, bindings, examples,
  or workflows across Linux, macOS, and Windows runners.
- The suite validates queries (when present), runs Rust, Python, and Go binding
  tests, and parses sample pipelines under `examples/**`.
- Scanner fuzzing triggers automatically when `src/scanner.c` changes; address
  new findings before merging.

## Publishing

- Tagging a release (for example `v0.2.0`) launches the `Publish packages`
  workflow that builds bundles, uploads Wasm artifacts, and publishes to PyPI.
- Ensure `tree-sitter version` reflects the release, commit the version bump,
  tag, and push the tag.
- Provide a `PYPI_API_TOKEN` secret for PyPI publication; npm and crates.io
  steps can be added later via upstream workflows.

## Commit & Pull Request Guidelines

- All tests must pass before performing a commit.
- Adopt short, imperative commit subjects (e.g., `Add SI literal support`) and
  group grammar, generated files, and fixtures together.
- Summaries should call out observable syntax or AST changes and link issues or
  specs when relevant.
- List the commands you executed (typically `pnpm tree-sitter generate` and
  `pnpm tree-sitter test`) in the PR body.
- Ensure CI is green before requesting review; re-run local tests after rebases
  or merges.

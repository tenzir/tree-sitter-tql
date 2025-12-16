# Repository Guidelines

This file contains AI agent guidelines for contributing to the Tenzir
tree-sitter grammar repository.

## Project Overview

- Tree-sitter grammar for the Tenzir Query Language (TQL), a pipeline-style
  dataflow language.
- Grammar changes must mirror the AST emitted by
  `tenzir --dump-ast '<pipeline>'`. Use this command as the ground truth when
  shaping grammar updates and authoring test expectations.
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
2. Run `npm run generate` to refresh `src/` artifacts and regenerate highlight
   queries (alias: `npx tree-sitter generate`).
3. Execute `npx tree-sitter test` (optionally scoped with `--include`).
4. Open the playground via `npm run start` for interactive validation.

For any pipeline under test, you can confirm the expected AST via:

```bash
tenzir --dump-ast '<pipeline>'
```

## Query Generation

- `scripts/generate-highlights.mjs` builds both `languages/tql/highlights.scm`
  (for Zed and other consumers) and `queries/tql/highlights.scm` (for
  tree-sitter runtime use) from the exported `highlightConstants`.
- `scripts/generate-injections.mjs` keeps the YAML frontmatter injection query
  in sync across `languages/` and `queries/`.
- `scripts/generate-indents.mjs` derives indentation queries from
  `indentConstants` in `grammar.js`, so always regenerate after adjusting the
  related grammar metadata.
- `scripts/generate-folds.mjs` emits folding queries for blocks, match
  statements, and collection literals based on `foldConstants`.
- `scripts/generate-locals.mjs` emits locals queries for lexical bindings
  defined in `localConstants` (currently lambda parameters).
- The `Update Zed Extension` workflow copies all committed query artifacts into
  the downstream repository; keep the scripts and exported constants in lockstep
  with grammar changes.
- Do not hand-edit generated query files; run `npm run generate` to refresh
  them.

## Build, Test & Development Commands

- `npm install`: install dependencies, including `tree-sitter-cli@0.25.x`.
- `npm run generate`: refresh `src/parser.c`, `src/scanner.c`, and regenerate
  highlight queries after grammar edits.
- `npx tree-sitter test [--include "Case" | --update]`: run corpus tests
  selectively or regenerate expectations.
- `npm test`: execute Node binding smoke tests via `node --test`.
- `npm run start`: open the tree-sitter playground;
  `tenzir --dump-ast '<pipeline>'` supplies ground-truth ASTs.

## Coding Style & Naming Conventions

- Follow 2-space indentation and the spacing emitted by Prettier; wrap long
  alternatives for readability.
- Run `npx prettier --check grammar.js test/corpus` and fix issues with
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

- Tagging a release (for example `v0.3.0`) launches the `Publish packages`
  workflow that:
  - Creates a GitHub release with source bundles and WASM artifacts
  - Builds prebuilt native binaries for Linux, macOS (x64 + arm64), and Windows
  - Publishes to npm with OIDC trusted publishing and provenance attestations
  - Publishes Python wheels to PyPI
- Before tagging, bump the version everywhere (`package.json`, `Cargo.toml`,
  `tree-sitter.json`, etc.), run `npm run generate`, and commit the regenerated
  artifacts—this ensures `src/parser.c` embeds the matching
  `metadata.minor_version`.
- Run `npx tree-sitter test` (and any binding smoke tests) after regeneration,
  then push the commit and wait for CI to turn green. Only create the tag once
  the release commit has landed on `main` with a clean worktree.
- Required secrets: `PYPI_API_TOKEN` for PyPI. npm uses OIDC trusted publishing
  (no token required—configured at npmjs.com/package/tree-sitter-tql/access).

## Commit & Pull Request Guidelines

- All tests must pass before performing a commit.
- Adopt short, imperative commit subjects (e.g., `Add SI literal support`) and
  group grammar, generated files, and fixtures together.
- Summaries should call out observable syntax or AST changes and link issues or
  specs when relevant.
- List the commands you executed (typically `npx tree-sitter generate` and
  `npx tree-sitter test`) in the PR body.
- Ensure CI is green before requesting review; re-run local tests after rebases
  or merges.

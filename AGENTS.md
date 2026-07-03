# Tree-sitter TQL

This repository holds the tree-sitter grammar for the Tenzir Query Language
(TQL).

## Development

The `.node-version` file is the single repo-wide source for the Node.js version.

The grammar is defined in `grammar.js`. To regenerate the parser after grammar
changes:

```bash
npx tree-sitter generate
npx tree-sitter test
```

Use `tenzir-ship` to manage the `changelog/` directory.

Cut releases with the `.github/workflows/release.yaml` workflow.

### Testing

The grammar includes a comprehensive test suite in the `test/corpus/` directory:

1. Run the fast quality gate: `npm run check`
2. Apply formatting and generated-file updates: `npm run fix`
3. Run all grammar tests: `npx tree-sitter test`
4. Run a specific test: `npx tree-sitter test --include "Simple assignment"`
5. Run a test corpus file: `npx tree-sitter test test/corpus/statements.txt`
6. Update expectations: `npx tree-sitter test --update`
7. Run Node binding tests: `npm test`

For manual sanity checks, run `tenzir --dump-ast "<pipeline>"`.

### Update documentation

User-facing documentation lives in the git-ignored `.docs/` directory, which is
an optional clone of the `tenzir/content` repository.

When changing existing behavior or adding user-facing functionality, update
`.docs/website/src/content/docs/`, create a topic branch there, and open a
companion PR against `tenzir/content`.

Skip this process for internal refactorings that do not affect the user-facing
TQL surface or command line tools.

# CLAUDE.md

This file provides guidance to [Claude Code](claude.ai/code) when working with
code in this repository.

## Project Overview

Tree-sitter grammar for the **Tenzir Query Language (TQL)** - a pipeline-style
dataflow language.

## Development Workflow

1. **Edit grammar**: Modify `grammar.js` to add/change language rules
2. **Generate parser**: Run `pnpm tree-sitter generate`
3. **Test changes**: Run `pnpm tree-sitter test`
4. **Verify interactively**: Run `pnpm start` to open playground

For any TQL program, you can get its authoritative AST by running:

```bash
tenzir --dump-ast '<pipeline>'
```

This gives you the EXACT AST structure that the tree-sitter grammar should
produce. Use this as the ground truth when writing test expectations!

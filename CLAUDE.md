# CLAUDE.md

This file provides guidance to [Claude Code](claude.ai/code) when working with
code in this repository.

## Project Overview

Tree-sitter grammar for the **Tenzir Query Language (TQL)** - a pipeline-style dataflow language.

## Development Workflow

1. **Edit grammar**: Modify `grammar.js` to add/change language rules
2. **Generate parser**: Run `pnpm tree-sitter generate`
3. **Test changes**: Run `pnpm tree-sitter test`
4. **Verify interactively**: Run `pnpm start` to open playground

## Testing Commands

```bash
# Test grammar changes
pnpm tree-sitter test

# Interactive testing playground
pnpm start

# Node.js binding tests
pnpm test
```

## Key Files

- **grammar.js**: Edit this to modify the language grammar
- **test/corpus/**: Add test cases here to verify grammar changes

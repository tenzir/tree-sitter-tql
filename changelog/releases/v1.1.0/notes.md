This release expands Tree-sitter TQL parsing with match statement pattern syntax and adds a shared local quality gate for contributors.

## 🚀 Features

### Match statement pattern syntax

The TQL grammar now parses the documented `match` statement pattern syntax, including alternatives, guards, ranges, and wildcard arms:

```tql
match status {
  499..600 | 429 if retries > 0 => {
    action = "retry"
  }
  _ => {}
}
```

This improves editor parsing and highlighting for pipelines that use the new `match` control-flow statement.

*By @mavam and @codex in #2.*

### Shared local quality gate

Developers can run the same fast local quality gate used by CI with `npm run check`:

```sh
npm run check
```

Use `npm run fix` to refresh generated parser and editor-query artifacts before committing.

*By @mavam and @codex.*

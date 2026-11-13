---
title: Bracket pairs and verbatim indentation in editor queries
type: feature
authors:
  - mavam
prs:
  - 13
created: 2026-11-13T07:32:39.836597Z
---

The grammar now ships a `brackets.scm` query that pairs `( )`, `[ ]`, and `{ }` with `@open` and `@close` captures, as Zed expects:

```scheme
("(" @open ")" @close)
```

The `indents.scm` query also marks strings, format strings, comments, and the body of front matter with `@indent.auto`, the nvim-treesitter convention for text that keeps the indentation of the line before, as it is taken verbatim.

---
title: Bracket pairs and verbatim indentation in editor queries
type: feature
authors:
  - mavam
prs:
  - 13
created: 2026-11-13T07:32:39.836597Z
---

The grammar now ships a `brackets.scm` query that marks matching `( )`, `[ ]`, and `{ }` pairs with `@open` and `@close` captures:

```scheme
("(" @open ")" @close)
```

The `indents.scm` query also marks strings, the text of format strings, comments, and the body of front matter with `@indent.auto`, so a new line inside them keeps the indentation of the line before. Replacements in format strings keep their structural indentation.

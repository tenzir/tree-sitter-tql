---
title: Plain brackets in highlighting
type: change
authors:
  - jachris
prs:
  - 17
created: 2026-11-17T14:21:00.282057Z
---

Brackets and braces of lists, records, and blocks now highlight as punctuation instead of keywords, so editors no longer color them like `let` or `and`:

```tql
let $r = {xs: [1, 2], s: f"a{x}b"}
```

The braces around an expression in a format string take `@punctuation.special`, so the expression still stands out of the string.

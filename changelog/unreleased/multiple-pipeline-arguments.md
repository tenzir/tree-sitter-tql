---
title: Multiple pipeline arguments
type: feature
authors:
  - aljazerzen
prs:
  - 8
created: 2026-08-12T12:30:00.000000Z
---

Operators can now take multiple pipeline arguments separated by commas, as
required by operators such as `fork_merge`:

```tql
fork_merge {
  head 1
}, {
  tail 1
}
```

Previously, only a single `{ … }` pipeline argument parsed correctly, and
pipelines using more than one produced a syntax error.

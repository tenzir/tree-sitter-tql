---
title: Optional access on top-level fields
type: bugfix
authors:
  - mavam
prs:
  - 11
created: 2026-11-12T12:47:30.837711Z
---

A trailing `?` on a top-level field now parses, matching the engine's optional field access:

```tql
where src_endpoint?.ip? != null
sort -key?, secondary?
select name=attributes?["event.name"]? else name?
```

Previously, the suffix only worked after member and index accesses such as `x.y?` or `x[0]?`, and a bare `x?` produced error nodes in the syntax tree.

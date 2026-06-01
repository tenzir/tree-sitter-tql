---
title: Match statement pattern syntax
type: feature
authors:
  - mavam
  - codex
prs:
  - 2
created: 2026-05-31T16:30:27.081808Z
---

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

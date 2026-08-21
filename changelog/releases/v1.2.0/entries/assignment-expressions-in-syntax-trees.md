---
title: Assignment expressions in syntax trees
type: bugfix
authors:
  - mavam
prs:
  - 10
created: 2026-08-21T09:10:25.976025Z
---

Assignments now parse in expression contexts such as conditions:

```tql
if ($x = 42) {
}
```

This keeps syntax trees aligned with the TQL engine instead of producing recovery nodes for valid assignment expressions.

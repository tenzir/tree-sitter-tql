---
title: Package dollar variable parsing
type: bugfix
authors:
  - mavam
prs:
  - 9
created: 2026-08-21T06:35:54.437974Z
---

Package operator bodies now parse dollar-prefixed assignment targets, package constants, and trailing function-call commas without recovery errors:

```tql
$into = $log.parse_ssv(
  header=amazon::$header,
)
```

Syntax highlighters can now color `$into` as one variable when it appears on the left-hand side of an assignment.

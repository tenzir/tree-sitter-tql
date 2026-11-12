---
title: Parsing of durations, raw strings, pipeline values, and lambdas
type: bugfix
authors:
  - mavam
prs:
  - 11
created: 2026-11-12T12:47:32.110319Z
---

More valid TQL now parses without error nodes:

- Fractional and calendar durations, such as `1.5s`, `0.5y`, and `1mo`.
- Raw strings that end in a quote, such as `r#""53""#`.
- Pipelines as values, such as `let $p = { from {x: 1} }` or `cron "* * * * *", { … }`.
- Lambdas with parenthesized parameters, such as `sort(xs, cmp=(l, r) => l < r)`.
- `else` on the line after the closing brace of an `if` block.

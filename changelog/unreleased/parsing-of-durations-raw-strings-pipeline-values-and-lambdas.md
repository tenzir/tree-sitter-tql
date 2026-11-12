---
title: Parsing of durations, raw strings, pipeline values, and lambdas
type: bugfix
authors:
  - mavam
prs:
  - 11
created: 2026-11-12T13:12:46.138525Z
---

More valid TQL now parses without error nodes:

- Fractional, scientific, and calendar durations, such as `1.5s`, `1e3s`, `0.5y`, and `1mo`.
- Raw strings that end in a quote, such as `r#""53""#`.
- Pipelines as values, such as `let $p = { from {x: 1} }` or `cron "* * * * *", { … }`, including as `match` patterns.
- Lambdas with parenthesized parameters, such as `sort(xs, cmp=(l, r) => l < r)`, including newlines around the `=>`.
- `else` on the line after the closing brace of an `if` block.
- The deprecated `.?` access combined with a trailing `?` or a method call, such as `a?.?b?` or `a.?b()`.

The grammar also rejects some syntax that the engine rejects: durations with `_` digit separators such as `1_000ms`, keywords and `_` as lambda parameters, and whitespace between an expression and its index, as in `a [0]`.

This release parses optional access on top-level fields such as `sort key?` and closes several smaller gaps with the engine's TQL parser, including scientific durations, pipeline values, and parenthesized lambdas.

## 🐞 Bug fixes

### Optional access on top-level fields

A trailing `?` on a top-level field now parses, matching the engine's optional field access:

```tql
where src_endpoint?.ip? != null
sort -key?, secondary?
select name=attributes?["event.name"]? else name?
```

Previously, the suffix only worked after member and index accesses such as `x.y?` or `x[0]?`, and a bare `x?` produced error nodes in the syntax tree.

*By @mavam in #11.*

### Parsing of durations, raw strings, pipeline values, and lambdas

More valid TQL now parses without error nodes:

- Fractional, scientific, and calendar durations, such as `1.5s`, `1e3s`, `0.5y`, and `1mo`.
- Raw strings that end in a quote, such as `r#""53""#`.
- Pipelines as values, such as `let $p = { from {x: 1} }` or `cron "* * * * *", { … }`, including as `match` patterns.
- Lambdas with parenthesized parameters, such as `sort(xs, cmp=(l, r) => l < r)`, including newlines around the `=>`.
- `else` on the line after the closing brace of an `if` block.
- The deprecated `.?` access combined with a trailing `?` or a method call, such as `a?.?b?` or `a.?b()`.

The grammar also rejects some syntax that the engine rejects: durations with `_` digit separators such as `1_000ms`, keywords and `_` as lambda parameters, and whitespace between an expression and its index, as in `a [0]`.

*By @mavam in #11.*

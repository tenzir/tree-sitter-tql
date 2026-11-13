This release parses hash-delimited byte strings such as `b#"…"#` like the engine does, drops single-quoted strings, which the engine never accepted, and ships bracket pairs to the Zed extension.

## 🔧 Changes

### Single-quoted strings rejected like in the engine

The grammar no longer parses single-quoted text such as `'abc'` as a string. TQL has no single-quoted strings, and the engine rejects them, so the grammar now reports them as errors instead of highlighting them as valid strings.

*By @mavam in #16.*

## 🐞 Bug fixes

### Bracket pairs in the Zed extension

The Zed extension now receives the grammar's bracket pairs, so Zed matches `( )`, `[ ]`, and `{ }` by syntax.

*By @mavam in #16.*

### Byte strings with hashes

Byte strings with hashes before the opening quote now parse as strings, closed or unterminated:

```tql
x = b#"a")"#
x = b##"q"#"##
```

Like raw strings, they close at the first quote followed by as many hashes as they opened with and support up to 8 hashes. Unlike raw strings, they process escapes, so `\"` never closes them. Previously, such a literal produced an error, and the quotes and brackets after it paired incorrectly.

*By @mavam in #16.*

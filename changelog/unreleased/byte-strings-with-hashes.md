---
title: Byte strings with hashes
type: bugfix
authors:
  - mavam
prs:
  - 16
created: 2026-11-13T15:40:54.646933Z
---

Byte strings with hashes before the opening quote now parse as strings, closed or unterminated:

```tql
x = b#"a")"#
x = b##"q"#"##
```

Like raw strings, they close at the first quote followed by as many hashes as they opened with and support up to 8 hashes. Unlike raw strings, they process escapes, so `\"` never closes them. Previously, such a literal produced an error, and the quotes and brackets after it paired incorrectly.

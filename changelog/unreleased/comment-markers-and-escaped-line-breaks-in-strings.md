---
title: Comment markers and escaped line breaks in strings
type: bugfix
authors:
  - mavam
created: 2026-11-13T07:32:40.820315Z
---

Comment markers in the text of a format string no longer start a comment. Previously, `f"{a}// b"` parsed `// b"` as a comment and missed the closing quote.

Strings and format strings may also contain a backslash before a line break, as the engine accepts:

```tql
x = "first \
second"
```

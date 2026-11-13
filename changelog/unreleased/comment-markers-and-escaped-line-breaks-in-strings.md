---
title: Comment markers in format strings and backslashes before line breaks
type: bugfix
authors:
  - mavam
prs:
  - 13
created: 2026-11-13T07:32:40.820315Z
---

Comment markers in the text of a format string no longer start a comment. Previously, `f"{a}// b"` parsed `// b"` as a comment and missed the closing quote.

A string or format string with a backslash before a line break now parses as one string, so editors highlight it as such. Previously, its opening quote became an error and its text parsed as code. This is error recovery, not valid TQL: the engine reads the string as a whole but rejects the escape sequence, as it rejects other unknown escapes such as `\q`.

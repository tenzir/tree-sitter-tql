---
title: Unterminated strings and comments while typing
type: feature
authors:
  - mavam
prs:
  - 13
created: 2026-11-13T07:32:38.97924Z
---

Strings, format strings, and block comments without their closing delimiter now run to the end of the input instead of breaking the rest of the syntax tree. While you type `x = "hello`, `x = r#"abc`, `x = f"a {b("c`, or `x = /* c`, editors keep highlighting the literal as a string or comment instead of showing an error at the opening quote followed by code.

An unterminated literal parses as a node of the same type as its closed form: `string`, `format_expr`, or `comment`. A format string without its closing quote is a `format_expr` without children. Closed literals parse as before.

This release parses unterminated strings, format strings, and comments as literals that run to the end of the input, so editors keep highlighting correctly while you type, and adds bracket and indentation queries for editor integrations.

## 🚀 Features

### Bracket pairs and verbatim indentation in editor queries

The grammar now ships a `brackets.scm` query that marks matching `( )`, `[ ]`, and `{ }` pairs with `@open` and `@close` captures:

```scheme
("(" @open ")" @close)
```

The `indents.scm` query also marks strings, the text of format strings, comments, and the body of front matter with `@indent.auto`, so a new line inside them keeps the indentation of the line before. Replacements in format strings keep their structural indentation.

*By @mavam in #13.*

### Unterminated strings and comments while typing

Strings, format strings, and block comments without their closing delimiter now run to the end of the input instead of breaking the rest of the syntax tree. While you type `x = "hello`, `x = r#"abc`, `x = f"a {b("c`, or `x = /* c`, editors keep highlighting the literal as a string or comment instead of showing an error at the opening quote followed by code.

An unterminated literal parses as a node of the same type as its closed form: `string`, `format_expr`, or `comment`. In a format string without its closing quote, everything after `f"` is a single `format_text`, unless more than 64 format strings nest in each other's replacements, which falls back to error recovery. Closed literals parse as before.

*By @mavam in #13.*

## 🐞 Bug fixes

### Comment markers in format strings and backslashes before line breaks

Comment markers in the text of a format string no longer start a comment. Previously, `f"{a}// b"` parsed `// b"` as a comment and missed the closing quote.

A string or format string with a backslash before a line break now parses as one string, so editors highlight it as such. Previously, its opening quote became an error and its text parsed as code. This is error recovery, not valid TQL: the engine reads the string as a whole but rejects the escape sequence, as it rejects other unknown escapes such as `\q`.

*By @mavam in #13.*

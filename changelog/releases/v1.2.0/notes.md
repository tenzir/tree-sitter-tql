This release improves TQL parsing for multi-pipeline operators and assignments in expression and package contexts. It eliminates recovery nodes for several valid constructs, improving syntax-tree accuracy and highlighting.

## 🚀 Features

### Multiple pipeline arguments

Operators can now take multiple pipeline arguments separated by commas, as required by operators such as `fork_merge`:

```tql
fork_merge {
  head 1
}, {
  tail 1
}
```

Previously, only a single `{ … }` pipeline argument parsed correctly, and pipelines using more than one produced a syntax error.

*By @aljazerzen in #8.*

## 🐞 Bug fixes

### Assignment expressions in syntax trees

Assignments now parse in expression contexts such as conditions:

```tql
if ($x = 42) {
}
```

This keeps syntax trees aligned with the TQL engine instead of producing recovery nodes for valid assignment expressions.

*By @mavam in #10.*

### Package dollar variable parsing

Package operator bodies now parse dollar-prefixed assignment targets, package constants, and trailing function-call commas without recovery errors:

```tql
$into = $log.parse_ssv(
  header=amazon::$header,
)
```

Syntax highlighters can now color `$into` as one variable when it appears on the left-hand side of an assignment.

*By @mavam in #9.*

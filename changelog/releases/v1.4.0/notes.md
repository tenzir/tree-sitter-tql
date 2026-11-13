This release gives pipeline operators, times, durations, IP addresses, and subnets highlight captures of their own, so editor themes can color them apart from function calls and other literals.

## 🔧 Changes

### Distinct highlight captures for operators and typed literals

The highlight query now gives pipeline operators and typed literals captures of their own, so editor themes can color them independently:

| Syntax                           | Before           | After                |
| -------------------------------- | ---------------- | -------------------- |
| Operator names, such as `where`  | `@function.call` | `@function.operator` |
| Times, such as `2024-01-01`      | `@number`        | `@number.time`       |
| Durations, such as `5min`        | `@number`        | `@number.duration`   |
| IP addresses, such as `10.0.0.1` | `@constant`      | `@constant.ip`       |
| Subnets, such as `10.0.0.0/8`    | `@constant`      | `@constant.subnet`   |

Function and method calls keep `@function.call` and `@function.method`. Themes that do not style the new captures fall back to their parent capture, so operators take the `@function` color and the literals keep their previous colors.

*By @mavam in #15.*

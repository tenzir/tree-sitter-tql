---
title: Distinct highlight captures for operators and typed literals
type: change
authors:
  - mavam
created: 2026-11-13T14:47:58.835023Z
---

The highlight query now gives pipeline operators and typed literals captures of their own, so editor themes can color them independently:

| Syntax | Before | After |
| --- | --- | --- |
| Operator names, such as `where` | `@function.call` | `@function.operator` |
| Times, such as `2024-01-01` | `@number` | `@number.time` |
| Durations, such as `5min` | `@number` | `@number.duration` |
| IP addresses, such as `10.0.0.1` | `@constant` | `@constant.ip` |
| Subnets, such as `10.0.0.0/8` | `@constant` | `@constant.subnet` |

Function and method calls keep `@function.call` and `@function.method`. Themes that do not style the new captures fall back to their parent capture, so operators take the `@function` color and the literals keep their previous colors.

---
title: Single-quoted strings rejected like in the engine
type: change
authors:
  - mavam
prs:
  - 16
created: 2026-11-13T15:40:54.997155Z
---

The grammar no longer parses single-quoted text such as `'abc'` as a string. TQL has no single-quoted strings, and the engine rejects them, so the grammar now reports them as errors instead of highlighting them as valid strings.

---
title: Reliable release artifact generation
type: bugfix
authors:
  - mavam
  - codex
prs:
  - 6
created: 2026-07-18T06:33:25.83162Z
---

Release creation now installs the locked Tree-sitter CLI before regenerating parser artifacts. This prevents release workflows from failing with a `tree-sitter: not found` error.

---
title: Safer development tooling
type: bugfix
authors:
  - mavam
  - codex
prs:
  - 5
created: 2026-07-18T06:00:49.755401Z
---

Repository quality checks no longer rely on components with known denial-of-service and command-injection vulnerabilities when processing archives, YAML, Markdown, and file patterns.

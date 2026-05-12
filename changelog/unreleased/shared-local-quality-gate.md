---
title: Shared local quality gate
type: feature
authors:
  - mavam
  - codex
created: 2026-05-12T15:48:50.152045Z
---

Developers can run the same fast local quality gate used by CI with `npm run check`:

```sh
npm run check
```

Use `npm run fix` to refresh generated parser and editor-query artifacts before committing.

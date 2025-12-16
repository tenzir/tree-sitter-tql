---
title: Prebuilt native binaries and npm publishing with OIDC provenance
type: feature
authors:
  - mavam
  - claude
created: 2025-12-16T17:20:49.609437Z
---

The release workflow now builds prebuilt native binaries for Linux, macOS (x64 and arm64), and Windows, eliminating compilation for most npm users. Releases are published to npm using token-free OIDC trusted publishing with supply chain provenance attestations.

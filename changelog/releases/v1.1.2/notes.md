Tree-sitter TQL now uses the latest npm dependencies and removes all known npm audit vulnerabilities from its development toolchain.

## 🐞 Bug fixes

### Dependency security updates

Development tooling no longer includes the vulnerable package versions reported by `npm audit`, and every outdated npm dependency now uses its latest registry release.

| Dependency        | Previous | Current |
| ----------------- | -------: | ------: |
| `brace-expansion` |    5.0.7 |   5.0.9 |
| `js-yaml`         |    5.2.1 |   5.2.3 |
| `mdurl`           |    2.0.0 |   2.1.0 |
| `minimatch`       |   10.2.5 |  10.2.6 |
| `node-addon-api`  |    8.9.0 |   8.9.1 |
| `prettier`        |    3.9.5 |   3.9.6 |
| `smol-toml`       |    1.7.0 |   1.7.1 |
| `tar`             |   7.5.20 |  7.5.22 |
| `tree-sitter`     |   0.25.0 |  0.25.1 |
| `tree-sitter-cli` |   0.25.4 | 0.26.11 |
| `undici`          |    8.7.0 |  8.10.0 |

The updates resolve all nine advisories reported by `npm audit` across four transitive development dependencies, including all six open Dependabot alerts:

| Dependency        | Severity | Resolved security issue                                                                                                                                 |
| ----------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `brace-expansion` | High     | [CVE-2026-14257](https://github.com/advisories/GHSA-mh99-v99m-4gvg): Unbounded expansion can cause an out-of-memory denial of service.                  |
| `brace-expansion` | High     | [CVE-2026-69152](https://github.com/advisories/GHSA-rgw5-rvv9-x895): Unbounded intermediate arrays bypass the earlier denial-of-service mitigation.     |
| `js-yaml`         | High     | [GHSA-pm4m-ph32-ghv5](https://github.com/advisories/GHSA-pm4m-ph32-ghv5): Flow collections can trigger exponential parsing time.                        |
| `tar`             | Moderate | [GHSA-r292-9mhp-454m](https://github.com/advisories/GHSA-r292-9mhp-454m): Crafted long paths can cause an uncatchable stack-overflow denial of service. |
| `undici`          | Moderate | [CVE-2026-16728](https://github.com/advisories/GHSA-8xcm-r25x-g524): The retry interceptor can cause downstream response desynchronization.             |
| `undici`          | High     | [CVE-2026-13697](https://github.com/advisories/GHSA-4cwx-7wf7-3272): Degenerate private cache directives can disclose cross-user data or crash parsing. |
| `undici`          | Moderate | [CVE-2026-15157](https://github.com/advisories/GHSA-m8rv-5g2x-5cg5): A blob-like body `type` can inject CRLF characters.                                |
| `undici`          | Moderate | [CVE-2026-14643](https://github.com/advisories/GHSA-jr45-8vmc-qm54): Cache-Control whitespace can cause cross-user information disclosure.              |
| `undici`          | Moderate | [CVE-2026-16729](https://github.com/advisories/GHSA-v3r7-h72x-cjcm): Unsanitized cookie fields can inject cookie attributes.                            |

After the update, `npm audit` reports zero vulnerabilities and `npm outdated` reports no outdated direct dependencies.

*By @mavam and @codex in #7.*

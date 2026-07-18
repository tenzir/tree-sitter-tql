This release updates development dependencies to eliminate all known npm audit findings and seven Dependabot alerts, including a high-severity crafted-ZIP vulnerability. It also restores native Node.js builds on Windows runners with Visual Studio 2026.

## 🐞 Bug fixes

### Development dependency updates

Development tooling now uses the following dependency versions:

| Dependency                | Previous    | Current  |
| ------------------------- | ----------- | -------- |
| `@isaacs/brace-expansion` | `5.0.0`     | Removed  |
| `adm-zip`                 | `0.5.17`    | `0.6.0`  |
| `brace-expansion`         | Not present | `5.0.7`  |
| `glob`                    | `11.0.3`    | Removed  |
| `js-yaml`                 | `4.1.0`     | `5.2.1`  |
| `lefthook`                | `2.1.6`     | `2.1.10` |
| `linkify-it`              | `5.0.0`     | `5.0.2`  |
| `markdown-it`             | `14.1.0`    | `14.3.0` |
| `markdownlint`            | `0.38.0`    | `0.41.1` |
| `markdownlint-cli`        | `0.45.0`    | `0.49.1` |
| `minimatch`               | `10.0.3`    | `10.2.5` |
| `node-addon-api`          | `8.5.0`     | `8.9.0`  |
| `node-gyp`                | Not present | `13.0.1` |
| `prettier`                | `3.6.2`     | `3.9.5`  |
| `smol-toml`               | `1.3.4`     | `1.7.0`  |
| `tar`                     | `7.5.15`    | `7.5.20` |
| `tinyglobby`              | Not present | `0.2.17` |

The updates resolve all 11 findings from `npm audit` and all seven open Dependabot alerts. `adm-zip` 0.6.0 fixes the high-severity finding tracked by Dependabot alert 18, where a crafted ZIP archive can trigger a 4 GB memory allocation. The other security updates address archive smuggling, command injection, prototype pollution, regular expression denial of service, and resource-exhaustion issues across the archive, glob, Markdown, YAML, TOML, linkification, and brace-expansion tooling.

The direct `node-gyp` dependency also lets native Node.js bindings build on Windows runners with Visual Studio 2026.

*By @mavam and @codex in #5.*

### Reliable release artifact generation

Release creation now installs the locked Tree-sitter CLI before regenerating parser artifacts. This prevents release workflows from failing with a `tree-sitter: not found` error.

*By @mavam and @codex in #6.*

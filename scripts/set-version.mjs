#!/usr/bin/env node

import fs from "node:fs";

const input = process.argv[2];
const match = input?.match(/^v?(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)$/);

if (!match) {
  console.error("usage: scripts/set-version.mjs <vMAJOR.MINOR.PATCH>");
  process.exit(1);
}

const version = match[1];

function updateJson(path, update) {
  const data = JSON.parse(fs.readFileSync(path, "utf8"));
  update(data);
  fs.writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
}

function replace(path, pattern, replacement) {
  const input = fs.readFileSync(path, "utf8");
  if (!pattern.test(input)) {
    throw new Error(`failed to find version in ${path}`);
  }
  const output = input.replace(pattern, replacement);
  fs.writeFileSync(path, output);
}

updateJson("package.json", (data) => {
  data.version = version;
});

updateJson("package-lock.json", (data) => {
  data.version = version;
  data.packages[""].version = version;
});

replace(
  "tree-sitter.json",
  /("metadata"\s*:\s*\{[\s\S]*?"version"\s*:\s*")([^"]+)(")/,
  `$1${version}$3`,
);

replace(
  "Cargo.toml",
  /(^version\s*=\s*")([^"]+)(")/m,
  `$1${version}$3`,
);

replace(
  "pyproject.toml",
  /(^version\s*=\s*")([^"]+)(")/m,
  `$1${version}$3`,
);

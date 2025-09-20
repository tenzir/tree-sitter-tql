#!/bin/bash
# Auto-format hook for Claude edits

# Read stdin to get file path
stdin_data=$(cat)
FILE_PATH=$(echo "$stdin_data" | jq -r '.tool_input.file_path // .tool_output.file_path // empty' 2>/dev/null)

# Skip if no file path
[[ -z "$FILE_PATH" ]] && exit 0

# Run prettier
if [[ "$FILE_PATH" =~ \.(js|mjs|cjs|ts|json|yaml|yml|md)$ ]]; then
    pnpm exec prettier --write "$FILE_PATH" 2>/dev/null ||
        echo "⚠️  prettier formatting failed" >&2
fi

# Run Markdownlint
if [[ "$FILE_PATH" =~ \.(md)$ ]]; then
    pnpm exec markdownlint --fix "$FILE_PATH" 2>/dev/null || true
        echo "⚠️  prettier formatting failed" >&2
fi

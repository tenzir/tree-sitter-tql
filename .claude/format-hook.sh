#!/bin/bash
# Auto-format hook for Claude edits

# Read stdin to get file path
stdin_data=$(cat)
FILE_PATH=$(echo "$stdin_data" | jq -r '.tool_input.file_path // .tool_output.file_path // empty' 2>/dev/null)

echo "🔧 Format hook triggered for: $FILE_PATH" >&2

# Skip if no file path
[[ -z "$FILE_PATH" ]] && exit 0

# Run prettier on JavaScript and tree-sitter files
if [[ "$FILE_PATH" =~ \.(js|mjs|cjs|ts)$ ]]; then
    echo "✨ Running prettier on $FILE_PATH" >&2
    if command -v prettier &> /dev/null; then
        prettier --write "$FILE_PATH"
    else
        echo "⚠️  prettier not found, skipping" >&2
    fi
fi

# Run prettier on JSON/YAML files
if [[ "$FILE_PATH" =~ \.(json|yaml|yml)$ ]]; then
    echo "✨ Running prettier on $FILE_PATH" >&2
    if command -v prettier &> /dev/null; then
        prettier --write "$FILE_PATH"
    else
        echo "⚠️  prettier not found, skipping" >&2
    fi
fi

# Run prettier on Markdown files
if [[ "$FILE_PATH" =~ \.(md)$ ]]; then
    echo "📝 Running prettier on $FILE_PATH" >&2
    if command -v prettier &> /dev/null; then
        prettier --write "$FILE_PATH"
    else
        echo "⚠️  prettier not found, skipping" >&2
    fi
fi

#!/bin/bash
# Build Retype wiki with dark mode default + LLM visibility
set -e

# 1. Build the Retype site
npx retype build

# 2. Patch HTML to default to dark mode (Retype doesn't support this natively)
find .retype -name '*.html' -exec sed -i 's/class="h-full"/class="h-full dark"/' {} +
echo "Patched dark mode default"

# 3. Generate llms-full.txt by concatenating all markdown files
echo "Generating llms-full.txt..."
{
  echo "# Verus Wiki — Full Content"
  echo ""
  echo "> This file contains the complete content of every page on the Verus Wiki."
  echo "> Site: https://wiki.autobb.app"
  echo "> Generated: $(date -u +%Y-%m-%d)"
  echo ""
  for f in $(find docs -name "*.md" -type f ! -name "README.md" | sort); do
    echo "--- PAGE: ${f#docs/} ---"
    echo ""
    cat "$f"
    echo ""
    echo ""
  done
} > .retype/llms-full.txt
echo "Generated llms-full.txt ($(wc -c < .retype/llms-full.txt) bytes)"

# 4. Override Retype's auto-generated robots.txt with our custom one
if [ -f .retype/robots.txt ]; then
  cp docs/robots.txt .retype/robots.txt
  echo "Overrode robots.txt with custom AI crawler directives"
fi

echo "Build complete"

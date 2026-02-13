#!/bin/bash
# Build Retype wiki with dark mode default
npx retype build
# Patch HTML to default to dark mode (Retype doesn't support this natively)
find .retype -name '*.html' -exec sed -i 's/class="h-full"/class="h-full dark"/' {} +
echo "✅ Built and patched for dark mode default"

#!/usr/bin/env python3
"""Remove sidebar fallback v1 from all HTML files by finding the exact blocks."""
import glob

count = 0
for f in glob.glob(".retype/**/*.html", recursive=True):
    with open(f, "r") as fh:
        lines = fh.readlines()

    if not any("sidebar-fallback-btn" in l for l in lines):
        continue

    # Find and remove the style block and script block containing sidebar-fallback-btn
    new_lines = []
    skip = False
    for i, line in enumerate(lines):
        # Start of v1 style block
        if "#sidebar-fallback-btn" in line and "<style>" in (lines[i-1] if i > 0 else ""):
            # Remove the <style> line we already added
            if new_lines and "<style>" in new_lines[-1]:
                new_lines.pop()
            skip = True
        # Start of v1 script block
        if "// Only activate if Vue failed" in line or ("sidebar-fallback-btn" in line and "fb.id" in line):
            # Find the <script> tag before this
            for j in range(len(new_lines)-1, max(len(new_lines)-5, -1), -1):
                if "<script>" in new_lines[j]:
                    new_lines = new_lines[:j]
                    break
            skip = True

        if skip:
            if "</style>" in line or "</script>" in line:
                skip = False
            continue

        new_lines.append(line)

    with open(f, "w") as fh:
        fh.writelines(new_lines)
    count += 1

print(f"Cleaned v1 fallback from {count} files")

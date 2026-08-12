#!/usr/bin/env python3
"""Check that TypeScript does not exceed 30% of source LOC."""

import subprocess
import sys

def count_lines(pattern, exclude_tests=False):
    result = subprocess.run(
        ["find", "src", "-name", pattern],
        capture_output=True, text=True
    )
    files = [f for f in result.stdout.strip().split("\n") if f]
    if exclude_tests:
        files = [f for f in files if "__tests__" not in f and ".test." not in f]
    total = 0
    for f in files:
        with open(f) as fh:
            total += sum(1 for _ in fh)
    return total, len(files)

ts_lines, ts_files = count_lines("*.ts", exclude_tests=True)
tsx_lines, tsx_files = count_lines("*.tsx", exclude_tests=True)
ts_lines += tsx_lines
js_lines, js_files = count_lines("*.js")
jsx_lines, jsx_files = count_lines("*.jsx")
js_lines += jsx_lines
total = ts_lines + js_lines

if total == 0:
    print("No source files found.")
    sys.exit(1)

ratio = ts_lines / total * 100
print(f"TypeScript: {ts_lines} lines ({ratio:.1f}%)")
print(f"JavaScript: {js_lines} lines ({100-ratio:.1f}%)")
print(f"Total: {total} lines")

if ratio > 30:
    print(f"\n⚠ TypeScript exceeds 30% limit ({ratio:.1f}%)")
    sys.exit(1)
else:
    print(f"\n✓ TypeScript within 30% limit")

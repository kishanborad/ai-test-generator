#!/usr/bin/env python3
"""Check that TypeScript does not exceed 30% of source LOC."""

import subprocess
import sys

def count_lines(pattern):
    result = subprocess.run(
        ["find", "src", "-name", pattern],
        capture_output=True, text=True
    )
    files = [f for f in result.stdout.strip().split("\n") if f]
    total = 0
    for f in files:
        with open(f) as fh:
            total += sum(1 for _ in fh)
    return total

ts_lines = count_lines("*.ts") + count_lines("*.tsx")
js_lines = count_lines("*.js") + count_lines("*.jsx")
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

#!/usr/bin/env bash
set -euo pipefail

echo "Running tests..."
npx vitest run

echo "Type checking..."
npx tsc --noEmit

echo "Building..."
npm run build

echo "Checking language ratio..."
python3 scripts/check-lang-ratio.py

echo "Deploying to GitHub Pages..."
npx gh-pages -d dist

echo "Done!"

/**
 * Parse Playwright-style test code into structured ParsedTest objects.
 * @param {string} code
 * @returns {import('../types').ParsedTest[]}
 */
export function parseTestCode(code) {
  const tests = [];
  const testBlockRegex = /(?:\/\/\s*@category:\s*(happy|negative|edge)\s*\n\s*)?test\(\s*['"`](.+?)['"`]\s*,\s*async\s*\(\s*\{[^}]*\}\s*\)\s*=>\s*\{([\s\S]*?)\n\}\);/g;

  let match;
  while ((match = testBlockRegex.exec(code)) !== null) {
    const category = match[1] || 'happy';
    const name = match[2];
    const body = match[3];
    const steps = parseSteps(body);
    tests.push({ name, category, steps });
  }

  return tests;
}

/**
 * @param {string} body
 * @returns {import('../types').TestStep[]}
 */
function parseSteps(body) {
  const steps = [];
  const lines = body.split('\n').map((l) => l.trim()).filter((l) => l.startsWith('await'));

  for (const line of lines) {
    const step = parseLine(line);
    if (step) steps.push(step);
  }

  return steps;
}

/**
 * @param {string} line
 * @returns {import('../types').TestStep | null}
 */
function parseLine(line) {
  // page.goto(url)
  let m = line.match(/page\.goto\(\s*['"`](.+?)['"`]\s*\)/);
  if (m) return { type: 'goto', value: m[1], raw: line };

  // page.click(selector)
  m = line.match(/page\.click\(\s*['"`](.+?)['"`]\s*\)/);
  if (m) return { type: 'click', selector: m[1], raw: line };

  // page.fill(selector, value)
  m = line.match(/page\.fill\(\s*['"`](.+?)['"`]\s*,\s*['"`](.+?)['"`]\s*\)/);
  if (m) return { type: 'fill', selector: m[1], value: m[2], raw: line };

  // expect().toBeVisible()
  m = line.match(/expect\(page\.locator\(\s*['"`](.+?)['"`]\s*\)\)\.toBeVisible\(\)/);
  if (m) return { type: 'assert-visible', selector: m[1], raw: line };

  // expect().toHaveText(text)
  m = line.match(/expect\(page\.locator\(\s*['"`](.+?)['"`]\s*\)\)\.toHaveText\(\s*['"`](.+?)['"`]\s*\)/);
  if (m) return { type: 'assert-text', selector: m[1], expected: m[2], raw: line };

  // expect().toHaveCount(n)
  m = line.match(/expect\(page\.locator\(\s*['"`](.+?)['"`]\s*\)\)\.toHaveCount\(\s*(\d+)\s*\)/);
  if (m) return { type: 'assert-count', selector: m[1], expected: parseInt(m[2], 10), raw: line };

  // expect().toContainText(text)
  m = line.match(/expect\(page\.locator\(\s*['"`](.+?)['"`]\s*\)\)\.toContainText\(\s*['"`](.+?)['"`]\s*\)/);
  if (m) return { type: 'assert-contain-text', selector: m[1], expected: m[2], raw: line };

  return null;
}

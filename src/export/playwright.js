const CATEGORY_LABELS = { happy: 'Happy Path', negative: 'Negative', edge: 'Edge Cases' };

/**
 * Export parsed tests as Playwright code.
 * @param {import('../types').ParsedTest[]} tests
 * @returns {string}
 */
export function exportPlaywright(tests) {
  const grouped = groupByCategory(tests);
  const lines = ["import { test, expect } from '@playwright/test';", ''];

  for (const [category, categoryTests] of Object.entries(grouped)) {
    const label = CATEGORY_LABELS[category] || category;
    lines.push(`describe('${label}', () => {`);

    for (const t of categoryTests) {
      lines.push(`  test('${t.name}', async ({ page }) => {`);
      for (const step of t.steps) {
        lines.push('    ' + playwrightStep(step));
      }
      lines.push('  });');
      lines.push('');
    }

    lines.push('});');
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * @param {import('../types').TestStep} step
 * @returns {string}
 */
function playwrightStep(step) {
  switch (step.type) {
    case 'goto':
      return `await page.goto('${step.value}');`;
    case 'click':
      return `await page.click('${step.selector}');`;
    case 'fill':
      return `await page.fill('${step.selector}', '${step.value}');`;
    case 'assert-visible':
      return `await expect(page.locator('${step.selector}')).toBeVisible();`;
    case 'assert-text':
      return `await expect(page.locator('${step.selector}')).toHaveText('${step.expected}');`;
    case 'assert-count':
      return `await expect(page.locator('${step.selector}')).toHaveCount(${step.expected});`;
    case 'assert-contain-text':
      return `await expect(page.locator('${step.selector}')).toContainText('${step.expected}');`;
    default:
      return `// unsupported step: ${step.type}`;
  }
}

/**
 * @param {import('../types').ParsedTest[]} tests
 * @returns {Record<string, import('../types').ParsedTest[]>}
 */
function groupByCategory(tests) {
  const groups = {};
  for (const t of tests) {
    if (!groups[t.category]) groups[t.category] = [];
    groups[t.category].push(t);
  }
  return groups;
}

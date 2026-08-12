import { describe, it, expect } from 'vitest';
import { parseTestCode } from '../engine/parser';

describe('parseTestCode', () => {
  it('extracts test name and category from comment', () => {
    const code = `
// @category: happy
test('loads the page', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-testid="hero"]')).toBeVisible();
});`;
    const tests = parseTestCode(code);
    expect(tests).toHaveLength(1);
    expect(tests[0].name).toBe('loads the page');
    expect(tests[0].category).toBe('happy');
  });

  it('defaults to happy category when no annotation', () => {
    const code = `
test('basic test', async ({ page }) => {
  await page.goto('/');
});`;
    const tests = parseTestCode(code);
    expect(tests[0].category).toBe('happy');
  });

  it('parses goto step', () => {
    const code = `
test('nav', async ({ page }) => {
  await page.goto('/contact');
});`;
    const steps = parseTestCode(code)[0].steps;
    expect(steps[0]).toMatchObject({ type: 'goto', value: '/contact' });
  });

  it('parses click step', () => {
    const code = `
test('click', async ({ page }) => {
  await page.click('[data-testid="submit-button"]');
});`;
    const steps = parseTestCode(code)[0].steps;
    expect(steps[0]).toMatchObject({ type: 'click', selector: '[data-testid="submit-button"]' });
  });

  it('parses fill step', () => {
    const code = `
test('fill', async ({ page }) => {
  await page.fill('[data-testid="input-name"]', 'Alice');
});`;
    const steps = parseTestCode(code)[0].steps;
    expect(steps[0]).toMatchObject({ type: 'fill', selector: '[data-testid="input-name"]', value: 'Alice' });
  });

  it('parses assert-visible', () => {
    const code = `
test('visible', async ({ page }) => {
  await expect(page.locator('.hero')).toBeVisible();
});`;
    const steps = parseTestCode(code)[0].steps;
    expect(steps[0]).toMatchObject({ type: 'assert-visible', selector: '.hero' });
  });

  it('parses assert-text', () => {
    const code = `
test('text', async ({ page }) => {
  await expect(page.locator('[data-testid="title"]')).toHaveText('Hello');
});`;
    const steps = parseTestCode(code)[0].steps;
    expect(steps[0]).toMatchObject({ type: 'assert-text', selector: '[data-testid="title"]', expected: 'Hello' });
  });

  it('parses assert-count', () => {
    const code = `
test('count', async ({ page }) => {
  await expect(page.locator('.card')).toHaveCount(3);
});`;
    const steps = parseTestCode(code)[0].steps;
    expect(steps[0]).toMatchObject({ type: 'assert-count', selector: '.card', expected: 3 });
  });

  it('parses assert-contain-text', () => {
    const code = `
test('contain', async ({ page }) => {
  await expect(page.locator('.msg')).toContainText('success');
});`;
    const steps = parseTestCode(code)[0].steps;
    expect(steps[0]).toMatchObject({ type: 'assert-contain-text', selector: '.msg', expected: 'success' });
  });

  it('parses multiple tests from one code block', () => {
    const code = `
// @category: happy
test('first', async ({ page }) => {
  await page.goto('/');
});

// @category: negative
test('second', async ({ page }) => {
  await page.click('.btn');
});`;
    const tests = parseTestCode(code);
    expect(tests).toHaveLength(2);
    expect(tests[0].name).toBe('first');
    expect(tests[0].category).toBe('happy');
    expect(tests[1].name).toBe('second');
    expect(tests[1].category).toBe('negative');
  });
});

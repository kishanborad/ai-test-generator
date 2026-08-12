import { describe, it, expect } from 'vitest';
import { exportPlaywright } from '../export/playwright';
import { exportCypress } from '../export/cypress';
import type { ParsedTest } from '../types';

const sampleTests: ParsedTest[] = [
  {
    name: 'submits form',
    category: 'happy',
    steps: [
      { type: 'goto', value: '/', raw: '' },
      { type: 'fill', selector: '[data-testid="input-name"]', value: 'Alice', raw: '' },
      { type: 'click', selector: '[data-testid="submit-button"]', raw: '' },
      { type: 'assert-visible', selector: '[data-testid="success-message"]', raw: '' },
    ],
  },
  {
    name: 'empty form shows errors',
    category: 'negative',
    steps: [
      { type: 'goto', value: '/', raw: '' },
      { type: 'click', selector: '[data-testid="submit-button"]', raw: '' },
      { type: 'assert-text', selector: '[data-testid="error-name"]', expected: 'Name is required', raw: '' },
    ],
  },
];

describe('exportPlaywright', () => {
  it('produces valid Playwright syntax', () => {
    const code = exportPlaywright(sampleTests);
    expect(code).toContain("import { test, expect } from '@playwright/test'");
    expect(code).toContain("describe('Happy Path'");
    expect(code).toContain("describe('Negative'");
    expect(code).toContain("test('submits form'");
    expect(code).toContain("await page.goto('/')");
    expect(code).toContain("await page.fill('[data-testid=\"input-name\"]', 'Alice')");
    expect(code).toContain("await page.click('[data-testid=\"submit-button\"]')");
    expect(code).toContain("await expect(page.locator('[data-testid=\"success-message\"]')).toBeVisible()");
  });

  it('groups by category', () => {
    const code = exportPlaywright(sampleTests);
    const happyIdx = code.indexOf("describe('Happy Path'");
    const negativeIdx = code.indexOf("describe('Negative'");
    expect(happyIdx).toBeLessThan(negativeIdx);
  });
});

describe('exportCypress', () => {
  it('produces valid Cypress syntax', () => {
    const code = exportCypress(sampleTests);
    expect(code).toContain("describe('Happy Path'");
    expect(code).toContain("it('submits form'");
    expect(code).toContain("cy.visit('/')");
    expect(code).toContain("cy.get('[data-testid=\"input-name\"]').type('Alice')");
    expect(code).toContain("cy.get('[data-testid=\"submit-button\"]').click()");
    expect(code).toContain("cy.get('[data-testid=\"success-message\"]').should('be.visible')");
  });

  it('uses should for text assertions', () => {
    const code = exportCypress(sampleTests);
    expect(code).toContain("should('have.text', 'Name is required')");
  });
});

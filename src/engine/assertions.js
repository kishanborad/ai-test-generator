import { AssertionError } from './locator.js';

/**
 * Create an expect-like assertion chain for a locator.
 * @param {ReturnType<import('./locator.js').createLocator>} locator
 */
export function createExpect(locator) {
  return {
    toBeVisible() {
      if (!locator.isVisible()) {
        throw new AssertionError('Element is not visible', 'visible', 'not found');
      }
    },

    /** @param {string} expected */
    toHaveText(expected) {
      const actual = locator.text();
      if (actual !== expected) {
        throw new AssertionError(
          `Expected text "${expected}" but got "${actual}"`,
          expected,
          actual,
        );
      }
    },

    /** @param {number} expected */
    toHaveCount(expected) {
      const actual = locator.count();
      if (actual !== expected) {
        throw new AssertionError(
          `Expected ${expected} elements but found ${actual}`,
          String(expected),
          String(actual),
        );
      }
    },

    /** @param {string} expected */
    toContainText(expected) {
      const actual = locator.text();
      if (!actual.includes(expected)) {
        throw new AssertionError(
          `Expected text to contain "${expected}" but got "${actual}"`,
          expected,
          actual,
        );
      }
    },
  };
}

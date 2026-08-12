/**
 * Create a DOM locator wrapping querySelector/querySelectorAll.
 * @param {Document} doc
 * @param {string} selector
 */
export function createLocator(doc, selector) {
  return {
    /** @returns {Element | null} */
    element() {
      return doc.querySelector(selector);
    },

    /** @returns {Element[]} */
    all() {
      return Array.from(doc.querySelectorAll(selector));
    },

    /** @returns {boolean} */
    isVisible() {
      return doc.querySelector(selector) !== null;
    },

    /** @returns {string} */
    text() {
      const el = doc.querySelector(selector);
      return el ? (el.textContent || '').trim() : '';
    },

    /** @returns {number} */
    count() {
      return doc.querySelectorAll(selector).length;
    },

    click() {
      const el = doc.querySelector(selector);
      if (!el) throw new AssertionError('Element not found: ' + selector, '', '');
      el.click();
    },

    /** @param {string} value */
    fill(value) {
      const el = doc.querySelector(selector);
      if (!el) throw new AssertionError('Element not found: ' + selector, '', '');
      const nativeSet =
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set ||
        Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
      if (nativeSet) nativeSet.call(el, value);
      else el.value = value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    },
  };
}

export class AssertionError extends Error {
  /**
   * @param {string} message
   * @param {string} expected
   * @param {string} actual
   */
  constructor(message, expected, actual) {
    super(message);
    this.name = 'AssertionError';
    this.expected = expected;
    this.actual = actual;
  }
}

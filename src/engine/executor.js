import { createLocator, AssertionError } from './locator.js';
import { createExpect } from './assertions.js';

/**
 * Run parsed tests against an iframe document.
 * @param {import('../types').ParsedTest[]} tests
 * @param {Document} doc
 * @param {{ stepDelay: number, onStepStart?: Function, onStepComplete?: Function, onCursorMove?: Function, onHighlight?: Function }} options
 * @returns {Promise<import('../types').RunReport>}
 */
export async function runTests(tests, doc, options = {}) {
  const { stepDelay = 500, onStepStart, onStepComplete, onCursorMove, onHighlight } = options;
  const results = [];

  for (const test of tests) {
    const stepResults = [];
    let testPassed = true;
    const testStart = performance.now();

    for (const step of test.steps) {
      if (onStepStart) onStepStart(test, step);

      const stepStart = performance.now();
      let status = 'passed';
      let error, expected, actual;

      try {
        await executeStep(step, doc, { onCursorMove, onHighlight });
      } catch (err) {
        status = 'failed';
        testPassed = false;
        error = err.message;
        if (err instanceof AssertionError) {
          expected = err.expected;
          actual = err.actual;
        }
      }

      const duration = Math.round(performance.now() - stepStart);
      const result = { step, status, duration, error, expected, actual };
      stepResults.push(result);

      if (onStepComplete) onStepComplete(test, result);
      if (status === 'failed') {
        // Skip remaining steps in this test
        for (const remaining of test.steps.slice(test.steps.indexOf(step) + 1)) {
          stepResults.push({ step: remaining, status: 'skipped', duration: 0 });
        }
        break;
      }

      await delay(stepDelay);
    }

    const testDuration = Math.round(performance.now() - testStart);
    results.push({ test, steps: stepResults, passed: testPassed, duration: testDuration });
  }

  return buildReport(results);
}

/**
 * Execute a single test step against the document.
 * @param {import('../types').TestStep} step
 * @param {Document} doc
 * @param {{ onCursorMove?: Function, onHighlight?: Function }} callbacks
 */
async function executeStep(step, doc, { onCursorMove, onHighlight } = {}) {
  if (step.type === 'goto') {
    const iframe = doc.defaultView?.frameElement;
    if (iframe) {
      const base = iframe.src.replace(/[^/]*$/, '');
      iframe.src = base + step.value.replace(/^\//, '');
      await new Promise((resolve) => { iframe.addEventListener('load', resolve, { once: true }); });
    }
    return;
  }

  const selector = step.selector;
  if (!selector) return;

  const locator = createLocator(doc, selector);
  const el = locator.element();

  if (el && onCursorMove) {
    const rect = el.getBoundingClientRect();
    onCursorMove({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
  }

  switch (step.type) {
    case 'click':
      if (!el) throw new AssertionError('Element not found: ' + selector, 'found', 'not found');
      locator.click();
      if (onHighlight) onHighlight(selector, 'action');
      await delay(200);
      break;

    case 'fill':
      if (!el) throw new AssertionError('Element not found: ' + selector, 'found', 'not found');
      locator.fill(step.value || '');
      if (onHighlight) onHighlight(selector, 'action');
      await delay(200);
      break;

    case 'assert-visible':
      createExpect(locator).toBeVisible();
      if (onHighlight) onHighlight(selector, 'pass');
      break;

    case 'assert-text':
      createExpect(locator).toHaveText(String(step.expected));
      if (onHighlight) onHighlight(selector, 'pass');
      break;

    case 'assert-count':
      createExpect(locator).toHaveCount(Number(step.expected));
      if (onHighlight) onHighlight(selector, 'pass');
      break;

    case 'assert-contain-text':
      createExpect(locator).toContainText(String(step.expected));
      if (onHighlight) onHighlight(selector, 'pass');
      break;
  }
}

/**
 * Build a categorized report from test results.
 * @param {import('../types').TestResult[]} results
 * @returns {import('../types').RunReport}
 */
export function buildReport(results) {
  const totalPassed = results.filter((r) => r.passed).length;
  const totalFailed = results.filter((r) => !r.passed).length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

  const byCategory = { happy: { passed: 0, total: 0 }, negative: { passed: 0, total: 0 }, edge: { passed: 0, total: 0 } };
  for (const r of results) {
    const cat = r.test.category;
    byCategory[cat].total++;
    if (r.passed) byCategory[cat].passed++;
  }

  return { tests: results, totalPassed, totalFailed, totalDuration, byCategory };
}

/** @param {number} ms */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

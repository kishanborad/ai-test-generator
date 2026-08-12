const SYSTEM_BASE = `You are an expert QA engineer. You generate Playwright-style test code.

Rules:
- Use test('name', async ({ page }) => { ... }); syntax
- Use page.goto('/'), page.click(selector), page.fill(selector, value)
- Use await expect(page.locator(selector)).toBeVisible/toHaveText/toHaveCount/toContainText
- Prefer data-testid selectors when available
- Add a category comment before each test: // @category: happy|negative|edge
- For every happy path test, generate at least one negative test and one edge case test
- Group tests by category in your output
- Each test should be self-contained and independent`;

/**
 * Build prompt for user story mode.
 * @param {string} story
 * @param {string} domSnapshot
 * @returns {string}
 */
export function buildStoryPrompt(story, domSnapshot) {
  return `${SYSTEM_BASE}

Here is the page structure:
\`\`\`html
${domSnapshot}
\`\`\`

User story to test:
"${story}"

Generate comprehensive test code covering happy paths, negative scenarios, and edge cases. Output only valid test code — no explanations.`;
}

/**
 * Build prompt for recording mode.
 * @param {import('../types').RecordedAction[]} actions
 * @param {string} domSnapshot
 * @returns {string}
 */
export function buildRecordingPrompt(actions, domSnapshot) {
  const actionList = actions.map((a, i) =>
    `${i + 1}. ${a.type}${a.selector ? ` on "${a.selector}"` : ''}${a.value ? ` with value "${a.value}"` : ''}${a.textContent ? ` (text: "${a.textContent}")` : ''}`
  ).join('\n');

  return `${SYSTEM_BASE}

Here is the page structure:
\`\`\`html
${domSnapshot}
\`\`\`

The user performed these actions:
${actionList}

Convert these actions into comprehensive test code. Add assertions for expected outcomes after each action. Then generate additional negative and edge case tests based on the same workflow. Output only valid test code — no explanations.`;
}

/**
 * Build prompt for fixing a failed test.
 * @param {{ error: string, expected: string, actual: string, stepCode: string, domSnapshot: string }} context
 * @returns {string}
 */
export function buildFixPrompt(context) {
  return `${SYSTEM_BASE}

A test step failed:
Step code: ${context.stepCode}
Error: ${context.error}
Expected: ${context.expected}
Actual: ${context.actual}

Current page structure:
\`\`\`html
${context.domSnapshot}
\`\`\`

Fix this test step. Output only the corrected complete test (not just the single step). Keep the same category annotation.`;
}

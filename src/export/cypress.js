const CATEGORY_LABELS = { happy: 'Happy Path', negative: 'Negative', edge: 'Edge Cases' };

/**
 * Export parsed tests as Cypress code.
 * @param {import('../types').ParsedTest[]} tests
 * @returns {string}
 */
export function exportCypress(tests) {
  const grouped = groupByCategory(tests);
  const lines = [];

  for (const [category, categoryTests] of Object.entries(grouped)) {
    const label = CATEGORY_LABELS[category] || category;
    lines.push(`describe('${label}', () => {`);

    for (const t of categoryTests) {
      lines.push(`  it('${t.name}', () => {`);
      for (const step of t.steps) {
        lines.push('    ' + cypressStep(step));
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
function cypressStep(step) {
  switch (step.type) {
    case 'goto':
      return `cy.visit('${step.value}');`;
    case 'click':
      return `cy.get('${step.selector}').click();`;
    case 'fill':
      return `cy.get('${step.selector}').type('${step.value}');`;
    case 'assert-visible':
      return `cy.get('${step.selector}').should('be.visible');`;
    case 'assert-text':
      return `cy.get('${step.selector}').should('have.text', '${step.expected}');`;
    case 'assert-count':
      return `cy.get('${step.selector}').should('have.length', ${step.expected});`;
    case 'assert-contain-text':
      return `cy.get('${step.selector}').should('contain.text', '${step.expected}');`;
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

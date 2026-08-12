/** @type {Record<string, string>} */
export const ACTION_LABELS = {
  click: 'Click',
  fill: 'Type',
  select: 'Select',
  navigate: 'Navigate',
  scroll: 'Scroll',
};

/**
 * Format a recorded action for display in the action log.
 * @param {import('../types').RecordedAction} action
 * @returns {string}
 */
export function formatAction(action) {
  const label = ACTION_LABELS[action.type] || action.type;
  const target = action.selector.length > 40 ? action.selector.slice(0, 37) + '...' : action.selector;
  const value = action.value ? ` "${action.value}"` : '';
  return `${label} ${target}${value}`;
}

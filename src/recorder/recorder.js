/** @type {AbortController | null} */
let controller = null;

/** @type {import('../types').RecordedAction[]} */
let actions = [];

/**
 * Start recording user interactions in an iframe document.
 * @param {Document} doc
 * @param {(action: import('../types').RecordedAction) => void} onAction
 */
export function startRecording(doc, onAction) {
  stopRecording();
  actions = [];
  controller = new AbortController();
  const signal = controller.signal;

  doc.addEventListener('click', (e) => {
    const el = /** @type {Element} */ (e.target);
    if (!el || !el.tagName) return;
    const action = {
      type: 'click',
      selector: buildSelector(el),
      timestamp: Date.now(),
      tagName: el.tagName.toLowerCase(),
      textContent: (el.textContent || '').trim().slice(0, 50),
    };
    actions.push(action);
    onAction(action);
  }, { signal });

  doc.addEventListener('input', (e) => {
    const el = /** @type {HTMLInputElement} */ (e.target);
    if (!el || !el.tagName) return;
    const action = {
      type: el.tagName.toLowerCase() === 'select' ? 'select' : 'fill',
      selector: buildSelector(el),
      value: el.value,
      timestamp: Date.now(),
      tagName: el.tagName.toLowerCase(),
    };
    // Debounce: replace last action if same selector and type
    const last = actions[actions.length - 1];
    if (last && last.selector === action.selector && last.type === action.type) {
      actions[actions.length - 1] = action;
    } else {
      actions.push(action);
    }
    onAction(action);
  }, { signal });
}

/**
 * Stop recording and return all captured actions.
 * @returns {import('../types').RecordedAction[]}
 */
export function stopRecording() {
  if (controller) {
    controller.abort();
    controller = null;
  }
  return [...actions];
}

/**
 * Build the best available CSS selector for an element.
 * @param {Element} el
 * @returns {string}
 */
export function buildSelector(el) {
  // Prefer data-testid
  const testId = el.getAttribute('data-testid');
  if (testId) return `[data-testid="${testId}"]`;

  // id
  if (el.id) return `#${el.id}`;

  // aria-label
  const ariaLabel = el.getAttribute('aria-label');
  if (ariaLabel) return `[aria-label="${ariaLabel}"]`;

  // tag + classes
  const tag = el.tagName.toLowerCase();
  if (el.classList.length > 0) {
    return tag + '.' + Array.from(el.classList).join('.');
  }

  // nth-child fallback
  const parent = el.parentElement;
  if (parent) {
    const siblings = Array.from(parent.children);
    const index = siblings.indexOf(el) + 1;
    return `${tag}:nth-child(${index})`;
  }

  return tag;
}

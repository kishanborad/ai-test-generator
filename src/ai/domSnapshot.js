const STRIP_TAGS = ['script', 'style', 'noscript', 'svg', 'link', 'meta'];
const KEEP_ATTRS = ['data-testid', 'aria-label', 'aria-labelledby', 'placeholder', 'type', 'name', 'id', 'href', 'role', 'value', 'class'];
const MAX_DEPTH = 6;

/**
 * Create a pruned HTML snapshot of a document suitable for LLM context.
 * @param {Document} doc
 * @returns {string}
 */
export function snapshotDOM(doc) {
  const body = doc.body;
  if (!body) return '';
  return pruneNode(body, 0);
}

/**
 * @param {Node} node
 * @param {number} depth
 * @returns {string}
 */
function pruneNode(node, depth) {
  if (depth > MAX_DEPTH) return '';

  if (node.nodeType === 3) {
    const text = node.textContent?.trim() || '';
    return text.length > 100 ? text.slice(0, 100) + '...' : text;
  }

  if (node.nodeType !== 1) return '';

  const el = /** @type {Element} */ (node);
  const tag = el.tagName.toLowerCase();

  if (STRIP_TAGS.includes(tag)) return '';

  const attrs = [];
  for (const attr of KEEP_ATTRS) {
    const val = el.getAttribute(attr);
    if (val !== null && val !== '') {
      attrs.push(`${attr}="${val}"`);
    }
  }

  const attrStr = attrs.length > 0 ? ' ' + attrs.join(' ') : '';
  const children = Array.from(el.childNodes)
    .map((child) => pruneNode(child, depth + 1))
    .filter((s) => s.length > 0)
    .join('');

  if (!children && !attrStr && !isInteractive(tag)) return '';

  const selfClosing = ['input', 'img', 'br', 'hr'].includes(tag);
  if (selfClosing) return `<${tag}${attrStr} />`;

  return `<${tag}${attrStr}>${children}</${tag}>`;
}

/** @param {string} tag */
function isInteractive(tag) {
  return ['input', 'button', 'select', 'textarea', 'a', 'form', 'label'].includes(tag);
}

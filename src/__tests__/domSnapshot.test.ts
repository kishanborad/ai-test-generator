import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { snapshotDOM } from '../ai/domSnapshot';

describe('snapshotDOM', () => {
  it('strips script tags', () => {
    const dom = new JSDOM('<div><script>alert("x")</script><p>Hello</p></div>');
    const result = snapshotDOM(dom.window.document);
    expect(result).not.toContain('<script');
    expect(result).toContain('<p>Hello</p>');
  });

  it('strips style tags', () => {
    const dom = new JSDOM('<div><style>body{color:red}</style><p>Hi</p></div>');
    const result = snapshotDOM(dom.window.document);
    expect(result).not.toContain('<style');
    expect(result).toContain('<p>Hi</p>');
  });

  it('preserves data-testid attributes', () => {
    const dom = new JSDOM('<button data-testid="submit">Go</button>');
    const result = snapshotDOM(dom.window.document);
    expect(result).toContain('data-testid="submit"');
  });

  it('preserves aria-label attributes', () => {
    const dom = new JSDOM('<button aria-label="Close">X</button>');
    const result = snapshotDOM(dom.window.document);
    expect(result).toContain('aria-label="Close"');
  });

  it('truncates deep nesting beyond 6 levels', () => {
    const dom = new JSDOM('<div><div><div><div><div><div><div><p>Deep</p></div></div></div></div></div></div></div>');
    const result = snapshotDOM(dom.window.document);
    expect(result).not.toContain('<p>Deep</p>');
  });

  it('keeps interactive elements', () => {
    const dom = new JSDOM('<form><input type="text" placeholder="Name" /><select><option>A</option></select></form>');
    const result = snapshotDOM(dom.window.document);
    expect(result).toContain('<input');
    expect(result).toContain('<select');
  });
});

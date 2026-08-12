import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { createLocator } from '../engine/locator';
import { createExpect } from '../engine/assertions';

let doc: Document;

beforeEach(() => {
  const dom = new JSDOM(`
    <div data-testid="title">Hello World</div>
    <div class="card">A</div>
    <div class="card">B</div>
    <div class="card">C</div>
    <input data-testid="input" value="test" />
  `);
  doc = dom.window.document;
});

describe('createLocator', () => {
  it('finds element by selector', () => {
    const loc = createLocator(doc, '[data-testid="title"]');
    expect(loc.isVisible()).toBe(true);
  });

  it('returns text content', () => {
    const loc = createLocator(doc, '[data-testid="title"]');
    expect(loc.text()).toBe('Hello World');
  });

  it('counts matching elements', () => {
    const loc = createLocator(doc, '.card');
    expect(loc.count()).toBe(3);
  });

  it('isVisible returns false for missing element', () => {
    const loc = createLocator(doc, '.nonexistent');
    expect(loc.isVisible()).toBe(false);
  });
});

describe('createExpect', () => {
  it('toBeVisible passes for existing element', () => {
    const loc = createLocator(doc, '[data-testid="title"]');
    expect(() => createExpect(loc).toBeVisible()).not.toThrow();
  });

  it('toBeVisible throws for missing element', () => {
    const loc = createLocator(doc, '.missing');
    expect(() => createExpect(loc).toBeVisible()).toThrow('not visible');
  });

  it('toHaveText passes on match', () => {
    const loc = createLocator(doc, '[data-testid="title"]');
    expect(() => createExpect(loc).toHaveText('Hello World')).not.toThrow();
  });

  it('toHaveText throws on mismatch', () => {
    const loc = createLocator(doc, '[data-testid="title"]');
    expect(() => createExpect(loc).toHaveText('Goodbye')).toThrow();
  });

  it('toHaveCount passes on correct count', () => {
    const loc = createLocator(doc, '.card');
    expect(() => createExpect(loc).toHaveCount(3)).not.toThrow();
  });

  it('toHaveCount throws on wrong count', () => {
    const loc = createLocator(doc, '.card');
    expect(() => createExpect(loc).toHaveCount(5)).toThrow();
  });

  it('toContainText passes on substring match', () => {
    const loc = createLocator(doc, '[data-testid="title"]');
    expect(() => createExpect(loc).toContainText('World')).not.toThrow();
  });

  it('toContainText throws on missing substring', () => {
    const loc = createLocator(doc, '[data-testid="title"]');
    expect(() => createExpect(loc).toContainText('Mars')).toThrow();
  });
});

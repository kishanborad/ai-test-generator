import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { buildSelector } from '../recorder/recorder';

describe('buildSelector', () => {
  it('prefers data-testid', () => {
    const dom = new JSDOM('<button data-testid="submit" id="btn" class="primary">Go</button>');
    const el = dom.window.document.querySelector('button')!;
    expect(buildSelector(el)).toBe('[data-testid="submit"]');
  });

  it('falls back to id', () => {
    const dom = new JSDOM('<button id="main-btn">Go</button>');
    const el = dom.window.document.querySelector('button')!;
    expect(buildSelector(el)).toBe('#main-btn');
  });

  it('falls back to aria-label', () => {
    const dom = new JSDOM('<button aria-label="Close dialog">X</button>');
    const el = dom.window.document.querySelector('button')!;
    expect(buildSelector(el)).toBe('[aria-label="Close dialog"]');
  });

  it('falls back to tag + class', () => {
    const dom = new JSDOM('<button class="btn-primary large">Go</button>');
    const el = dom.window.document.querySelector('button')!;
    expect(buildSelector(el)).toBe('button.btn-primary.large');
  });

  it('falls back to tag + nth-child for unidentifiable elements', () => {
    const dom = new JSDOM('<div><span>A</span><span>B</span></div>');
    const el = dom.window.document.querySelectorAll('span')[1];
    expect(buildSelector(el)).toMatch(/span:nth-child/);
  });
});

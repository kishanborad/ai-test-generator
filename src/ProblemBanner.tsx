import { useState } from 'react';

export function ProblemBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2 bg-white/[0.04] border-b border-tg-border text-[11px] text-tg-muted">
      <div className="flex items-center gap-3 min-w-0">
        <span className="shrink-0 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium uppercase tracking-wider text-[10px]">Free</span>
        <span className="truncate">
          AI test generation tools like TestStory.ai and Virtuoso cost $100+/mo and require cloud access. This generates categorized test cases from plain English or recorded clicks using WebLLM — entirely in your browser. No API keys, no data leaves your machine.
        </span>
      </div>
      <button onClick={() => setDismissed(true)} className="shrink-0 text-tg-muted hover:text-tg-text cursor-pointer" aria-label="Dismiss">&#10005;</button>
    </div>
  );
}

import { lazy, Suspense, useState } from 'react';
import ReportView from './ReportView.jsx';
import { exportPlaywright } from '../export/playwright.js';
import { exportCypress } from '../export/cypress.js';

const MonacoEditor = lazy(() => import('@monaco-editor/react'));

export default function OutputPanel({ code, onCodeChange, onRun, running, generating, report, onFix, tests }) {
  const [exportFormat, setExportFormat] = useState('playwright');
  const [tab, setTab] = useState('code');

  const handleExport = () => {
    if (!tests || tests.length === 0) return;
    const output = exportFormat === 'cypress' ? exportCypress(tests) : exportPlaywright(tests);
    const ext = exportFormat === 'cypress' ? '.cy.js' : '.spec.ts';
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `generated-tests${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (!tests || tests.length === 0) return;
    const output = exportFormat === 'cypress' ? exportCypress(tests) : exportPlaywright(tests);
    navigator.clipboard.writeText(output);
  };

  return (
    <aside className="w-[400px] h-full bg-tg-surface border-l border-tg-border flex flex-col overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-tg-border">
        {['code', 'results'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t ? 'text-tg-accent border-b-2 border-tg-accent' : 'text-tg-muted hover:text-tg-text'
            }`}
          >
            {t === 'code' ? 'Generated Code' : 'Results'}
          </button>
        ))}
      </div>

      {/* Code tab */}
      {tab === 'code' && (
        <div className="flex-1 flex flex-col">
          <div className="flex-1 min-h-0 relative">
            {generating && (
              <div className="absolute inset-0 z-10 bg-tg-bg/80 flex flex-col items-center justify-center gap-4">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-tg-accent animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-tg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-tg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <p className="text-sm text-tg-muted">Generating test cases...</p>
                {code && (
                  <div className="w-4/5 space-y-2 mt-2">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-3 bg-tg-border/50 rounded animate-pulse" style={{ width: `${60 + Math.random() * 40}%`, animationDelay: `${i * 100}ms` }} />
                    ))}
                  </div>
                )}
              </div>
            )}
            <Suspense fallback={<div className="p-4 text-tg-muted text-sm">Loading editor...</div>}>
              <MonacoEditor
                height="100%"
                language="typescript"
                theme="vs-dark"
                value={code}
                onChange={(val) => onCodeChange(val || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 12,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  readOnly: running || generating,
                }}
              />
            </Suspense>
          </div>

          {/* Action bar */}
          <div className="p-3 border-t border-tg-border flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onRun}
              disabled={running || generating || !code.trim()}
              className="px-4 py-2 bg-tg-green text-white rounded-md text-sm font-medium
                hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {running ? '⏳ Running...' : '▶ Run'}
            </button>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="bg-tg-bg border border-tg-border rounded-md px-2 py-2 text-sm text-tg-text flex-shrink-0"
            >
              <option value="playwright">Playwright</option>
              <option value="cypress">Cypress</option>
            </select>
            <button
              type="button"
              onClick={handleExport}
              disabled={!tests || tests.length === 0}
              className="px-3 py-2 bg-tg-bg border border-tg-border rounded-md text-sm text-tg-text
                hover:bg-tg-card transition-colors disabled:opacity-50 flex-shrink-0"
            >
              ↓ Export
            </button>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!tests || tests.length === 0}
              className="px-3 py-2 bg-tg-bg border border-tg-border rounded-md text-sm text-tg-text
                hover:bg-tg-card transition-colors disabled:opacity-50 flex-shrink-0"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      {/* Results tab */}
      {tab === 'results' && (
        <div className="flex-1 overflow-y-auto p-3">
          {report ? (
            <ReportView report={report} onFix={onFix} />
          ) : (
            <p className="text-tg-muted text-sm text-center mt-8">
              Run tests to see results here
            </p>
          )}
        </div>
      )}
    </aside>
  );
}

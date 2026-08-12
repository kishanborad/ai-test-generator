import CategoryBadge from '../components/CategoryBadge.jsx';
import { useState } from 'react';

const CATEGORY_ORDER = ['happy', 'negative', 'edge'];
const CATEGORY_COLORS = { happy: 'border-tg-green', negative: 'border-tg-red', edge: 'border-tg-amber' };
const CATEGORY_LABELS = { happy: 'Happy Path', negative: 'Negative', edge: 'Edge Cases' };

export default function ReportView({ report, onFix }) {
  if (!report) return null;

  return (
    <div className="flex flex-col gap-3">
      {/* Summary */}
      <div className="bg-tg-bg rounded-lg p-3">
        <div className="flex items-center gap-3 text-sm mb-2">
          <span className="text-tg-green font-medium">✓ {report.totalPassed} passed</span>
          <span className="text-tg-red font-medium">✗ {report.totalFailed} failed</span>
          <span className="text-tg-muted">⏱ {(report.totalDuration / 1000).toFixed(1)}s</span>
        </div>
        {CATEGORY_ORDER.map((cat) => {
          const data = report.byCategory[cat];
          if (!data || data.total === 0) return null;
          const pct = Math.round((data.passed / data.total) * 100);
          return (
            <div key={cat} className="flex items-center gap-2 text-xs mt-1">
              <span className="w-20 text-tg-muted">{CATEGORY_LABELS[cat]}:</span>
              <span className="text-tg-text">{data.passed}/{data.total}</span>
              <div className="flex-1 h-1.5 bg-tg-border rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${cat === 'happy' ? 'bg-tg-green' : cat === 'negative' ? 'bg-tg-red' : 'bg-tg-amber'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-tg-muted w-8 text-right">{pct}%</span>
            </div>
          );
        })}
      </div>

      {/* Category groups */}
      {CATEGORY_ORDER.map((cat) => {
        const categoryTests = report.tests.filter((t) => t.test.category === cat);
        if (categoryTests.length === 0) return null;
        return (
          <CategoryGroup
            key={cat}
            category={cat}
            tests={categoryTests}
            onFix={onFix}
          />
        );
      })}
    </div>
  );
}

function CategoryGroup({ category, tests, onFix }) {
  return (
    <div className={`border-l-2 ${CATEGORY_COLORS[category]} pl-3`}>
      <h3 className="text-xs font-semibold text-tg-muted uppercase tracking-wide mb-2">
        {CATEGORY_LABELS[category]} ({tests.length})
      </h3>
      {tests.map((result, i) => (
        <TestResultRow key={i} result={result} onFix={onFix} />
      ))}
    </div>
  );
}

function TestResultRow({ result, onFix }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mb-2">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 text-sm text-left py-1 hover:bg-tg-bg/50 rounded px-1"
      >
        <span className={result.passed ? 'text-tg-green' : 'text-tg-red'}>
          {result.passed ? '✓' : '✗'}
        </span>
        <span className="flex-1 text-tg-text truncate">{result.test.name}</span>
        <span className="text-xs text-tg-muted">{result.duration}ms</span>
      </button>

      {expanded && (
        <div className="ml-6 mt-1 flex flex-col gap-1">
          {result.steps.map((sr, j) => (
            <StepRow key={j} result={sr} onFix={onFix} testName={result.test.name} />
          ))}
        </div>
      )}
    </div>
  );
}

function StepRow({ result: sr, onFix, testName }) {
  const statusIcon = sr.status === 'passed' ? '✓' : sr.status === 'failed' ? '✗' : sr.status === 'running' ? '●' : '○';
  const statusColor = sr.status === 'passed' ? 'text-tg-green' : sr.status === 'failed' ? 'text-tg-red' : 'text-tg-muted';

  return (
    <div className="text-xs">
      <div className="flex items-center gap-2">
        <span className={statusColor}>{statusIcon}</span>
        <code className="text-tg-text font-mono flex-1 truncate">{sr.step.raw || sr.step.type}</code>
        {sr.duration > 0 && <span className="text-tg-muted">{sr.duration}ms</span>}
      </div>
      {sr.error && (
        <div className="ml-4 mt-1 p-2 bg-tg-red/10 rounded text-tg-red">
          <p>{sr.error}</p>
          {sr.expected && <p className="mt-1">Expected: <code>{sr.expected}</code></p>}
          {sr.actual && <p>Actual: <code>{sr.actual}</code></p>}
          {onFix && (
            <button
              type="button"
              onClick={() => onFix({ error: sr.error, expected: sr.expected || '', actual: sr.actual || '', stepCode: sr.step.raw })}
              className="mt-1 px-2 py-0.5 bg-tg-red/20 rounded text-xs hover:bg-tg-red/30"
            >
              Fix this
            </button>
          )}
        </div>
      )}
      {sr.screenshot && (
        <img src={sr.screenshot} alt="Step screenshot" className="ml-4 mt-1 rounded border border-tg-border max-w-[200px]" />
      )}
    </div>
  );
}

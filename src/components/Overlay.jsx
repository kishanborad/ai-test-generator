export default function Overlay({ cursor, highlight, running }) {
  if (!running) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {/* Cursor */}
      {cursor && (
        <svg
          className="absolute transition-all duration-300 ease-out"
          style={{ left: cursor.x - 6, top: cursor.y - 2, width: 20, height: 24 }}
          viewBox="0 0 20 24"
          fill="none"
        >
          <path d="M2 2L18 12L10 14L8 22L2 2Z" fill="#6366f1" stroke="#fff" strokeWidth="1.5" />
        </svg>
      )}

      {/* Highlight box */}
      {highlight && highlight.rect && (
        <div
          className="absolute border-2 rounded transition-all duration-200"
          style={{
            left: highlight.rect.left - 4,
            top: highlight.rect.top - 4,
            width: highlight.rect.width + 8,
            height: highlight.rect.height + 8,
            borderColor: highlight.type === 'pass' ? '#22c55e' : highlight.type === 'fail' ? '#ef4444' : '#818cf8',
            backgroundColor: highlight.type === 'pass' ? 'rgba(34,197,94,0.1)' : highlight.type === 'fail' ? 'rgba(239,68,68,0.1)' : 'rgba(129,140,248,0.1)',
          }}
        >
          <span
            className="absolute -top-6 left-0 text-xs px-1.5 py-0.5 rounded text-white"
            style={{ backgroundColor: highlight.type === 'pass' ? '#22c55e' : highlight.type === 'fail' ? '#ef4444' : '#818cf8' }}
          >
            {highlight.label || highlight.type}
          </span>
        </div>
      )}
    </div>
  );
}

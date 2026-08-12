export default function Header({ mode, onModeChange, modelId, onModelChange, modelProgress, recording }) {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-tg-surface border-b border-tg-border">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-tg-accent">AI Test Generator</h1>
        {recording && (
          <span className="flex items-center gap-1.5 text-xs text-tg-red font-medium">
            <span className="w-2 h-2 bg-tg-red rounded-full animate-pulse-record" />
            Recording
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Mode tabs */}
        <div className="flex bg-tg-bg rounded-lg p-0.5">
          {['text', 'record'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onModeChange(m)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                mode === m ? 'bg-tg-accent text-white' : 'text-tg-muted hover:text-tg-text'
              }`}
            >
              {m === 'text' ? '✏️ Text' : '⏺️ Record'}
            </button>
          ))}
        </div>

        {/* Model selector */}
        <select
          value={modelId}
          onChange={(e) => onModelChange(e.target.value)}
          className="bg-tg-bg border border-tg-border rounded-md px-3 py-1.5 text-sm text-tg-text"
        >
          <option value="qwen-coder">Qwen2.5-Coder</option>
          <option value="phi-mini">Phi-3.5-mini</option>
        </select>
      </div>

      {/* Progress bar */}
      {modelProgress !== null && modelProgress < 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-tg-bg">
          <div
            className="h-full bg-tg-accent transition-all duration-300"
            style={{ width: `${modelProgress * 100}%` }}
          />
        </div>
      )}
    </header>
  );
}

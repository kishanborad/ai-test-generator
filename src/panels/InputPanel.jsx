import { formatAction } from '../recorder/actionTypes.js';
import SpeedSlider from '../components/SpeedSlider.jsx';

export default function InputPanel({
  mode, story, onStoryChange, onGenerate, generating,
  actions, onRecord, onStopRecord, recording,
  url, onUrlChange, speed, onSpeedChange,
}) {
  return (
    <aside className="w-[300px] bg-tg-surface border-r border-tg-border p-4 flex flex-col gap-4 overflow-y-auto">
      {/* URL input */}
      <div>
        <label className="text-xs text-tg-muted uppercase tracking-wide block mb-1">Target</label>
        <input
          type="text"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="Built-in demo or paste URL..."
          className="w-full bg-tg-bg border border-tg-border rounded-md px-3 py-2 text-sm text-tg-text placeholder:text-tg-muted"
        />
      </div>

      {mode === 'text' ? (
        <>
          <div className="flex-1 flex flex-col">
            <label className="text-xs text-tg-muted uppercase tracking-wide block mb-1">User Story</label>
            <textarea
              value={story}
              onChange={(e) => onStoryChange(e.target.value)}
              placeholder="Describe what to test...&#10;&#10;e.g. Test that the contact form validates email and shows a success message"
              className="flex-1 min-h-[200px] bg-tg-bg border border-tg-border rounded-md px-3 py-2 text-sm text-tg-text placeholder:text-tg-muted resize-none"
            />
          </div>
          <button
            type="button"
            onClick={onGenerate}
            disabled={generating || !story.trim()}
            className="w-full py-2.5 bg-tg-accent text-white rounded-lg text-sm font-medium
              hover:bg-tg-accentDim transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? 'Generating...' : '✨ Generate Tests'}
          </button>
        </>
      ) : (
        <>
          <div className="flex-1 flex flex-col">
            <label className="text-xs text-tg-muted uppercase tracking-wide block mb-1">
              Actions ({actions.length})
            </label>
            <div className="flex-1 min-h-[200px] bg-tg-bg border border-tg-border rounded-md p-2 overflow-y-auto">
              {actions.length === 0 && !recording && (
                <p className="text-tg-muted text-xs text-center mt-8">
                  Click Record to start capturing interactions
                </p>
              )}
              {actions.map((action, i) => (
                <div key={i} className="text-xs text-tg-text py-1 border-b border-tg-border last:border-0 font-mono">
                  <span className="text-tg-accent mr-1">{i + 1}.</span>
                  {formatAction(action)}
                </div>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={recording ? onStopRecord : onRecord}
            className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
              recording
                ? 'bg-tg-red text-white hover:bg-red-600'
                : 'bg-tg-accent text-white hover:bg-tg-accentDim'
            }`}
          >
            {recording ? '⏹ Stop Recording' : '⏺ Start Recording'}
          </button>
        </>
      )}

      <SpeedSlider value={speed} onChange={onSpeedChange} />
    </aside>
  );
}

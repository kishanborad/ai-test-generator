import { useCallback, useRef, useState } from 'react';
import type { AppMode, ModelId, ParsedTest, RecordedAction, RunReport } from './types';
import { parseTestCode } from './engine/parser';
import { runTests } from './engine/executor';
import { snapshotDOM } from './ai/domSnapshot';
import { startRecording, stopRecording } from './recorder/recorder';
import Header from './components/Header';
import InputPanel from './panels/InputPanel';
import IframePanel from './panels/IframePanel';
import OutputPanel from './panels/OutputPanel';

export default function App() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const base = import.meta.env.BASE_URL;

  // Mode and model
  const [mode, setMode] = useState<AppMode>('text');
  const [modelId, setModelId] = useState<ModelId>('qwen-coder');
  const [modelProgress, setModelProgress] = useState<number | null>(null);

  // Text mode state
  const [story, setStory] = useState('');
  const [generating, setGenerating] = useState(false);

  // Record mode state
  const [recording, setRecording] = useState(false);
  const [actions, setActions] = useState<RecordedAction[]>([]);

  // Shared state
  const [code, setCode] = useState('');
  const [url, setUrl] = useState(`${base}demo.html`);
  const [speed, setSpeed] = useState(500);
  const [tests, setTests] = useState<ParsedTest[]>([]);
  const [running, setRunning] = useState(false);
  const [report, setReport] = useState<RunReport | null>(null);

  // Visual overlay state
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [highlight, setHighlight] = useState<{ rect: DOMRect; type: string; label?: string } | null>(null);

  const getWorker = useCallback(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker(new URL('./ai/worker.ts', import.meta.url), { type: 'module' });
    }
    return workerRef.current;
  }, []);

  const handleGenerate = useCallback(async () => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument) return;

    setGenerating(true);
    setCode('');
    setReport(null);

    const worker = getWorker();
    const domSnap = snapshotDOM(iframe.contentDocument);

    // Load model first
    worker.postMessage({ type: 'load-model', modelId });

    let modelLoaded = false;
    let fullCode = '';

    worker.onmessage = (e) => {
      const msg = e.data;

      if (!modelLoaded) {
        if (msg.type === 'progress') {
          setModelProgress(msg.progress ?? null);
        } else if (msg.type === 'complete') {
          modelLoaded = true;
          setModelProgress(null);
          // Now generate
          if (mode === 'record' && actions.length > 0) {
            worker.postMessage({ type: 'generate', modelId, actions, domSnapshot: domSnap });
          } else {
            worker.postMessage({ type: 'generate', modelId, userStory: story, domSnapshot: domSnap });
          }
        } else if (msg.type === 'error') {
          setGenerating(false);
          setModelProgress(null);
        }
        return;
      }

      if (msg.type === 'token') {
        fullCode += msg.data;
        setCode(fullCode);
      } else if (msg.type === 'complete') {
        setCode(fullCode || msg.data);
        const parsed = parseTestCode(fullCode || msg.data);
        setTests(parsed);
        setGenerating(false);
      } else if (msg.type === 'error') {
        setGenerating(false);
      }
    };
  }, [modelId, story, mode, actions, getWorker]);

  const handleRun = useCallback(async () => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument || !code.trim()) return;

    const parsed = parseTestCode(code);
    setTests(parsed);
    setRunning(true);
    setReport(null);
    setCursor(null);
    setHighlight(null);

    const result = await runTests(parsed, iframe.contentDocument, {
      stepDelay: speed,
      onCursorMove: (pos: { x: number; y: number }) => setCursor(pos),
      onHighlight: (selector: string, type: string) => {
        const el = iframe.contentDocument?.querySelector(selector);
        if (el) {
          setHighlight({ rect: el.getBoundingClientRect(), type, label: selector });
        }
      },
      onStepComplete: () => {},
    });

    setReport(result);
    setRunning(false);
    setCursor(null);
    setTimeout(() => setHighlight(null), 1000);
  }, [code, speed]);

  const handleRecord = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument) return;
    setActions([]);
    setRecording(true);
    startRecording(iframe.contentDocument, (action) => {
      setActions((prev) => [...prev, action]);
    });
  }, []);

  const handleStopRecord = useCallback(() => {
    stopRecording();
    setRecording(false);
    // Auto-trigger generation from recording
    handleGenerate();
  }, [handleGenerate]);

  const handleFix = useCallback((context: { error: string; expected: string; actual: string; stepCode: string }) => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument) return;

    setGenerating(true);
    const worker = getWorker();
    const domSnap = snapshotDOM(iframe.contentDocument);

    worker.postMessage({
      type: 'fix',
      modelId,
      failureContext: { ...context, domSnapshot: domSnap },
    });

    let fullCode = '';
    worker.onmessage = (e) => {
      const msg = e.data;
      if (msg.type === 'token') {
        fullCode += msg.data;
        setCode(fullCode);
      } else if (msg.type === 'complete') {
        setCode(fullCode || msg.data);
        setTests(parseTestCode(fullCode || msg.data));
        setGenerating(false);
      } else if (msg.type === 'error') {
        setGenerating(false);
      }
    };
  }, [modelId, getWorker]);

  return (
    <div className="h-screen flex flex-col bg-tg-bg">
      <Header
        mode={mode}
        onModeChange={(m: AppMode) => setMode(m)}
        modelId={modelId}
        onModelChange={(m: ModelId) => setModelId(m)}
        modelProgress={modelProgress}
        recording={recording}
      />

      <div className="flex flex-1 overflow-hidden">
        <InputPanel
          mode={mode}
          story={story}
          onStoryChange={setStory}
          onGenerate={handleGenerate}
          generating={generating}
          actions={actions}
          onRecord={handleRecord}
          onStopRecord={handleStopRecord}
          recording={recording}
          url={url}
          onUrlChange={setUrl}
          speed={speed}
          onSpeedChange={setSpeed}
        />

        <IframePanel
          url={url}
          iframeRef={iframeRef}
          cursor={cursor}
          highlight={highlight}
          running={running}
        />

        <OutputPanel
          code={code}
          onCodeChange={setCode}
          onRun={handleRun}
          running={running}
          report={report}
          onFix={handleFix}
          tests={tests}
        />
      </div>
    </div>
  );
}

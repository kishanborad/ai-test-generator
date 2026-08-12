import Overlay from '../components/Overlay.jsx';

export default function IframePanel({ url, iframeRef, cursor, highlight, running }) {
  return (
    <main className="flex-1 relative bg-white">
      <iframe
        ref={iframeRef}
        src={url}
        className="w-full h-full border-0"
        title="Test target"
      />
      <Overlay cursor={cursor} highlight={highlight} running={running} />
    </main>
  );
}

import Overlay from '../components/Overlay.jsx';

export default function IframePanel({ url, iframeRef, cursor, highlight, running }) {
  return (
    <main className="relative bg-white h-full w-full">
      <iframe
        ref={iframeRef}
        src={url}
        className="absolute inset-0 w-full h-full border-0"
        title="Test target"
      />
      <Overlay cursor={cursor} highlight={highlight} running={running} />
    </main>
  );
}

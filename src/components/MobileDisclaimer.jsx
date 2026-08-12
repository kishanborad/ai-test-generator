import { useState } from 'react';

export default function MobileDisclaimer() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-tg-accent/90 text-white px-4 py-3 text-sm text-center z-50 backdrop-blur-sm">
      <p>For the full experience, open on a laptop or desktop.</p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-3 text-white/70 hover:text-white text-lg"
      >
        ✕
      </button>
    </div>
  );
}

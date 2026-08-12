// Placeholder — full demo app implemented in Task 2
import { createRoot } from 'react-dom/client';

function DemoApp() {
  return (
    <div style={{ fontFamily: 'system-ui', padding: '2rem', color: '#e2e8f0', background: '#0a0e1a', minHeight: '100vh' }}>
      <h1>Demo App — coming in Task 2</h1>
    </div>
  );
}

createRoot(document.getElementById('demo-root')).render(<DemoApp />);

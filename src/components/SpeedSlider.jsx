export default function SpeedSlider({ value, onChange }) {
  const labels = { 200: 'Fast', 500: 'Normal', 1000: 'Slow' };
  const closest = Object.keys(labels).reduce((prev, curr) =>
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
  );

  return (
    <div className="mt-4">
      <label className="text-xs text-tg-muted uppercase tracking-wide block mb-1">
        Speed: {labels[closest] || `${value}ms`}
      </label>
      <input
        type="range"
        min={100}
        max={1500}
        step={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-tg-accent"
      />
    </div>
  );
}

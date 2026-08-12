const STYLES = {
  happy: 'bg-tg-green/20 text-tg-green border-tg-green/30',
  negative: 'bg-tg-red/20 text-tg-red border-tg-red/30',
  edge: 'bg-tg-amber/20 text-tg-amber border-tg-amber/30',
};

const LABELS = {
  happy: 'Happy Path',
  negative: 'Negative',
  edge: 'Edge Case',
};

export default function CategoryBadge({ category }) {
  return (
    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full border ${STYLES[category] || ''}`}>
      {LABELS[category] || category}
    </span>
  );
}

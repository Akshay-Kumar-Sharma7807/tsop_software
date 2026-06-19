/**
 * SummaryBar — top stat row: totals, red/amber/green counts, avg completion %.
 */
export default function SummaryBar({ teams }) {
  const total = teams.length;
  const red = teams.filter((t) => t.color === 'red').length;
  const amber = teams.filter((t) => t.color === 'amber').length;
  const green = teams.filter((t) => t.color === 'green').length;
  const avgPct =
    total > 0
      ? (teams.reduce((sum, t) => sum + (t.pct || 0), 0) / total).toFixed(1)
      : '0.0';

  const stats = [
    { label: 'Total Teams', value: total, color: 'text-surface-800', bg: 'bg-surface-100' },
    { label: 'Critical', value: red, color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
    { label: 'Needs Attention', value: amber, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
    { label: 'On Track', value: green, color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {stats.map(({ label, value, color, bg, border }) => (
        <div
          key={label}
          className={`card px-4 py-3 flex flex-col gap-1 ${bg} ${border ? `border border-${border}` : ''}`}
        >
          <span className="text-xs font-medium text-surface-500 uppercase tracking-wide">
            {label}
          </span>
          <span className={`text-2xl font-bold ${color}`}>{value}</span>
        </div>
      ))}
    </div>
  );
}

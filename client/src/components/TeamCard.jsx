import { useState } from 'react';
import MeetingHistory from './MeetingHistory';

const COLOR_STYLES = {
  red: {
    border: 'border-l-red-500',
    dot: 'bg-red-500',
    pctColor: 'text-red-600',
    headerBg: 'hover:bg-red-50',
    expandedBg: 'bg-red-50/40',
    bar: 'bg-red-400',
  },
  amber: {
    border: 'border-l-amber-500',
    dot: 'bg-amber-400',
    pctColor: 'text-amber-600',
    headerBg: 'hover:bg-amber-50',
    expandedBg: 'bg-amber-50/40',
    bar: 'bg-amber-400',
  },
  green: {
    border: 'border-l-green-500',
    dot: 'bg-green-500',
    pctColor: 'text-green-600',
    headerBg: 'hover:bg-green-50',
    expandedBg: 'bg-green-50/30',
    bar: 'bg-green-500',
  },
};

function StatusBadge({ label, value }) {
  const cls = {
    yes: 'bg-green-100 text-green-700 border-green-200',
    no: 'bg-red-100 text-red-700 border-red-200',
    'in progress': 'bg-amber-100 text-amber-700 border-amber-200',
  }[value] || 'bg-red-100 text-red-700 border-red-200';

  const icon = { yes: '✓', no: '✗', 'in progress': '~' }[value] || '✗';

  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${cls}`}>
      <span className="font-bold">{label}</span>
      <span>{icon}</span>
    </span>
  );
}

export default function TeamCard({ team }) {
  const [expanded, setExpanded] = useState(false);
  const { color, failedConstraints, pct, latest } = team;
  const styles = COLOR_STYLES[color] || COLOR_STYLES.green;

  return (
    <div
      id={`team-card-${team._id}`}
      className={`bg-white rounded-xl border border-surface-200 border-l-4 ${styles.border} shadow-sm overflow-hidden transition-shadow hover:shadow-md`}
    >
      {/* ── Accordion Header Row ── */}
      <button
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
        className={`w-full text-left px-4 py-3.5 flex items-center gap-4 transition-colors ${styles.headerBg}`}
      >
        {/* Color dot */}
        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${styles.dot}`} />

        {/* Team name + TAC + Domain */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-surface-900 text-sm">{team.name}</span>
            {team.tac && (
              <span className="text-xs text-surface-400">TAC: {team.tac}</span>
            )}
            {team.domain && (
              <span className="text-xs bg-surface-100 text-surface-500 px-2 py-0.5 rounded-full border border-surface-200">
                {team.domain}
              </span>
            )}
          </div>
        </div>

        {/* Progress bar (compact) */}
        <div className="hidden sm:flex flex-col gap-1 w-36 flex-shrink-0">
          <div className="flex justify-between text-xs text-surface-400">
            <span>{latest?.sessionsDone ?? 0}/{latest?.totalGoal ?? 0}</span>
          </div>
          <div className="h-1.5 bg-surface-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${styles.bar} rounded-full`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
        </div>

        {/* TM / DM / ADM badges */}
        {latest && (
          <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
            <StatusBadge label="TM" value={latest.tm} />
            <StatusBadge label="DM" value={latest.dm} />
            <StatusBadge label="ADM" value={latest.adm} />
          </div>
        )}

        {/* Failed constraint chips */}
        {failedConstraints.length > 0 && (
          <div className="hidden lg:flex items-center gap-1 flex-shrink-0">
            {failedConstraints.slice(0, 2).map((fc) => (
              <span
                key={fc}
                className="text-xs bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
              >
                {fc}
              </span>
            ))}
            {failedConstraints.length > 2 && (
              <span className="text-xs text-red-500 font-medium">+{failedConstraints.length - 2}</span>
            )}
          </div>
        )}

        {/* Completion % */}
        <span className={`text-base font-extrabold flex-shrink-0 w-14 text-right ${styles.pctColor}`}>
          {pct.toFixed(1)}%
        </span>

        {/* Chevron */}
        <svg
          className={`w-4 h-4 text-surface-400 flex-shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* ── Expanded Body ── */}
      {expanded && (
        <div className={`border-t border-surface-100 px-5 pb-5 pt-4 ${styles.expandedBg}`}>

          {/* Mobile: show badges + progress here */}
          <div className="flex flex-wrap gap-3 mb-4">
            {/* TM/DM/ADM (always visible on expand) */}
            {latest && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <StatusBadge label="TM" value={latest.tm} />
                <StatusBadge label="DM" value={latest.dm} />
                <StatusBadge label="ADM" value={latest.adm} />
              </div>
            )}

            {/* Members */}
            {latest && (
              <div className="flex items-center gap-3 text-sm text-surface-600 ml-auto">
                <span>
                  <span className="font-semibold text-surface-800">{latest.members ?? '—'}</span>
                  <span className="text-xs text-surface-400 ml-1">members</span>
                </span>
              </div>
            )}
          </div>

          {/* Failed constraints — all of them */}
          {failedConstraints.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {failedConstraints.map((fc) => (
                <span
                  key={fc}
                  className="text-xs bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full font-medium"
                >
                  {fc}
                </span>
              ))}
            </div>
          )}

          {/* Progress bar (full width on expand) */}
          {latest && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-surface-500 mb-1.5">
                <span>{latest.sessionsDone} sessions done</span>
                <span>Goal: {latest.totalGoal}</span>
              </div>
              <div className="h-2.5 bg-surface-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${styles.bar} rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Meeting History chart + table */}
          <MeetingHistory meetings={team.meetings} teamName={team.name} />
        </div>
      )}
    </div>
  );
}

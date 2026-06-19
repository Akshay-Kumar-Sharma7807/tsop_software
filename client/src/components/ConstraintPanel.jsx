import { useState } from 'react';
import { useConstraints } from '../context/ConstraintContext';

/**
 * ConstraintPanel — collapsible accordion with toggles and sliders.
 * Sliders use local state so they drag smoothly; API is only called on release (onPointerUp).
 */
export default function ConstraintPanel() {
  const { constraints, updateConstraints, loading } = useConstraints();
  const [open, setOpen] = useState(false);

  // Local slider state — keeps UI snappy while dragging
  const [localMembers, setLocalMembers] = useState(null);

  const toggleEnabled = (path, value) => {
    updateConstraints({ [path]: { enabled: value } });
  };

  // Commit slider value to context + API only when user releases
  const commitSlider = (path, value) => {
    updateConstraints({ [path]: { value } });
  };

  if (loading) return null;

  const activeMembers = localMembers ?? constraints.minTotalMembers?.value ?? 5;

  const activeCount = [
    constraints.tmRequired?.enabled,
    constraints.dmRequired?.enabled,
    constraints.admRequired?.enabled,
    constraints.minTotalMembers?.enabled,
  ].filter(Boolean).length;

  return (
    <div className="card mb-6 overflow-hidden">
      {/* Accordion Header */}
      <button
        id="constraint-panel-toggle"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-surface-50 transition-colors"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <span className="font-semibold text-surface-800">Constraints</span>
          <span className="text-xs bg-surface-100 text-surface-500 px-2 py-0.5 rounded-full">
            {activeCount} active
          </span>
        </div>
        <svg
          className={`w-5 h-5 text-surface-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Accordion Body */}
      <div
        className="accordion-content"
        style={{ maxHeight: open ? '600px' : '0px', opacity: open ? 1 : 0 }}
      >
        <div className="px-5 pb-5 pt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 border-t border-surface-100">

          {/* TM Required */}
          <ConstraintRow
            id="constraint-tm"
            label="TM Attendance"
            description="Flag if Team Manager absent"
            enabled={constraints.tmRequired?.enabled}
            onToggle={(v) => toggleEnabled('tmRequired', v)}
          />

          {/* DM Required */}
          <ConstraintRow
            id="constraint-dm"
            label="DM Attendance"
            description="Flag if Deputy Manager absent"
            enabled={constraints.dmRequired?.enabled}
            onToggle={(v) => toggleEnabled('dmRequired', v)}
          />

          {/* ADM Required */}
          <ConstraintRow
            id="constraint-adm"
            label="ADM Attendance"
            description="Flag if Asst. Deputy Manager absent"
            enabled={constraints.admRequired?.enabled}
            onToggle={(v) => toggleEnabled('admRequired', v)}
          />

          {/* Min Total Members */}
          <ConstraintRow
            id="constraint-members"
            label="Min Total Members"
            description="Flag teams below this member count"
            enabled={constraints.minTotalMembers?.enabled}
            onToggle={(v) => toggleEnabled('minTotalMembers', v)}
          >
            <div className="flex items-center gap-3 mt-3">
              <input
                type="range" min={1} max={20} step={1}
                value={activeMembers}
                disabled={!constraints.minTotalMembers?.enabled}
                onChange={(e) => setLocalMembers(Number(e.target.value))}
                onPointerUp={(e) => {
                  const v = Number(e.target.value);
                  setLocalMembers(null);
                  commitSlider('minTotalMembers', v);
                }}
                className="flex-1 h-2 rounded-full cursor-pointer disabled:opacity-40
                           accent-surface-700"
                aria-label="Min total members"
              />
              <span className="text-sm font-bold text-surface-800 w-8 text-right tabular-nums">
                {activeMembers}
              </span>
            </div>
          </ConstraintRow>

        </div>
      </div>
    </div>
  );
}

function ConstraintRow({ id, label, description, enabled, onToggle, children }) {
  return (
    <div className={`p-3 rounded-lg border transition-all duration-150
      ${enabled ? 'bg-white border-surface-200' : 'bg-surface-50 border-surface-100 opacity-70'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-surface-800 leading-tight">{label}</p>
          <p className="text-xs text-surface-500 mt-0.5">{description}</p>
        </div>
        {/* Toggle switch */}
        <button
          id={id}
          role="switch"
          aria-checked={enabled}
          onClick={() => onToggle(!enabled)}
          className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent
            transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-surface-500 focus:ring-offset-1
            ${enabled ? 'bg-surface-700' : 'bg-surface-300'}`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow
              transition duration-200 ${enabled ? 'translate-x-4' : 'translate-x-0'}`}
          />
        </button>
      </div>
      {children}
    </div>
  );
}

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import api from '../api';
import { evaluateParam, STATUS_ORDER, STATUS_STYLES } from '../utils/paramEval';


/* ── Single parameter card ─────────────────────────────────────── */
function ParamCard({ param, valueObj, onChange }) {
  const status = evaluateParam(param, valueObj);
  const value = valueObj?.value ?? '';
  const s = STATUS_STYLES[status];

  const handleStatusChange = (e) => onChange({ value, status: e.target.value });
  const handleValueChange = (val) => onChange({ value: val, status });

  return (
    <div className={`rounded-xl border p-3 transition-all duration-300 ${s.bg} ${s.border}`}>
      <div className="flex items-start gap-2">
        {/* Status dot */}
        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 transition-colors duration-300 ${s.dot}`} />
        <div className="flex-1 min-w-0">
          {/* Label row */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-semibold text-surface-800 leading-tight">{param.name}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${s.badge}`}>
              {s.label}
            </span>
          </div>
          {/* Category & hint */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] text-surface-400 italic">{param.category}</span>
            {param.hint && (
              <span className="text-[10px] text-surface-400" title={param.hint}>ℹ</span>
            )}
          </div>
          <div className="flex gap-2 items-start">
            <div className="flex-1">
              <textarea
                value={value ?? ''}
                onChange={e => handleValueChange(e.target.value)}
                placeholder="Enter value…"
                rows={2}
                className="w-full border border-surface-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-surface-400 bg-white resize-none"
              />
            </div>
            <div className="w-32 flex-shrink-0">
              <select 
                value={status} 
                onChange={handleStatusChange}
                className="w-full border border-surface-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-surface-400 bg-white"
              >
                <option value="empty">Empty</option>
                <option value="green">Done (Green)</option>
                <option value="yellow">Partial (Yellow)</option>
                <option value="red">Attention (Red)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main section ──────────────────────────────────────────────── */
export default function ParameterFormSection({ values = {}, onChange, team }) {
  const [params, setParams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [errorMsg, setErrorMsg] = useState('');
  
  // Capture initial values so parameters don't jump around while filling the form
  const initialValuesRef = useRef(values);

  useEffect(() => {
    api.get('/api/parameters?enabled=true')
      .then(({ data }) => setParams(data))
      .catch(err => {
        console.error(err);
        setErrorMsg(err.message || String(err));
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = useCallback((id, val) => {
    onChange(id, val);
  }, [onChange]);

  /* Filter parameters by target domains and target teams */
  const activeParams = useMemo(() => {
    return params.filter(p => {
      const isGlobal = (!p.teams || p.teams.length === 0) && (!p.domains || p.domains.length === 0);
      if (isGlobal) return true;
      if (team && p.teams && p.teams.includes(team._id)) return true;
      if (team && team.domain && p.domains && p.domains.includes(team.domain)) return true;
      return false;
    });
  }, [params, team]);

  /* Sort: empty→red→yellow→green, then by order */
  const sorted = useMemo(() => {
    let list = [...activeParams];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    if (filterStatus !== 'all') {
      list = list.filter(p => evaluateParam(p, values[p._id]) === filterStatus);
    }
    return list.sort((a, b) => {
      // Use initial values for sorting to prevent live jumping
      const sa = STATUS_ORDER[evaluateParam(a, initialValuesRef.current[a._id])];
      const sb = STATUS_ORDER[evaluateParam(b, initialValuesRef.current[b._id])];
      if (sa !== sb) return sa - sb;
      return (a.order ?? 0) - (b.order ?? 0);
    });
  }, [activeParams, values, search, filterStatus]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-4 text-xs text-surface-400">
        <div className="w-4 h-4 border-2 border-surface-200 border-t-surface-600 rounded-full animate-spin" />
        Loading parameters…
      </div>
    );
  }
  if (!activeParams || activeParams.length === 0) {
    return (
      <div className="text-center py-4 text-sm text-surface-500 border border-dashed border-surface-300 rounded-lg bg-surface-50">
        <p>No parameters found.</p>
        {errorMsg && <p className="text-red-500 mt-2 text-xs font-mono">{errorMsg}</p>}
      </div>
    );
  }

  /* Stats */
  const counts = activeParams.reduce((acc, p) => {
    acc[evaluateParam(p, values[p._id])]++;
    return acc;
  }, { empty: 0, red: 0, yellow: 0, green: 0 });
  const greenPct = Math.round((counts.green / activeParams.length) * 100);

  return (
    <div className="flex flex-col gap-3">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-surface-800">Meeting Parameters</h3>
          <p className="text-[10px] text-surface-500 mt-0.5">Fill all fields — done items move to the bottom automatically</p>
        </div>
        <div className="text-right">
          <div className="text-xs font-bold text-surface-700">{counts.green}/{activeParams.length}</div>
          <div className="text-[10px] text-surface-400">completed</div>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-surface-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${greenPct}%`,
              background: greenPct === 100
                ? '#22c55e'
                : `linear-gradient(90deg, #ef4444 0%, #f59e0b ${greenPct}%, #22c55e ${greenPct}%)`,
            }}
          />
        </div>
        <span className="text-xs font-semibold text-surface-600">{greenPct}%</span>
      </div>

      {/* ── Status chips ── */}
      <div className="flex flex-wrap gap-1.5">
        {[
          { key: 'all',    label: `All (${activeParams.length})`,      cls: 'bg-surface-100 text-surface-600' },
          { key: 'empty',  label: `Empty (${counts.empty})`,     cls: 'bg-gray-100 text-gray-600' },
          { key: 'red',    label: `Attention (${counts.red})`,   cls: 'bg-red-100 text-red-600' },
          { key: 'yellow', label: `Partial (${counts.yellow})`,  cls: 'bg-amber-100 text-amber-600' },
          { key: 'green',  label: `Done (${counts.green})`,      cls: 'bg-green-100 text-green-600' },
        ].map(({ key, label, cls }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilterStatus(key)}
            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border transition-all ${
              filterStatus === key ? `${cls} border-current` : 'bg-white border-surface-200 text-surface-500'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Search ── */}
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search parameters…"
        className="w-full border border-surface-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-surface-400"
      />

      {/* ── Param cards ── */}
      <div className="flex flex-col gap-2 max-h-[480px] overflow-y-auto pr-1">
        {sorted.length === 0 ? (
          <p className="text-xs text-surface-400 text-center py-4">No parameters match your filter.</p>
        ) : (
          sorted.map(p => (
            <ParamCard
              key={p._id}
              param={p}
              valueObj={values[p._id]}
              onChange={val => handleChange(p._id, val)}
            />
          ))
        )}
      </div>
    </div>
  );
}

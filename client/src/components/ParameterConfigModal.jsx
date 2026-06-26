import { useState } from 'react';

const CATEGORIES = [
  'Meeting Setup', 'Goals & Performance', 'Member Management',
  'Planning & Follow-up', 'Operations', 'Governance & SOP',
  'Team Culture', 'Session Quality', 'Center Feedback', 'General',
];

const DOMAIN_OPTIONS = ['Sunshine', 'HR', 'GM', 'Tech', 'GD', 'SMM'];

const EMPTY_FORM = {
  name: '', category: 'General', enabled: true, required: false,
  hint: '', domains: [], teams: []
};

function Label({ children }) {
  return <label className="block text-xs font-semibold text-surface-600 mb-1">{children}</label>;
}
function Input({ value, onChange, ...props }) {
  return (
    <input
      value={value}
      onChange={onChange}
      className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-surface-400"
      {...props}
    />
  );
}
function Toggle({ label, checked, onChange, description }) {
  return (
    <div className="flex items-center justify-between p-3 bg-surface-50 rounded-lg border border-surface-200">
      <div>
        <div className="text-xs font-semibold text-surface-700">{label}</div>
        {description && <div className="text-[10px] text-surface-400 mt-0.5">{description}</div>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors ${checked ? 'bg-green-500' : 'bg-surface-300'}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${checked ? 'left-5' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

export default function ParameterConfigModal({ param, teams = [], onClose, onSave }) {
  const [form, setForm] = useState(param ? {
    name: param.name ?? '', category: param.category ?? 'General',
    enabled: param.enabled ?? true,
    required: param.required ?? false, hint: param.hint ?? '',
    domains: param.domains ?? [], teams: param.teams ?? []
  } : { ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] px-4 py-6">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200">
          <div>
            <h2 className="text-base font-bold text-surface-900">{param ? 'Edit Parameter' : 'Add Parameter'}</h2>
            <p className="text-xs text-surface-500 mt-0.5">Configure name, type, and condition</p>
          </div>
          <button onClick={onClose} className="text-surface-400 hover:text-surface-600 p-1.5 rounded-full hover:bg-surface-100">✕</button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

          {/* Name */}
          <div>
            <Label>Parameter Name *</Label>
            <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Goal sheet link" required />
          </div>

          {/* Category */}
          <div>
            <Label>Category</Label>
            <select
              value={form.category}
              onChange={e => set('category', e.target.value)}
              className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-surface-400"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Target Domains */}
          <div>
            <Label>Target Domains (leave empty for all)</Label>
            <div className="flex flex-col gap-2 mt-1">
              <select
                className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-surface-400 bg-white"
                onChange={(e) => {
                  const val = e.target.value;
                  if (val && !form.domains.includes(val)) {
                    set('domains', [...form.domains, val]);
                  }
                  e.target.value = "";
                }}
              >
                <option value="">— Add a Domain —</option>
                {DOMAIN_OPTIONS.filter(d => !form.domains.includes(d)).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              {form.domains.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.domains.map(d => (
                    <span key={d} className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 flex items-center border border-blue-200">
                      {d}
                      <button type="button" onClick={() => set('domains', form.domains.filter(x => x !== d))} className="ml-1.5 text-blue-500 hover:text-blue-900 font-bold">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Target Teams */}
          <div>
            <Label>Target Teams (leave empty for all)</Label>
            <div className="flex flex-col gap-2 mt-1">
              <select
                className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-surface-400 bg-white"
                onChange={(e) => {
                  const val = e.target.value;
                  if (val && !form.teams.includes(val)) {
                    set('teams', [...form.teams, val]);
                  }
                  e.target.value = "";
                }}
              >
                <option value="">— Add a Team —</option>
                {teams.filter(t => !form.teams.includes(t._id)).map(t => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>
              {form.teams.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.teams.map(tid => {
                    const t = teams.find(x => x._id === tid);
                    return (
                      <span key={tid} className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-800 flex items-center border border-purple-200">
                        {t ? t.name : tid}
                        <button type="button" onClick={() => set('teams', form.teams.filter(x => x !== tid))} className="ml-1.5 text-purple-500 hover:text-purple-900 font-bold">×</button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>          {/* Hint */}
          <div>
            <Label>Hint / Description (optional)</Label>
            <Input
              value={form.hint}
              onChange={e => set('hint', e.target.value)}
              placeholder="Helper text shown to admin when filling this parameter"
            />
          </div>

          {/* Toggles */}
          <div className="flex flex-col gap-2">
            <Toggle
              label="Enabled"
              checked={form.enabled}
              onChange={v => set('enabled', v)}
              description="Disabled parameters won't appear in meeting forms"
            />
            <Toggle
              label="Required"
              checked={form.required}
              onChange={v => set('required', v)}
              description="Mark as mandatory (shown with * indicator)"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-surface-200 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 border border-surface-200 text-surface-600 rounded-xl px-4 py-2 text-sm font-semibold hover:bg-surface-50">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} disabled={saving} className="flex-1 bg-surface-900 text-white rounded-xl px-4 py-2 text-sm font-semibold hover:bg-surface-800 disabled:opacity-50">
            {saving ? 'Saving…' : (param ? 'Update' : 'Add Parameter')}
          </button>
        </div>
      </div>
    </div>
  );
}

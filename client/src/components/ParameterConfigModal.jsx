import { useState } from 'react';

const CATEGORIES = [
  'Meeting Setup', 'Goals & Performance', 'Member Management',
  'Planning & Follow-up', 'Operations', 'Governance & SOP',
  'Team Culture', 'Session Quality', 'Center Feedback', 'General',
];

const DATA_TYPES = [
  { value: 'yesno',  label: 'Yes / No',  desc: 'Dropdown: Yes, No, In Progress' },
  { value: 'number', label: 'Number',    desc: 'Numeric input with custom thresholds' },
  { value: 'text',   label: 'Text',      desc: 'Free-text / multi-line answer' },
  { value: 'url',    label: 'URL / Link',desc: 'Web link (validated format)' },
];

const EMPTY_FORM = {
  name: '', category: 'General', dataType: 'text', enabled: true, required: false,
  hint: '', yesIsGreen: true, allowInProgress: true,
  redMax: '', yellowMax: '', filledIsGreen: true,
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

export default function ParameterConfigModal({ param, onClose, onSave }) {
  const [form, setForm] = useState(param ? {
    name: param.name ?? '', category: param.category ?? 'General',
    dataType: param.dataType ?? 'text', enabled: param.enabled ?? true,
    required: param.required ?? false, hint: param.hint ?? '',
    yesIsGreen: param.yesIsGreen ?? true, allowInProgress: param.allowInProgress ?? true,
    redMax: param.redMax ?? '', yellowMax: param.yellowMax ?? '',
    filledIsGreen: param.filledIsGreen ?? true,
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
        ...form,
        redMax:    form.redMax    !== '' ? Number(form.redMax)    : null,
        yellowMax: form.yellowMax !== '' ? Number(form.yellowMax) : null,
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

          {/* Data Type */}
          <div>
            <Label>Data Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {DATA_TYPES.map(dt => (
                <button
                  key={dt.value}
                  type="button"
                  onClick={() => set('dataType', dt.value)}
                  className={`text-left p-3 rounded-xl border text-xs transition-all ${
                    form.dataType === dt.value
                      ? 'border-surface-800 bg-surface-900 text-white'
                      : 'border-surface-200 bg-surface-50 text-surface-600 hover:border-surface-400'
                  }`}
                >
                  <div className="font-semibold">{dt.label}</div>
                  <div className={`mt-0.5 text-[10px] ${form.dataType === dt.value ? 'text-surface-300' : 'text-surface-400'}`}>{dt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Condition Config — yesno */}
          {form.dataType === 'yesno' && (
            <div className="flex flex-col gap-2 p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-xs font-bold text-blue-800 mb-1">Yes/No Conditions</p>
              <Toggle
                label="'Yes' answer = Green"
                checked={form.yesIsGreen}
                onChange={v => set('yesIsGreen', v)}
                description="Disable if 'No' should be the target answer"
              />
              <Toggle
                label="Allow 'In Progress' (Yellow)"
                checked={form.allowInProgress}
                onChange={v => set('allowInProgress', v)}
                description="Show 'In Progress' as a valid answer (amber)"
              />
            </div>
          )}

          {/* Condition Config — number */}
          {form.dataType === 'number' && (
            <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl">
              <p className="text-xs font-bold text-orange-800 mb-3">Number Thresholds</p>
              <p className="text-[10px] text-orange-600 mb-3">
                ≤ Red Max → 🔴 Red &nbsp;|&nbsp; ≤ Yellow Max → 🟡 Yellow &nbsp;|&nbsp; Above both → 🟢 Green
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Red Max (≤ this = red)</Label>
                  <Input
                    type="number"
                    value={form.redMax}
                    onChange={e => set('redMax', e.target.value)}
                    placeholder="e.g. 3 (leave blank = no threshold)"
                  />
                </div>
                <div>
                  <Label>Yellow Max (≤ this = yellow)</Label>
                  <Input
                    type="number"
                    value={form.yellowMax}
                    onChange={e => set('yellowMax', e.target.value)}
                    placeholder="e.g. 7"
                  />
                </div>
              </div>
              <p className="text-[10px] text-orange-500 mt-2">Leave blank to skip that threshold (e.g. only red/green, no yellow).</p>
            </div>
          )}

          {/* Condition Config — text/url */}
          {(form.dataType === 'text' || form.dataType === 'url') && (
            <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
              <p className="text-xs font-bold text-green-800 mb-2">Text / URL Conditions</p>
              <Toggle
                label="Filled = Green (any non-empty value is green)"
                checked={form.filledIsGreen}
                onChange={v => set('filledIsGreen', v)}
                description="If off, filling the field is considered red"
              />
            </div>
          )}

          {/* Hint */}
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

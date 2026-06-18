import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useConstraints } from '../context/ConstraintContext';

const ADMIN_PASSWORD = 'adore2024';

// ─── Reusable Input ───────────────────────────────────────────────
function Field({ label, id, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-surface-600 mb-1">{label}</label>
      <input id={id} className="input" {...props} />
    </div>
  );
}

function SelectField({ label, id, value, onChange, options }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-surface-600 mb-1">{label}</label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        className="input"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

const STATUS_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'in progress', label: 'In Progress' },
];

const EMPTY_TEAM = { name: '', tac: '', domain: '' };
const EMPTY_MEETING = {
  date: '', tm: 'no', dm: 'no', adm: 'no',
  members: '', totalGoal: '', sessionsDone: '', newMembers: '', centerFeedbackMeetings: '',
};

// ─── Password Gate ────────────────────────────────────────────────
function PasswordGate({ onUnlock }) {
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (pwd === ADMIN_PASSWORD) {
      onUnlock();
    } else {
      setError('Incorrect password. Try again.');
      setPwd('');
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4">
      <div className="card w-full max-w-sm p-8 text-center">
        <div className="w-12 h-12 bg-surface-800 rounded-xl mx-auto mb-4 flex items-center justify-center">
          <span className="text-white text-xl">🔒</span>
        </div>
        <h1 className="text-xl font-bold text-surface-900 mb-1">Admin Panel</h1>
        <p className="text-sm text-surface-500 mb-6">TSoP Dashboard — Adore India</p>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <input
            id="admin-password"
            type="password"
            className="input text-center"
            placeholder="Enter admin password"
            value={pwd}
            onChange={(e) => { setPwd(e.target.value); setError(''); }}
            autoFocus
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button type="submit" className="btn-primary py-2.5">Unlock</button>
        </form>
        <Link to="/" className="inline-block mt-4 text-xs text-surface-400 hover:text-surface-600">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

// ─── Team Form Modal ──────────────────────────────────────────────
function TeamModal({ team, onClose, onSave }) {
  const [form, setForm] = useState(
    team ? { name: team.name, tac: team.tac, domain: team.domain || '' } : EMPTY_TEAM
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="card w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-surface-900 mb-4">
          {team ? 'Edit Team' : 'Add New Team'}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field id="team-name" label="Team Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Field id="team-tac" label="TAC Name" value={form.tac} onChange={(e) => setForm({ ...form, tac: e.target.value })} />
          <Field id="team-domain" label="Domain" placeholder="e.g. Education, Health…" value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} />
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Meeting Form Modal ───────────────────────────────────────────
function MeetingModal({ meeting, teamName, onClose, onSave }) {
  const [form, setForm] = useState(meeting ? { ...meeting } : { ...EMPTY_MEETING });
  const [saving, setSaving] = useState(false);

  const f = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        ...form,
        members: Number(form.members),
        totalGoal: Number(form.totalGoal),
        sessionsDone: Number(form.sessionsDone),
        newMembers: Number(form.newMembers),
        centerFeedbackMeetings: Number(form.centerFeedbackMeetings),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
      <div className="card w-full max-w-lg p-6">
        <h2 className="text-lg font-bold text-surface-900 mb-1">
          {meeting ? 'Edit Meeting' : 'Add Meeting'}
        </h2>
        <p className="text-sm text-surface-500 mb-4">Team: <strong>{teamName}</strong></p>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field id="m-date" label="Date" type="date" value={form.date?.slice(0, 10) || ''} onChange={f('date')} required />
          </div>
          <SelectField id="m-tm" label="TM" value={form.tm} onChange={f('tm')} options={STATUS_OPTIONS} />
          <SelectField id="m-dm" label="DM" value={form.dm} onChange={f('dm')} options={STATUS_OPTIONS} />
          <SelectField id="m-adm" label="ADM" value={form.adm} onChange={f('adm')} options={STATUS_OPTIONS} />
          <Field id="m-members" label="Members Present" type="number" min={0} value={form.members} onChange={f('members')} />
          <Field id="m-goal" label="Total Goal" type="number" min={0} value={form.totalGoal} onChange={f('totalGoal')} required />
          <Field id="m-done" label="Sessions Done" type="number" min={0} value={form.sessionsDone} onChange={f('sessionsDone')} />
          <Field id="m-new" label="New Members" type="number" min={0} value={form.newMembers} onChange={f('newMembers')} />
          <Field id="m-cfm" label="Center Feedback Meetings" type="number" min={0} value={form.centerFeedbackMeetings} onChange={f('centerFeedbackMeetings')} />
          <div className="col-span-2 flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Constraint Admin Section ─────────────────────────────────────
function ConstraintAdmin() {
  const { constraints, updateConstraints } = useConstraints();

  const t = (path, key, value) => updateConstraints({ [path]: { [key]: value } });

  const rows = [
    { id: 'adm-min-pct', path: 'minCompletionPct', label: 'Min Completion %', hasValue: true, min: 0, max: 100, step: 5 },
    { id: 'adm-tm', path: 'tmRequired', label: 'TM Attendance Required', hasValue: false },
    { id: 'adm-dm', path: 'dmRequired', label: 'DM (Deputy Manager) Required', hasValue: false },
    { id: 'adm-adm', path: 'admRequired', label: 'ADM (Asst. Deputy Manager) Required', hasValue: false },
    { id: 'adm-members', path: 'minNewMembers', label: 'Min New Members', hasValue: true, min: 0, max: 10, step: 1 },
  ];

  return (
    <div className="card p-6">
      <h2 className="text-lg font-bold text-surface-900 mb-4">Constraint Settings</h2>
      <div className="divide-y divide-surface-100">
        {rows.map(({ id, path, label, hasValue, min, max, step }) => {
          const item = constraints[path] || {};
          return (
            <div key={path} className="py-4 flex items-center justify-between gap-6">
              <div className="flex-1">
                <p className="text-sm font-semibold text-surface-800">{label}</p>
                {hasValue && (
                  <div className="flex items-center gap-3 mt-2">
                    <input
                      type="range" min={min} max={max} step={step}
                      value={item.value ?? 0}
                      disabled={!item.enabled}
                      onChange={(e) => t(path, 'value', Number(e.target.value))}
                      className="w-40 accent-surface-700 disabled:opacity-40"
                      aria-label={`${label} value`}
                    />
                    <span className="text-sm font-semibold text-surface-700">
                      {item.value ?? 0}{path === 'minCompletionPct' ? '%' : ''}
                    </span>
                  </div>
                )}
              </div>
              <button
                id={id}
                role="switch"
                aria-checked={item.enabled}
                onClick={() => t(path, 'enabled', !item.enabled)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent
                  transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-surface-500
                  ${item.enabled ? 'bg-surface-700' : 'bg-surface-300'}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow
                  transition duration-200 ${item.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Admin Panel ─────────────────────────────────────────────
export default function AdminPanel() {
  const [unlocked, setUnlocked] = useState(false);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTeam, setExpandedTeam] = useState(null);

  // Modals
  const [teamModal, setTeamModal] = useState(null); // null | 'add' | team object
  const [meetingModal, setMeetingModal] = useState(null); // null | { team, meeting? }

  const fetchTeams = async () => {
    try {
      const { data } = await api.get('/api/teams');
      setTeams(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (unlocked) fetchTeams();
  }, [unlocked]);

  // ── Team CRUD ──
  const saveTeam = async (form) => {
    if (teamModal && teamModal._id) {
      await api.put(`/api/teams/${teamModal._id}`, form);
    } else {
      await api.post('/api/teams', form);
    }
    fetchTeams();
  };

  const deleteTeam = async (id) => {
    if (!confirm('Delete this team? This cannot be undone.')) return;
    await api.delete(`/api/teams/${id}`);
    fetchTeams();
  };

  // ── Meeting CRUD ──
  const saveMeeting = async (form) => {
    const { team, meeting } = meetingModal;
    if (meeting?._id) {
      await api.put(`/api/teams/${team._id}/meetings/${meeting._id}`, form);
    } else {
      await api.post(`/api/teams/${team._id}/meetings`, form);
    }
    fetchTeams();
  };

  const deleteMeeting = async (teamId, meetingId) => {
    if (!confirm('Delete this meeting?')) return;
    await api.delete(`/api/teams/${teamId}/meetings/${meetingId}`);
    fetchTeams();
  };

  if (!unlocked) return <PasswordGate onUnlock={() => setUnlocked(true)} />;

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Nav */}
      <header className="bg-white border-b border-surface-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-surface-800 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">AI</span>
            </div>
            <span className="font-bold text-surface-900 text-sm">Admin Panel</span>
            <span className="text-xs bg-surface-100 text-surface-500 px-2 py-0.5 rounded-full">adore2024</span>
          </div>
          <Link to="/" className="btn-secondary text-xs px-3 py-1.5">
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-surface-900">Admin Panel</h1>

        {/* Constraints Section */}
        <ConstraintAdmin />

        {/* Teams Section */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-surface-900">Teams ({teams.length})</h2>
            <button
              id="add-team-btn"
              onClick={() => setTeamModal('add')}
              className="btn-primary text-sm"
            >
              + Add Team
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-6 h-6 border-4 border-surface-200 border-t-surface-700 rounded-full" />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {teams.map((team) => (
                <div key={team._id} className="border border-surface-200 rounded-xl overflow-hidden">
                  {/* Team Row */}
                  <div className="flex items-center justify-between px-4 py-3 bg-surface-50">
                    <div>
                      <span className="font-semibold text-surface-900">{team.name}</span>
                      {team.tac && <span className="text-sm text-surface-500 ml-2">TAC: {team.tac}</span>}
                      {team.domain && (
                        <span className="text-xs bg-surface-100 text-surface-600 border border-surface-200 px-2 py-0.5 rounded-full ml-2">
                          {team.domain}
                        </span>
                      )}
                      <span className="text-xs bg-surface-200 text-surface-600 px-2 py-0.5 rounded-full ml-2">
                        {team.meetings?.length ?? 0} meetings
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        id={`toggle-team-${team._id}`}
                        onClick={() => setExpandedTeam(expandedTeam === team._id ? null : team._id)}
                        className="btn-ghost text-xs"
                      >
                        {expandedTeam === team._id ? '▲ Hide' : '▼ Meetings'}
                      </button>
                      <button
                        id={`edit-team-${team._id}`}
                        onClick={() => setTeamModal(team)}
                        className="btn-secondary text-xs"
                      >
                        Edit
                      </button>
                      <button
                        id={`delete-team-${team._id}`}
                        onClick={() => deleteTeam(team._id)}
                        className="btn-danger text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Meetings table */}
                  {expandedTeam === team._id && (
                    <div className="px-4 pb-4 pt-2 border-t border-surface-100">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-xs font-semibold text-surface-600 uppercase tracking-wide">Meetings</p>
                        <button
                          id={`add-meeting-${team._id}`}
                          onClick={() => setMeetingModal({ team })}
                          className="btn-secondary text-xs"
                        >
                          + Add Meeting
                        </button>
                      </div>
                      {(!team.meetings || team.meetings.length === 0) ? (
                        <p className="text-sm text-surface-400 py-2">No meetings yet.</p>
                      ) : (
                        <div className="overflow-x-auto rounded-lg border border-surface-200">
                          <table className="w-full text-sm">
                            <thead className="bg-surface-50">
                              <tr>
                                {['Date', 'TM', 'DM', 'ADM', 'Members', 'Done', 'Goal', 'New', ''].map((h) => (
                                  <th key={h} className="text-left px-3 py-2 text-xs font-semibold text-surface-500 uppercase tracking-wide whitespace-nowrap">
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-100">
                              {[...team.meetings]
                                .sort((a, b) => new Date(b.date) - new Date(a.date))
                                .map((m) => (
                                  <tr key={m._id} className="hover:bg-surface-50">
                                    <td className="px-3 py-2 text-xs whitespace-nowrap">{m.date?.slice(0, 10)}</td>
                                    <td className="px-3 py-2 text-xs">{m.tm}</td>
                                    <td className="px-3 py-2 text-xs">{m.dm}</td>
                                    <td className="px-3 py-2 text-xs">{m.adm}</td>
                                    <td className="px-3 py-2 text-xs text-center">{m.members ?? '—'}</td>
                                    <td className="px-3 py-2 text-xs text-center font-semibold">{m.sessionsDone}</td>
                                    <td className="px-3 py-2 text-xs text-center">{m.totalGoal}</td>
                                    <td className="px-3 py-2 text-xs text-center">+{m.newMembers ?? 0}</td>
                                    <td className="px-3 py-2">
                                      <div className="flex gap-1">
                                        <button
                                          id={`edit-m-${m._id}`}
                                          onClick={() => setMeetingModal({ team, meeting: m })}
                                          className="btn-ghost text-xs px-2 py-0.5"
                                        >
                                          Edit
                                        </button>
                                        <button
                                          id={`del-m-${m._id}`}
                                          onClick={() => deleteMeeting(team._id, m._id)}
                                          className="text-xs text-red-600 hover:text-red-800 px-2 py-0.5"
                                        >
                                          Del
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {teamModal && (
        <TeamModal
          team={teamModal === 'add' ? null : teamModal}
          onClose={() => setTeamModal(null)}
          onSave={saveTeam}
        />
      )}
      {meetingModal && (
        <MeetingModal
          team={meetingModal.team}
          meeting={meetingModal.meeting}
          teamName={meetingModal.team.name}
          onClose={() => setMeetingModal(null)}
          onSave={saveMeeting}
        />
      )}
    </div>
  );
}

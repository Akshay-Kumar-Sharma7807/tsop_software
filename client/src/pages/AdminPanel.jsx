import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

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
const TAC_OPTIONS = [
  { value: 'no', label: 'No' },
  { value: 'yes', label: 'Yes' },
];
const DOMAIN_OPTIONS = [
  '', 'Sunshine', 'HR', 'GM', 'Tech', 'GD', 'SMM',
];

const todayISO = () => new Date().toISOString().slice(0, 10);
const currentTimeISO = () => {
  const d = new Date();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

const EMPTY_TEAM = { name: '', domain: '' };
const getFreshMeeting = () => ({
  date: todayISO(), time: currentTimeISO(), tm: 'no', tmName: '', dm: 'no', dmName: '', adm: 'no', admName: '',
  tac: 'no', tacName: '',
  members: 1, totalMembers: 1, memberNames: [''], totalMemberNames: [''],
  totalGoal: '', sessionsDone: '', centerFeedbackMeetings: '',
});

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
    team ? { name: team.name, domain: team.domain || '' } : { ...EMPTY_TEAM }
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
          {/* Domain — dropdown */}
          <div>
            <label htmlFor="team-domain" className="block text-xs font-semibold text-surface-600 mb-1">Domain</label>
            <select
              id="team-domain"
              value={form.domain}
              onChange={(e) => setForm({ ...form, domain: e.target.value })}
              className="input"
            >
              {DOMAIN_OPTIONS.map((d) => (
                <option key={d} value={d}>{d || '— Select domain —'}</option>
              ))}
            </select>
          </div>
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
export function MeetingModal({ meeting, teamName, onClose, onSave }) {
  const [form, setForm] = useState(
    meeting ? {
      ...getFreshMeeting(),
      ...meeting,
      memberNames: meeting.memberNames || [],
      totalMemberNames: meeting.totalMemberNames || [],
    } : getFreshMeeting()
  );
  const [saving, setSaving] = useState(false);

  const f = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  // Present Member count/name helpers
  const setPresentMembersCount = (count) => {
    const n = Math.max(0, Number(count));
    const names = [...(form.memberNames || [])];
    while (names.length < n) names.push('');
    setForm({ ...form, members: count, memberNames: names.slice(0, n) });
  };
  const setPresentMemberName = (i, val) => {
    const names = [...(form.memberNames || [])];
    names[i] = val;
    setForm({ ...form, memberNames: names });
  };

  // Total Team Member count/name helpers
  const setTotalMembersCount = (count) => {
    const n = Math.max(0, Number(count));
    const names = [...(form.totalMemberNames || [])];
    while (names.length < n) names.push('');
    setForm({ ...form, totalMembers: count, totalMemberNames: names.slice(0, n) });
  };
  const setTotalMemberName = (i, val) => {
    const names = [...(form.totalMemberNames || [])];
    names[i] = val;
    setForm({ ...form, totalMemberNames: names });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        ...form,
        members: Number(form.members),
        totalMembers: Number(form.totalMembers),
        totalGoal: Number(form.totalGoal),
        sessionsDone: Number(form.sessionsDone),
        centerFeedbackMeetings: Number(form.centerFeedbackMeetings),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4 py-6">
      <div className="card w-full max-w-lg p-6 max-h-[90vh] flex flex-col">
        <h2 className="text-lg font-bold text-surface-900 mb-1">
          {meeting ? 'Edit Meeting' : 'Add Meeting'}
        </h2>
        <p className="text-sm text-surface-500 mb-3">Team: <strong>{teamName}</strong></p>
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 mb-4">

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-3">
            <Field id="m-date" label="Date" type="date" value={form.date?.slice(0, 10) || ''} onChange={f('date')} required />
            <Field id="m-time" label="Time" type="time" value={form.time || ''} onChange={f('time')} required />
          </div>

          {/* Attendance and Names */}
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <SelectField id="m-tm" label="TM Status" value={form.tm} onChange={f('tm')} options={STATUS_OPTIONS} />
              {form.tm === 'yes' && (
                <Field id="m-tm-name" label="TM Name" placeholder="Enter TM name" value={form.tmName} onChange={f('tmName')} />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <SelectField id="m-dm" label="DM Status" value={form.dm} onChange={f('dm')} options={STATUS_OPTIONS} />
              {form.dm === 'yes' && (
                <Field id="m-dm-name" label="DM Name" placeholder="Enter DM name" value={form.dmName} onChange={f('dmName')} />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <SelectField id="m-adm" label="ADM Status" value={form.adm} onChange={f('adm')} options={STATUS_OPTIONS} />
              {form.adm === 'yes' && (
                <Field id="m-adm-name" label="ADM Name" placeholder="Enter ADM name" value={form.admName} onChange={f('admName')} />
              )}
            </div>
          </div>

          {/* TAC yes/no + name */}
          <div className="flex flex-col gap-2">
            <SelectField id="m-tac" label="TAC Present" value={form.tac} onChange={f('tac')} options={TAC_OPTIONS} />
            {form.tac === 'yes' && (
              <Field id="m-tac-name" label="TAC Name" placeholder="Enter TAC name" value={form.tacName} onChange={f('tacName')} />
            )}
          </div>

          {/* Members Present & Total Team Members */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="m-members" className="block text-xs font-semibold text-surface-600 mb-1">
                Members Present
              </label>
              <input
                id="m-members"
                type="number" min={1}
                value={form.members}
                onChange={(e) => setPresentMembersCount(e.target.value)}
                className="input"
                required
              />
            </div>
            <div>
              <label htmlFor="m-total-members" className="block text-xs font-semibold text-surface-600 mb-1">
                Total Team Members
              </label>
              <input
                id="m-total-members"
                type="number" min={1}
                value={form.totalMembers}
                onChange={(e) => setTotalMembersCount(e.target.value)}
                className="input"
                required
              />
            </div>
          </div>

          {/* Present Member Names */}
          {Number(form.members) > 0 && (
            <div className="flex flex-col gap-2 border border-green-100 bg-green-50/20 p-3 rounded-lg">
              <p className="text-xs font-semibold text-green-700">Present Member Names</p>
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: Number(form.members) }).map((_, i) => (
                  <input
                    key={i}
                    id={`m-present-name-${i}`}
                    type="text"
                    placeholder={`Present Member ${i + 1}`}
                    value={form.memberNames?.[i] || ''}
                    onChange={(e) => setPresentMemberName(i, e.target.value)}
                    className="input text-sm bg-white"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Total Member Names */}
          {Number(form.totalMembers) > 0 && (
            <div className="flex flex-col gap-2 border border-surface-200 bg-surface-50/30 p-3 rounded-lg">
              <p className="text-xs font-semibold text-surface-700">All Team Member Names</p>
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: Number(form.totalMembers) }).map((_, i) => (
                  <input
                    key={i}
                    id={`m-total-name-${i}`}
                    type="text"
                    placeholder={`Team Member ${i + 1}`}
                    value={form.totalMemberNames?.[i] || ''}
                    onChange={(e) => setTotalMemberName(i, e.target.value)}
                    className="input text-sm bg-white"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <Field id="m-goal" label="Total Goal" type="number" min={0} value={form.totalGoal} onChange={f('totalGoal')} required />
            <Field id="m-done" label="Sessions Done" type="number" min={0} value={form.sessionsDone} onChange={f('sessionsDone')} />
            <Field id="m-cfm" label="Center Feedback Meetings" type="number" min={0} value={form.centerFeedbackMeetings} onChange={f('centerFeedbackMeetings')} />
          </div>

          </div>
          <div className="flex gap-2 pt-3 border-t border-surface-150">
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
                        <Link
                            to={`/admin/teams/${team._id}`}
                            className="font-semibold text-surface-900 hover:underline"
                        >
                            {team.name}
                        </Link>
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
                                {['Date', 'TM', 'DM', 'ADM', 'TAC', 'Members', 'Done', 'Goal', ''].map((h) => (
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
                                    <td className="px-3 py-2 text-xs whitespace-nowrap">
                                      <div>{m.date?.slice(0, 10)}</div>
                                      {m.time && (
                                        <div className="text-[10px] text-surface-400 font-normal mt-0.5">{m.time}</div>
                                      )}
                                    </td>
                                    <td className="px-3 py-2 text-xs">
                                      {m.tm}
                                      {m.tm === 'yes' && m.tmName && (
                                        <span className="block text-[10px] text-surface-400 font-normal">{m.tmName}</span>
                                      )}
                                    </td>
                                    <td className="px-3 py-2 text-xs">
                                      {m.dm}
                                      {m.dm === 'yes' && m.dmName && (
                                        <span className="block text-[10px] text-surface-400 font-normal">{m.dmName}</span>
                                      )}
                                    </td>
                                    <td className="px-3 py-2 text-xs">
                                      {m.adm}
                                      {m.adm === 'yes' && m.admName && (
                                        <span className="block text-[10px] text-surface-400 font-normal">{m.admName}</span>
                                      )}
                                    </td>
                                    <td className="px-3 py-2 text-xs">
                                      {m.tac === 'yes' ? `✓ ${m.tacName || ''}` : '✗'}
                                    </td>
                                    <td className="px-3 py-2 text-xs">
                                      <div className="font-semibold text-center">{m.members ?? '—'} / {m.totalMembers ?? '—'}</div>
                                      {m.memberNames?.length > 0 && (
                                        <span className="block text-[10px] text-surface-400 font-normal max-w-[120px] truncate" title={`Present: ${m.memberNames.filter(Boolean).join(', ')}`}>
                                          Pres: {m.memberNames.filter(Boolean).join(', ')}
                                        </span>
                                      )}
                                      {m.totalMemberNames?.length > 0 && (
                                        <span className="block text-[10px] text-surface-400 font-normal max-w-[120px] truncate" title={`All: ${m.totalMemberNames.filter(Boolean).join(', ')}`}>
                                          All: {m.totalMemberNames.filter(Boolean).join(', ')}
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-3 py-2 text-xs text-center font-semibold">{m.sessionsDone}</td>
                                    <td className="px-3 py-2 text-xs text-center">{m.totalGoal}</td>
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

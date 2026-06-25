import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import MeetingDetailsModal from '../components/MeetingDetailsModal';
import { MeetingModal } from './AdminPanel';

// ─── Helpers ──────────────────────────────────────────────────────
const fmtDate = (d) =>
    d
        ? new Date(d).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        })
        : '—';

const statusBadge = (val, label) => {
    const cfg = {
        yes: { bg: 'bg-green-100 text-green-800 border-green-200', icon: '✓' },
        no: { bg: 'bg-red-100 text-red-800 border-red-200', icon: '✗' },
        'in progress': { bg: 'bg-amber-100 text-amber-800 border-amber-200', icon: '~' },
    };
    const { bg, icon } = cfg[val] || cfg.no;
    return (
        <span className={`text-[10px] border px-1.5 py-0.5 rounded-md font-semibold ${bg}`}>
      {label} {icon}
    </span>
    );
};

// ─── Stat Card ────────────────────────────────────────────────────
function StatCard({ label, value, accent }) {
    return (
        <div className="bg-surface-100 rounded-xl p-3 flex flex-col gap-1">
            <span className="text-[10px] text-surface-500 font-semibold uppercase tracking-wider">{label}</span>
            <span className={`text-2xl font-bold ${accent || 'text-surface-900'}`}>{value}</span>
        </div>
    );
}

// ─── TeamPage ─────────────────────────────────────────────────────
export default function TeamPage() {
    const { teamId } = useParams();
    const navigate = useNavigate();

    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDetails, setSelectedDetails] = useState(null);
    const [meetingModal, setMeetingModal] = useState(null);

    const fetchTeam = async () => {
        try {
            const { data } = await api.get(`/api/teams/${teamId}`);
            setTeam(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTeam(); }, [teamId]);

    const saveMeeting = async (form) => {
        const { meeting } = meetingModal || {};
        if (meeting?._id) {
            await api.put(`/api/teams/${teamId}/meetings/${meeting._id}`, form);
        } else {
            await api.post(`/api/teams/${teamId}/meetings`, form);
        }
        fetchTeam();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-surface-50 flex items-center justify-center">
                <div className="animate-spin w-6 h-6 border-4 border-surface-200 border-t-surface-700 rounded-full" />
            </div>
        );
    }

    if (!team) {
        return (
            <div className="min-h-screen bg-surface-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-surface-600 mb-4">Team not found.</p>
                    <button onClick={() => navigate(-1)} className="btn-secondary text-sm">← Go back</button>
                </div>
            </div>
        );
    }

    const meetings = [...(team.meetings || [])].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
    );

    // Aggregate stats
    const totalGoal = meetings.reduce((s, m) => s + (Number(m.totalGoal) || 0), 0);
    const totalDone = meetings.reduce((s, m) => s + (Number(m.sessionsDone) || 0), 0);
    const avgAttendance =
        meetings.length > 0
            ? Math.round(
                (meetings.reduce(
                        (s, m) =>
                            s +
                            (m.totalMembers > 0 ? (m.members / m.totalMembers) * 100 : 0),
                        0
                    ) /
                    meetings.length)
            )
            : 0;

    return (
        <div className="min-h-screen bg-surface-50">
            {/* Nav */}
            <header className="bg-white border-b border-surface-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                        <Link to="/admin" className="text-surface-400 hover:text-surface-700 transition-colors">
                            Admin
                        </Link>
                        <span className="text-surface-300">/</span>
                        <span className="font-semibold text-surface-900">{team.name}</span>
                    </div>
                    <button onClick={() => navigate(-1)} className="btn-secondary text-xs px-3 py-1.5">
                        ← Back
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">

                {/* Team Header */}
                <div className="card p-5 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <span className="text-blue-700 text-xl font-bold">
                {team.name?.[0]?.toUpperCase() || 'T'}
              </span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-surface-900">{team.name}</h1>
                            {team.domain && (
                                <span className="text-xs bg-surface-100 text-surface-600 border border-surface-200 px-2 py-0.5 rounded-full">
                  {team.domain}
                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatCard label="Meetings" value={meetings.length} />
                    <StatCard label="Total goal" value={totalGoal} />
                    <StatCard label="Sessions done" value={totalDone} accent="text-green-700" />
                    <StatCard label="Avg attendance" value={`${avgAttendance}%`} />
                </div>

                {/* Meetings */}
                <div className="card p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-bold text-surface-900">
                            Meetings <span className="text-surface-400 font-normal text-sm">({meetings.length})</span>
                        </h2>
                        <button
                            onClick={() => setMeetingModal({ team })}
                            className="btn-primary text-sm"
                        >
                            + Add Meeting
                        </button>
                    </div>

                    {meetings.length === 0 ? (
                        <div className="py-10 flex flex-col items-center gap-3 text-center">
                            <p className="text-sm text-surface-400">No meetings recorded yet.</p>
                            <button
                                onClick={() => setMeetingModal({ team })}
                                className="btn-secondary text-sm"
                            >
                                + Add your first meeting
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {meetings.map((m) => (
                                <div
                                    key={m._id}
                                    onClick={() => setSelectedDetails({ meeting: m, teamName: team.name, team })}
                                    className="border border-surface-200 rounded-xl p-4 hover:bg-surface-50 transition-colors cursor-pointer"
                                >
                                    {/* Top row: date + time + role badges */}
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div>
                                            <p className="text-sm font-semibold text-surface-900">{fmtDate(m.date)}</p>
                                            {m.time && (
                                                <p className="text-xs text-surface-400 mt-0.5">{m.time}</p>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-1 justify-end">
                                            {statusBadge(m.tm, 'TM')}
                                            {statusBadge(m.dm, 'DM')}
                                            {statusBadge(m.adm, 'ADM')}
                                            {m.tac === 'yes' && (
                                                <span className="text-[10px] border px-1.5 py-0.5 rounded-md font-semibold bg-blue-100 text-blue-800 border-blue-200">
                          TAC ✓
                        </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Bottom row: members + stats */}
                                    <div className="flex flex-wrap gap-4 items-end">
                                        <div>
                                            <p className="text-[10px] text-surface-500 uppercase font-semibold mb-0.5">Attendance</p>
                                            <p className="text-sm font-semibold text-surface-800">
                                                {m.members ?? '—'} / {m.totalMembers ?? '—'}
                                            </p>
                                            {m.memberNames?.filter(Boolean).length > 0 && (
                                                <p className="text-[10px] text-surface-400 max-w-[200px] truncate mt-0.5">
                                                    {m.memberNames.filter(Boolean).join(', ')}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <p className="text-[10px] text-surface-500 uppercase font-semibold mb-0.5">Done</p>
                                            <p className="text-sm font-semibold text-green-700">{m.sessionsDone ?? '—'}</p>
                                        </div>

                                        <div>
                                            <p className="text-[10px] text-surface-500 uppercase font-semibold mb-0.5">Goal</p>
                                            <p className="text-sm font-semibold text-surface-800">{m.totalGoal ?? '—'}</p>
                                        </div>

                                        {m.centerFeedbackMeetings != null && (
                                            <div>
                                                <p className="text-[10px] text-surface-500 uppercase font-semibold mb-0.5">CFM</p>
                                                <p className="text-sm font-semibold text-surface-800">{m.centerFeedbackMeetings}</p>
                                            </div>
                                        )}

                                        <span className="ml-auto text-xs text-surface-400">View details →</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Add / Edit Meeting Modal */}
            {meetingModal && (
                <MeetingModal
                    team={meetingModal.team}
                    meeting={meetingModal.meeting}
                    teamName={team.name}
                    onClose={() => setMeetingModal(null)}
                    onSave={saveMeeting}
                />
            )}

            {/* Meeting Details Modal */}
            {selectedDetails && (
                <MeetingDetailsModal
                    meeting={selectedDetails.meeting}
                    teamName={selectedDetails.teamName}
                    team={selectedDetails.team}
                    onClose={() => setSelectedDetails(null)}
                />
            )}
        </div>
    );
}
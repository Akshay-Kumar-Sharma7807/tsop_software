import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import MeetingDetailsModal from '../components/MeetingDetailsModal';
import MeetingHistory from '../components/MeetingHistory';
import { evaluateParam, STATUS_STYLES } from '../utils/paramEval';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    LineChart, Line, ResponsiveContainer,
} from 'recharts';

// ─── Helpers ──────────────────────────────────────────────────────
const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

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
function StatCard({ label, value, accent, sub }) {
    return (
        <div className="bg-white rounded-xl border border-surface-200 p-4 flex flex-col gap-1 shadow-sm">
            <span className="text-[10px] text-surface-500 font-semibold uppercase tracking-wider">{label}</span>
            <span className={`text-2xl font-bold ${accent || 'text-surface-900'}`}>{value}</span>
            {sub && <span className="text-xs text-surface-400">{sub}</span>}
        </div>
    );
}

// ─── Parameters Panel ─────────────────────────────────────────────
// Shows all global parameters with values from a given meeting, sorted by status
function MeetingParametersPanel({ meeting, allParams }) {
    if (!allParams.length) return null;

    // Build value map for this meeting
    const valueMap = {};
    (meeting?.parameters || []).forEach(({ parameterId, value }) => {
        valueMap[String(parameterId)] = value;
    });

    // Sort: empty → red → yellow → green
    const STATUS_ORDER = { empty: 0, red: 1, yellow: 2, green: 3 };
    const sorted = [...allParams].sort((a, b) => {
        const sa = STATUS_ORDER[evaluateParam(a, valueMap[String(a._id)])] ?? 0;
        const sb = STATUS_ORDER[evaluateParam(b, valueMap[String(b._id)])] ?? 0;
        if (sa !== sb) return sa - sb;
        return (a.order ?? 0) - (b.order ?? 0);
    });

    // Counts
    const counts = { empty: 0, red: 0, yellow: 0, green: 0 };
    allParams.forEach(p => { counts[evaluateParam(p, valueMap[String(p._id)])]++; });
    const greenPct = Math.round((counts.green / allParams.length) * 100);

    // Group by category
    const byCategory = sorted.reduce((acc, p) => {
        (acc[p.category] = acc[p.category] || []).push(p);
        return acc;
    }, {});

    return (
        <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-surface-700">Meeting Parameters</h3>
                <div className="flex gap-1.5 flex-wrap justify-end">
                    {[['green','Done','bg-green-100 text-green-700'],
                        ['yellow','Partial','bg-amber-100 text-amber-700'],
                        ['red','Attention','bg-red-100 text-red-700'],
                        ['empty','Empty','bg-gray-100 text-gray-500']
                    ].map(([k, l, cls]) => (
                        <span key={k} className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${cls}`}>
              {l}: {counts[k]}
            </span>
                    ))}
                </div>
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 h-1.5 bg-surface-200 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                            width: `${greenPct}%`,
                            background: greenPct === 100 ? '#22c55e'
                                : `linear-gradient(90deg, #ef4444 0%, #f59e0b ${greenPct}%, #22c55e ${greenPct}%)`,
                        }}
                    />
                </div>
                <span className="text-xs font-semibold text-surface-600 shrink-0">{greenPct}% complete</span>
            </div>

            {/* Params by category */}
            <div className="flex flex-col gap-4">
                {Object.entries(byCategory).map(([cat, params]) => (
                    <div key={cat}>
                        <p className="text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-2">{cat}</p>
                        <div className="flex flex-col gap-1.5">
                            {params.map(p => {
                                const val = valueMap[String(p._id)];
                                const status = evaluateParam(p, val);
                                const s = STATUS_STYLES[status];
                                const displayVal = (val === null || val === undefined || val === '') ? null : String(val);
                                return (
                                    <div key={p._id} className={`flex items-start gap-2 px-3 py-2 rounded-lg border ${s.bg} ${s.border}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${s.dot}`} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-[11px] font-medium text-surface-700 truncate">{p.name}</span>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0 ${s.badge}`}>
                          {s.label}
                        </span>
                                            </div>
                                            {displayVal
                                                ? <span className="text-[11px] text-surface-600 break-all">{displayVal}</span>
                                                : <span className="text-[11px] text-surface-400 italic">Not filled</span>
                                            }
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Role Presence Bar ────────────────────────────────────────────
function RolePresenceChart({ meetings }) {
    if (!meetings.length) return null;
    const count = (key) => meetings.filter((m) => m[key] === 'yes').length;
    const pct = (key) => Math.round((count(key) / meetings.length) * 100);

    const data = [
        { role: 'TM', presence: pct('tm'), fill: '#334155' },
        { role: 'DM', presence: pct('dm'), fill: '#64748b' },
        { role: 'ADM', presence: pct('adm'), fill: '#94a3b8' },
        { role: 'TAC', presence: pct('tac'), fill: '#0ea5e9' },
    ];

    return (
        <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-surface-700 mb-4">Role Presence Rate</h3>
            <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 0, right: 8, left: -24, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="role" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                        <Tooltip formatter={(v) => [`${v}%`, 'Presence']} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 12 }} />
                        <Bar dataKey="presence" radius={[4, 4, 0, 0]} fill="#334155" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
                {data.map((d) => (
                    <div key={d.role} className="flex items-center gap-1.5 text-xs text-surface-600">
                        <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: d.fill }} />
                        {d.role}: <span className="font-semibold">{d.presence}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Attendance Trend ─────────────────────────────────────────────
function AttendanceTrend({ meetings }) {
    if (!meetings.length) return null;
    const sorted = [...meetings].sort((a, b) => new Date(a.date) - new Date(b.date));
    const data = sorted.map((m) => ({
        date: new Date(m.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        'Attendance %': m.totalMembers > 0 ? Math.round((m.members / m.totalMembers) * 100) : 0,
    }));

    return (
        <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-surface-700 mb-4">Attendance Trend</h3>
            <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                        <Tooltip formatter={(v) => [`${v}%`, 'Attendance']} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 12 }} />
                        <Line type="monotone" dataKey="Attendance %" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 4, fill: '#0ea5e9' }} activeDot={{ r: 5 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// ─── Latest Meeting Snapshot ──────────────────────────────────────
function LatestSnapshot({ meeting, onClick }) {
    if (!meeting) return null;
    return (
        <div
            onClick={onClick}
            className="bg-white rounded-xl border border-surface-200 p-5 shadow-sm cursor-pointer hover:bg-surface-50 transition-colors"
        >
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-surface-700">Latest Meeting</h3>
                <span className="text-xs text-surface-400">{fmtDate(meeting.date)}{meeting.time && ` · ${meeting.time}`}</span>
            </div>
            <div className="flex flex-wrap gap-1 mb-3">
                {statusBadge(meeting.tm, 'TM')}
                {statusBadge(meeting.dm, 'DM')}
                {statusBadge(meeting.adm, 'ADM')}
                {meeting.tac === 'yes' && (
                    <span className="text-[10px] border px-1.5 py-0.5 rounded-md font-semibold bg-blue-100 text-blue-800 border-blue-200">TAC ✓</span>
                )}
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-surface-50 rounded-lg p-2">
                    <p className="text-[10px] text-surface-500 uppercase font-semibold">Present</p>
                    <p className="text-base font-bold text-surface-800">{meeting.members ?? '—'} / {meeting.totalMembers ?? '—'}</p>
                </div>
                <div className="bg-surface-50 rounded-lg p-2">
                    <p className="text-[10px] text-surface-500 uppercase font-semibold">Done</p>
                    <p className="text-base font-bold text-green-700">{meeting.sessionsDone ?? '—'}</p>
                </div>
                <div className="bg-surface-50 rounded-lg p-2">
                    <p className="text-[10px] text-surface-500 uppercase font-semibold">Goal</p>
                    <p className="text-base font-bold text-surface-800">{meeting.totalGoal ?? '—'}</p>
                </div>
            </div>
            {meeting.memberNames?.filter(Boolean).length > 0 && (
                <p className="text-[11px] text-surface-400 mt-3 truncate">Present: {meeting.memberNames.filter(Boolean).join(', ')}</p>
            )}
            <p className="text-xs text-surface-400 mt-2 text-right">Click to view full details →</p>
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────
export default function TeamDetailPage() {
    const { teamId } = useParams();
    const navigate = useNavigate();

    const [team, setTeam] = useState(null);
    const [allParams, setAllParams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDetails, setSelectedDetails] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const [teamRes, paramRes] = await Promise.all([
                    api.get(`/api/teams/${teamId}`),
                    api.get('/api/parameters?enabled=true'),
                ]);
                setTeam(teamRes.data);
                setAllParams(paramRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [teamId]);

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

    const meetings = [...(team.meetings || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
    const latest = meetings[0] || null;

    const totalGoal = meetings.reduce((s, m) => s + (Number(m.totalGoal) || 0), 0);
    const totalDone = meetings.reduce((s, m) => s + (Number(m.sessionsDone) || 0), 0);
    const completionPct = totalGoal > 0 ? Math.round((totalDone / totalGoal) * 100) : 0;
    const avgAttendance = meetings.length > 0
        ? Math.round(meetings.reduce((s, m) => s + (m.totalMembers > 0 ? (m.members / m.totalMembers) * 100 : 0), 0) / meetings.length)
        : 0;

    return (
        <div className="min-h-screen bg-surface-50">
            {/* Nav */}
            <header className="bg-white border-b border-surface-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                        <Link to="/" className="text-surface-400 hover:text-surface-700 transition-colors">Dashboard</Link>
                        <span className="text-surface-300">/</span>
                        <span className="font-semibold text-surface-900">{team.name}</span>
                    </div>
                    <button onClick={() => navigate(-1)} className="btn-secondary text-xs px-3 py-1.5">← Back</button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">

                {/* Team Header */}
                <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                        <span className="text-blue-700 text-2xl font-bold">{team.name?.[0]?.toUpperCase() || 'T'}</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-surface-900">{team.name}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            {team.domain && (
                                <span className="text-xs bg-surface-100 text-surface-600 border border-surface-200 px-2 py-0.5 rounded-full">
                  {team.domain}
                </span>
                            )}
                            <span className="text-xs text-surface-400">{meetings.length} meetings recorded</span>
                        </div>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatCard label="Total Meetings" value={meetings.length} />
                    <StatCard
                        label="Completion"
                        value={`${completionPct}%`}
                        accent={completionPct >= 75 ? 'text-green-700' : completionPct >= 40 ? 'text-amber-600' : 'text-red-600'}
                        sub={`${totalDone} / ${totalGoal} sessions`}
                    />
                    <StatCard label="Sessions Done" value={totalDone} accent="text-green-700" />
                    <StatCard
                        label="Avg Attendance"
                        value={`${avgAttendance}%`}
                        accent={avgAttendance >= 75 ? 'text-green-700' : avgAttendance >= 50 ? 'text-amber-600' : 'text-red-600'}
                    />
                </div>

                {/* Latest Meeting + Attendance Trend */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <LatestSnapshot
                        meeting={latest}
                        onClick={() => latest && setSelectedDetails({ meeting: latest, teamName: team.name })}
                    />
                    <AttendanceTrend meetings={meetings} />
                </div>

                {/* Latest Meeting Parameters */}
                {latest && allParams.length > 0 && (
                    <div>
                        <p className="text-xs text-surface-500 font-semibold uppercase tracking-wider mb-2">
                            Parameters — Latest Meeting ({fmtDate(latest.date)})
                        </p>
                        <MeetingParametersPanel meeting={latest} allParams={allParams} />
                    </div>
                )}

                {/* Role Presence */}
                <RolePresenceChart meetings={meetings} />

                {/* Full Meeting History */}
                <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-sm">
                    <MeetingHistory meetings={team.meetings} teamName={team.name} />
                </div>

            </main>

            {selectedDetails && (
                <MeetingDetailsModal
                    meeting={selectedDetails.meeting}
                    teamName={selectedDetails.teamName}
                    onClose={() => setSelectedDetails(null)}
                />
            )}
        </div>
    );
}
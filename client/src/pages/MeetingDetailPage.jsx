import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { evaluateParam, STATUS_STYLES } from '../utils/paramEval';

const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

// ─── Status Badge ─────────────────────────────────────────────────
function RoleBadge({ val, label, name }) {
    const cfg = {
        yes: { bg: 'bg-green-100 text-green-800 border-green-200', icon: '✓', text: 'Yes' },
        no: { bg: 'bg-red-100 text-red-800 border-red-200', icon: '✗', text: 'No' },
        'in progress': { bg: 'bg-amber-100 text-amber-800 border-amber-200', icon: '~', text: 'In Progress' },
    };
    const { bg, icon, text } = cfg[val] || cfg.no;
    return (
        <div className={`p-3 rounded-xl border ${bg} flex flex-col gap-1`}>
            <div className="flex justify-between items-center">
                <span className="font-semibold text-[10px] uppercase tracking-wider">{label}</span>
                <span className="font-bold text-sm">{icon}</span>
            </div>
            <div className="text-sm font-semibold">{text}</div>
            {val === 'yes' && name && <div className="text-[11px] opacity-70 italic">{name}</div>}
        </div>
    );
}

// ─── Parameters Panel ─────────────────────────────────────────────
function ParametersPanel({ meeting, allParams }) {
    if (!allParams.length) return null;

    const valueMap = {};
    (meeting?.parameters || []).forEach(({ parameterId, value }) => {
        valueMap[String(parameterId)] = value;
    });

    const STATUS_ORDER = { empty: 0, red: 1, yellow: 2, green: 3 };
    const sorted = [...allParams].sort((a, b) => {
        const sa = STATUS_ORDER[evaluateParam(a, valueMap[String(a._id)])] ?? 0;
        const sb = STATUS_ORDER[evaluateParam(b, valueMap[String(b._id)])] ?? 0;
        if (sa !== sb) return sa - sb;
        return (a.order ?? 0) - (b.order ?? 0);
    });

    const counts = { empty: 0, red: 0, yellow: 0, green: 0 };
    allParams.forEach(p => { counts[evaluateParam(p, valueMap[String(p._id)])]++; });
    const greenPct = Math.round((counts.green / allParams.length) * 100);

    const byCategory = sorted.reduce((acc, p) => {
        (acc[p.category] = acc[p.category] || []).push(p);
        return acc;
    }, {});

    return (
        <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-surface-800">Meeting Parameters</h3>
                <div className="flex gap-1.5 flex-wrap justify-end">
                    {[
                        ['green', 'Done', 'bg-green-100 text-green-700'],
                        ['yellow', 'Partial', 'bg-amber-100 text-amber-700'],
                        ['red', 'Attention', 'bg-red-100 text-red-700'],
                        ['empty', 'Empty', 'bg-gray-100 text-gray-500'],
                    ].map(([k, l, cls]) => (
                        <span key={k} className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${cls}`}>
              {l}: {counts[k]}
            </span>
                    ))}
                </div>
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-2 mb-5">
                <div className="flex-1 h-2 bg-surface-200 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                            width: `${greenPct}%`,
                            background: greenPct === 100
                                ? '#22c55e'
                                : `linear-gradient(90deg, #ef4444 0%, #f59e0b ${Math.min(greenPct, 99)}%, #22c55e ${greenPct}%)`,
                        }}
                    />
                </div>
                <span className="text-sm font-bold text-surface-700 shrink-0">{greenPct}%</span>
            </div>

            {/* Params by category */}
            <div className="flex flex-col gap-5">
                {Object.entries(byCategory).map(([cat, params]) => (
                    <div key={cat}>
                        <p className="text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-2">{cat}</p>
                        <div className="flex flex-col gap-2">
                            {params.map(p => {
                                const val = valueMap[String(p._id)];
                                const status = evaluateParam(p, val);
                                const s = STATUS_STYLES[status];
                                const displayVal = (val === null || val === undefined || val === '') ? null : String(val);
                                return (
                                    <div key={p._id} className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${s.bg} ${s.border}`}>
                                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${s.dot}`} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-0.5">
                                                <span className="text-sm font-semibold text-surface-800">{p.name}</span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${s.badge}`}>
                          {s.label}
                        </span>
                                            </div>
                                            {p.hint && <p className="text-[10px] text-surface-400 italic mb-1">{p.hint}</p>}
                                            {displayVal
                                                ? <span className="text-sm text-surface-700 break-all">{displayVal}</span>
                                                : <span className="text-sm text-surface-400 italic">Not filled</span>
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

// ─── Main ─────────────────────────────────────────────────────────
export default function MeetingDetailPage() {
    const { teamId, meetingId } = useParams();
    const navigate = useNavigate();

    const [team, setTeam] = useState(null);
    const [meeting, setMeeting] = useState(null);
    const [allParams, setAllParams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [teamRes, paramRes] = await Promise.all([
                    api.get(`/api/teams/${teamId}`),
                    api.get('/api/parameters?enabled=true'),
                ]);
                const t = teamRes.data;
                const m = (t.meetings || []).find(m => m._id === meetingId);
                setTeam(t);
                setMeeting(m || null);
                setAllParams(paramRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [teamId, meetingId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-surface-50 flex items-center justify-center">
                <div className="animate-spin w-6 h-6 border-4 border-surface-200 border-t-surface-700 rounded-full" />
            </div>
        );
    }

    if (!team || !meeting) {
        return (
            <div className="min-h-screen bg-surface-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-surface-600 mb-4">Meeting not found.</p>
                    <button onClick={() => navigate(-1)} className="btn-secondary text-sm">← Go back</button>
                </div>
            </div>
        );
    }

    const attendancePct = meeting.totalMembers > 0
        ? Math.round((meeting.members / meeting.totalMembers) * 100)
        : 0;
    const completionPct = meeting.totalGoal > 0
        ? Math.round((meeting.sessionsDone / meeting.totalGoal) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-surface-50">
            {/* Nav */}
            <header className="bg-white border-b border-surface-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm min-w-0">
                        <Link to="/" className="text-surface-400 hover:text-surface-700 shrink-0">Dashboard</Link>
                        <span className="text-surface-300">/</span>
                        <Link to={`/teams/${teamId}`} className="text-surface-400 hover:text-surface-700 truncate max-w-[120px]">{team.name}</Link>
                        <span className="text-surface-300">/</span>
                        <span className="font-semibold text-surface-900 shrink-0">{fmtDate(meeting.date)}</span>
                    </div>
                    <button onClick={() => navigate(-1)} className="btn-secondary text-xs px-3 py-1.5 shrink-0 ml-2">← Back</button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">

                {/* Meeting Header */}
                <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-xs text-surface-400 uppercase font-semibold tracking-wider mb-1">{team.name}</p>
                            <h1 className="text-xl font-bold text-surface-900">{fmtDate(meeting.date)}</h1>
                            {meeting.time && <p className="text-sm text-surface-500 mt-0.5">{meeting.time}</p>}
                        </div>
                        {team.domain && (
                            <span className="text-xs bg-surface-100 text-surface-600 border border-surface-200 px-2 py-0.5 rounded-full shrink-0">
                {team.domain}
              </span>
                        )}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white rounded-xl border border-surface-200 p-4 shadow-sm text-center">
                        <p className="text-[10px] text-surface-500 uppercase font-semibold mb-1">Attendance</p>
                        <p className="text-2xl font-bold text-surface-900">{meeting.members ?? 0} / {meeting.totalMembers ?? 0}</p>
                        <p className={`text-xs font-semibold mt-0.5 ${attendancePct >= 75 ? 'text-green-600' : attendancePct >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                            {attendancePct}%
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-surface-200 p-4 shadow-sm text-center">
                        <p className="text-[10px] text-surface-500 uppercase font-semibold mb-1">Sessions Done</p>
                        <p className="text-2xl font-bold text-green-700">{meeting.sessionsDone ?? 0}</p>
                        <p className="text-xs text-surface-400 mt-0.5">of {meeting.totalGoal ?? 0} goal</p>
                    </div>
                    <div className="bg-white rounded-xl border border-surface-200 p-4 shadow-sm text-center">
                        <p className="text-[10px] text-surface-500 uppercase font-semibold mb-1">Completion</p>
                        <p className={`text-2xl font-bold ${completionPct >= 75 ? 'text-green-700' : completionPct >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                            {completionPct}%
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-surface-200 p-4 shadow-sm text-center">
                        <p className="text-[10px] text-surface-500 uppercase font-semibold mb-1">CFM</p>
                        <p className="text-2xl font-bold text-surface-900">{meeting.centerFeedbackMeetings ?? 0}</p>
                    </div>
                </div>

                {/* Roles */}
                <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-sm">
                    <h2 className="text-sm font-bold text-surface-800 mb-3">Roles & Attendance</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <RoleBadge val={meeting.tm} label="TM" name={meeting.tmName} />
                        <RoleBadge val={meeting.dm} label="DM" name={meeting.dmName} />
                        <RoleBadge val={meeting.adm} label="ADM" name={meeting.admName} />
                        <div className={`p-3 rounded-xl border flex flex-col gap-1 ${meeting.tac === 'yes' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}`}>
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-[10px] uppercase tracking-wider">TAC</span>
                                <span className="font-bold text-sm">{meeting.tac === 'yes' ? '✓' : '✗'}</span>
                            </div>
                            <div className="text-sm font-semibold">{meeting.tac === 'yes' ? 'Yes' : 'No'}</div>
                            {meeting.tac === 'yes' && meeting.tacName && <div className="text-[11px] opacity-70 italic">{meeting.tacName}</div>}
                        </div>
                    </div>
                </div>

                {/* Members */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-surface-800">Present Members</h3>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">{meeting.members ?? 0}</span>
                        </div>
                        {meeting.memberNames?.filter(Boolean).length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                                {meeting.memberNames.filter(Boolean).map((n, i) => (
                                    <span key={i} className="text-xs bg-surface-50 border border-surface-200 text-surface-700 px-2 py-1 rounded-lg font-medium">{n}</span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-surface-400 italic">No names logged</p>
                        )}
                    </div>
                    <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-surface-800">All Team Members</h3>
                            <span className="text-xs bg-surface-100 text-surface-600 px-2 py-0.5 rounded-full font-semibold">{meeting.totalMembers ?? 0}</span>
                        </div>
                        {meeting.totalMemberNames?.filter(Boolean).length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                                {meeting.totalMemberNames.filter(Boolean).map((n, i) => (
                                    <span key={i} className="text-xs bg-surface-50 border border-surface-200 text-surface-700 px-2 py-1 rounded-lg font-medium">{n}</span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-surface-400 italic">No names logged</p>
                        )}
                    </div>
                </div>

                {/* Parameters */}
                <ParametersPanel meeting={meeting} allParams={allParams} />

            </main>
        </div>
    );
}
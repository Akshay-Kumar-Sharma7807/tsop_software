import { useNavigate } from 'react-router-dom';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

function StatusPill({ value, label, name }) {
    if (!value) return <span className="text-surface-400 text-xs">—</span>;
    const cfg = {
        yes: { cls: 'bg-green-100 text-green-700', label: 'Yes' },
        no: { cls: 'bg-red-100 text-red-700', label: 'No' },
        'in progress': { cls: 'bg-amber-100 text-amber-700', label: 'In Prog.' },
    };
    const { cls, label: defaultLabel } = cfg[value] || cfg.no;
    const displayLabel = label || defaultLabel;
    return (
        <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${cls}`}
            title={name ? `${displayLabel}: ${name}` : undefined}
        >
      {displayLabel}
            {value === 'yes' && name && <span className="text-[10px] opacity-75 font-normal ml-1">({name})</span>}
    </span>
    );
}

export default function MeetingHistory({ meetings, teamName, teamId }) {
    const navigate = useNavigate();

    if (!meetings || meetings.length === 0) {
        return (
            <p className="text-sm text-surface-400 py-4 text-center">No meeting history available.</p>
        );
    }

    const sorted = [...meetings].sort((a, b) => new Date(a.date) - new Date(b.date));

    const chartData = sorted.map((m) => ({
        date: new Date(m.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        'Sessions Done': m.sessionsDone,
        'Total Goal': m.totalGoal,
    }));

    return (
        <div className="mt-4">
            <h4 className="text-sm font-semibold text-surface-700 mb-3">
                Session Progress — {teamName}
            </h4>

            {/* Line Chart */}
            <div className="h-48 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 12, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Legend wrapperStyle={{ fontSize: 12, paddingTop: '8px' }} />
                        <Line type="monotone" dataKey="Sessions Done" stroke="#334155" strokeWidth={2} dot={{ r: 4, fill: '#334155' }} activeDot={{ r: 5 }} />
                        <Line type="monotone" dataKey="Total Goal" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4, fill: '#94a3b8' }} activeDot={{ r: 5 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* History Table */}
            <div className="overflow-x-auto rounded-lg border border-surface-200">
                <table className="w-full text-sm">
                    <thead className="bg-surface-50">
                    <tr>
                        {['Date', 'Members', 'TM', 'DM', 'ADM', 'Done', 'Goal'].map((h) => (
                            <th key={h} className="text-left px-3 py-2 text-xs font-semibold text-surface-500 uppercase tracking-wide whitespace-nowrap">
                                {h}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-100">
                    {[...sorted].reverse().map((m, i) => (
                        <tr
                            key={m._id || i}
                            onClick={() => teamId && m._id && navigate(`/teams/${teamId}/meetings/${m._id}`)}
                            className={`transition-colors ${teamId && m._id ? 'hover:bg-blue-50 cursor-pointer' : 'hover:bg-surface-50'}`}
                        >
                            <td className="px-3 py-2 text-surface-700 whitespace-nowrap text-xs">
                                <div className="flex items-center gap-1.5">
                                    <div>
                                        <div className={`font-semibold ${teamId && m._id ? 'text-blue-700' : ''}`}>
                                            {new Date(m.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                                        </div>
                                        {m.time && <div className="text-[10px] text-surface-400 font-normal mt-0.5">{m.time}</div>}
                                    </div>
                                    {teamId && m._id && (
                                        <span className="text-[10px] text-blue-400 opacity-0 group-hover:opacity-100">→</span>
                                    )}
                                </div>
                            </td>
                            <td className="px-3 py-2 text-surface-700 text-xs">
                                <div className="font-semibold text-center">{m.members ?? '—'} / {m.totalMembers ?? '—'}</div>
                                {m.memberNames?.length > 0 && (
                                    <span className="block text-[10px] text-surface-400 font-normal max-w-[120px] truncate" title={`Present: ${m.memberNames.filter(Boolean).join(', ')}`}>
                      Pres: {m.memberNames.filter(Boolean).join(', ')}
                    </span>
                                )}
                            </td>
                            <td className="px-3 py-2"><StatusPill value={m.tm} label="TM" name={m.tmName} /></td>
                            <td className="px-3 py-2"><StatusPill value={m.dm} label="DM" name={m.dmName} /></td>
                            <td className="px-3 py-2"><StatusPill value={m.adm} label="ADM" name={m.admName} /></td>
                            <td className="px-3 py-2 font-semibold text-surface-800 text-center">{m.sessionsDone}</td>
                            <td className="px-3 py-2 text-surface-500 text-center">{m.totalGoal}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            {teamId && (
                <p className="text-[10px] text-surface-400 mt-2 text-center">Click any row to view full meeting details</p>
            )}
        </div>
    );
}
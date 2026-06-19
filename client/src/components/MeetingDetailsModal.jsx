import React from 'react';

export default function MeetingDetailsModal({ meeting, teamName, onClose }) {
  if (!meeting) return null;

  const getStatusBadge = (val, label, name) => {
    const cls = {
      yes: 'bg-green-100 text-green-800 border-green-200',
      no: 'bg-red-100 text-red-800 border-red-200',
      'in progress': 'bg-amber-100 text-amber-800 border-amber-200',
    }[val] || 'bg-red-100 text-red-800 border-red-200';

    const icon = { yes: '✓', no: '✗', 'in progress': '~' }[val] || '✗';

    return (
      <div className={`p-3 rounded-xl border ${cls} flex flex-col gap-1`}>
        <div className="flex justify-between items-center">
          <span className="font-semibold text-[10px] uppercase tracking-wider">{label}</span>
          <span className="font-bold text-sm">{icon}</span>
        </div>
        <div className="text-sm font-semibold">{val === 'yes' ? 'Yes' : val === 'in progress' ? 'In Progress' : 'No'}</div>
        {val === 'yes' && name && <div className="text-[11px] opacity-80 italic mt-0.5">Name: {name}</div>}
      </div>
    );
  };

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4 py-6"
      onClick={onClose}
    >
      <div 
        className="card w-full max-w-lg p-6 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-surface-200 mb-4">
          <div>
            <h2 className="text-lg font-bold text-surface-900">Meeting Details</h2>
            <p className="text-xs text-surface-500 mt-0.5">Team: <strong className="text-surface-700">{teamName}</strong></p>
          </div>
          <button 
            onClick={onClose}
            className="text-surface-400 hover:text-surface-600 text-lg p-1.5 hover:bg-surface-100 rounded-full transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-5">
          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4 bg-surface-50 p-3 rounded-xl border border-surface-150">
            <div>
              <span className="block text-[10px] text-surface-500 uppercase tracking-wider font-semibold">Date</span>
              <span className="text-sm font-medium text-surface-800">
                {new Date(meeting.date).toLocaleDateString('en-IN', {
                  day: '2-digit', month: 'long', year: 'numeric'
                })}
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-surface-500 uppercase tracking-wider font-semibold">Time</span>
              <span className="text-sm font-medium text-surface-800">{meeting.time || '—'}</span>
            </div>
          </div>

          {/* Status Badges Grid */}
          <div>
            <h3 className="text-xs font-semibold text-surface-600 uppercase tracking-wider mb-2">Roles & Attendance</h3>
            <div className="grid grid-cols-2 gap-3">
              {getStatusBadge(meeting.tm, 'TM Status', meeting.tmName)}
              {getStatusBadge(meeting.dm, 'DM Status', meeting.dmName)}
              {getStatusBadge(meeting.adm, 'ADM Status', meeting.admName)}
              <div className={`p-3 rounded-xl border flex flex-col gap-1 ${
                meeting.tac === 'yes' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'
              }`}>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[10px] uppercase tracking-wider">TAC Status</span>
                  <span className="font-bold text-sm">{meeting.tac === 'yes' ? '✓' : '✗'}</span>
                </div>
                <div className="text-sm font-semibold">{meeting.tac === 'yes' ? 'Yes' : 'No'}</div>
                {meeting.tac === 'yes' && meeting.tacName && (
                  <div className="text-[11px] opacity-80 italic mt-0.5">Name: {meeting.tacName}</div>
                )}
              </div>
            </div>
          </div>

          {/* Members (Present & Total) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Members Present */}
            <div className="bg-surface-50 p-4 rounded-xl border border-surface-200">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-semibold text-surface-600 uppercase tracking-wider">Present</h4>
                <span className="text-xs bg-surface-200 text-surface-700 px-2 py-0.5 rounded-full font-bold">
                  {meeting.members ?? 0}
                </span>
              </div>
              {meeting.memberNames?.filter(Boolean).length > 0 ? (
                <div className="flex flex-wrap gap-1 max-h-[120px] overflow-y-auto pr-1">
                  {meeting.memberNames.filter(Boolean).map((n, idx) => (
                    <span key={idx} className="text-xs bg-white text-surface-700 border border-surface-200 px-2 py-0.5 rounded-md font-medium">
                      {n}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-surface-400 italic">None logged</span>
              )}
            </div>

            {/* Total Team Members */}
            <div className="bg-surface-50 p-4 rounded-xl border border-surface-200">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-semibold text-surface-600 uppercase tracking-wider">Total Team</h4>
                <span className="text-xs bg-surface-200 text-surface-700 px-2 py-0.5 rounded-full font-bold">
                  {meeting.totalMembers ?? 0}
                </span>
              </div>
              {meeting.totalMemberNames?.filter(Boolean).length > 0 ? (
                <div className="flex flex-wrap gap-1 max-h-[120px] overflow-y-auto pr-1">
                  {meeting.totalMemberNames.filter(Boolean).map((n, idx) => (
                    <span key={idx} className="text-xs bg-white text-surface-700 border border-surface-200 px-2 py-0.5 rounded-md font-medium">
                      {n}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-surface-400 italic">None logged</span>
              )}
            </div>
          </div>

          {/* Operational Metrics */}
          <div className="bg-surface-50 p-4 rounded-xl border border-surface-200">
            <h4 className="text-xs font-semibold text-surface-600 uppercase tracking-wider mb-3">Operational Metrics</h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-white rounded-lg border border-surface-150">
                <span className="block text-[10px] text-surface-500 uppercase font-semibold">Goal</span>
                <span className="text-sm font-bold text-surface-800">{meeting.totalGoal ?? '—'}</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-surface-150">
                <span className="block text-[10px] text-surface-500 uppercase font-semibold">Done</span>
                <span className="text-sm font-bold text-surface-800 text-green-700">{meeting.sessionsDone ?? '—'}</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-surface-150">
                <span className="block text-[10px] text-surface-500 uppercase font-semibold">Feedback</span>
                <span className="text-sm font-bold text-surface-800">{meeting.centerFeedbackMeetings ?? '—'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-surface-200 mt-4 flex justify-end">
          <button onClick={onClose} className="btn-secondary text-xs px-4 py-2">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

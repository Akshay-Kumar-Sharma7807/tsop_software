/**
 * Pure scoring utilities — no React, no side effects.
 */

/**
 * Get the latest meeting from a team's meetings array.
 * Returns null if no meetings exist.
 */
export function getLatestMeeting(team) {
  if (!team.meetings || team.meetings.length === 0) return null;
  // Sort by date descending, return first
  return [...team.meetings].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
}

/**
 * Score a single team's latest meeting against the active constraints.
 * Returns { score, color, failedConstraints }
 */
export function scoreTeam(meeting, constraints = {}) {
  if (!meeting) {
    return { score: 5, color: 'red', failedConstraints: ['No meeting data'] };
  }

  // Fallback default constraints since administration is removed
  const activeConstraints = {
    tmRequired: { enabled: true },
    dmRequired: { enabled: true },
    admRequired: { enabled: true },
    ...constraints,
  };

  const failed = [];
  const { tmRequired, dmRequired, admRequired, minTotalMembers } = activeConstraints;

  // 1. TM required
  if (tmRequired?.enabled) {
    if (meeting.tm !== 'yes') {
      failed.push('TM missing');
    }
  }

  // 2. DM required
  if (dmRequired?.enabled) {
    if (meeting.dm !== 'yes') {
      failed.push('DM missing');
    }
  }

  // 3. ADM required
  if (admRequired?.enabled) {
    if (meeting.adm !== 'yes') {
      failed.push('ADM missing');
    }
  }

  // 4. Min total members
  if (minTotalMembers?.enabled) {
    if ((meeting.members ?? 0) < (minTotalMembers.value ?? 5)) {
      failed.push(`< ${minTotalMembers.value} total members`);
    }
  }

  const score = failed.length;
  let color = 'green';
  if (score >= 3) color = 'red';
  else if (score >= 1) color = 'amber';

  return { score, color, failedConstraints: failed };
}

/**
 * Compute completion percentage for a meeting.
 */
export function completionPct(meeting) {
  if (!meeting || !meeting.totalGoal) return 0;
  return (meeting.sessionsDone / meeting.totalGoal) * 100;
}

/**
 * Sort teams: Red → Amber → Green, then by completion % ascending within each group.
 */
export function sortTeams(scoredTeams) {
  const order = { red: 0, amber: 1, green: 2 };
  return [...scoredTeams].sort((a, b) => {
    const colorDiff = order[a.color] - order[b.color];
    if (colorDiff !== 0) return colorDiff;
    return a.pct - b.pct; // ascending (worst first within same color)
  });
}

/**
 * Enrich teams array with scoring data for use in UI.
 */
export function enrichTeams(teams, constraints) {
  return teams.map((team) => {
    const latest = getLatestMeeting(team);
    const { score, color, failedConstraints } = scoreTeam(latest, constraints);
    const pct = completionPct(latest);
    return { ...team, latest, score, color, failedConstraints, pct };
  });
}

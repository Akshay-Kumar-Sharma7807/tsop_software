import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useConstraints } from '../context/ConstraintContext';
import { enrichTeams, sortTeams } from '../utils/scoring';
import SummaryBar from '../components/SummaryBar';
import ConstraintPanel from '../components/ConstraintPanel';
import TeamCard from '../components/TeamCard';

export default function Dashboard() {
  const { constraints, loading: constraintsLoading } = useConstraints();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch teams once
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const { data } = await axios.get('/api/teams');
        setTeams(data);
      } catch (err) {
        setError('Failed to load teams. Is the server running?');
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, []);

  // Re-score and sort whenever teams or constraints change
  const scoredTeams = sortTeams(enrichTeams(teams, constraints));

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Top Nav */}
      <header className="bg-white border-b border-surface-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-bold text-surface-900 text-sm">TSoP Dashboard</span>
            <span className="hidden sm:inline text-surface-400 text-xs">· Adore India</span>
          </div>
          <Link
            to="/admin"
            id="admin-link"
            className="btn-secondary text-xs px-3 py-1.5"
          >
            ⚙ Admin Panel
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-surface-900">Team Overview</h1>
          <p className="text-sm text-surface-500 mt-1">
            Sorted by priority — Red → Amber → Green, then by completion % (lowest first).
          </p>
        </div>

        {/* Loading / Error */}
        {(loading || constraintsLoading) && (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin w-8 h-8 border-4 border-surface-200 border-t-surface-700 rounded-full" />
          </div>
        )}

        {error && (
          <div className="card bg-red-50 border border-red-200 p-4 text-red-700 text-sm mb-6">
            {error}
          </div>
        )}

        {!loading && !constraintsLoading && !error && (
          <>
            {/* Summary Bar */}
            <SummaryBar teams={scoredTeams} />

            {/* Constraint Accordion */}
            <ConstraintPanel />

            {/* Team Accordion List */}
            {scoredTeams.length === 0 ? (
              <div className="card p-12 text-center text-surface-400">
                <p className="text-lg font-medium">No teams found.</p>
                <p className="text-sm mt-1">Go to the Admin Panel to add teams.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {scoredTeams.map((team) => (
                  <TeamCard key={team._id} team={team} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

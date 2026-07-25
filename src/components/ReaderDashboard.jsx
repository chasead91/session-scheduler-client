import { useState, useEffect } from 'react';
import { getReaderDashboard } from '../api/readers';
import { updateSessionStatus } from '../api/sessions';
import { useParams } from 'react-router-dom';

export default function ReaderDashboard() {
  const [sessions, setSessions] = useState([]);
  const [readerName, setReaderName] = useState(null)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { reader_id } = useParams()

  useEffect(() => {
    // 1. Fetch sessions when component mounts
    getReaderDashboard(reader_id)
      .then((data) => {
        console.log('data received from endpoint',data)
        setSessions(data.sessions);
        setReaderName(data['reader-name'])
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []); // Empty dependency array ensures this runs once on mount

  const handleSessionChange = (sessionId, sessionAction) => {
    const statusMap = {
      'start-session': 'In Progress',
      'end-session': 'Complete',
      'reset-session': 'Waiting',
    };

    const newStatus = statusMap[sessionAction];
    if (newStatus) {
      updateSessionStatus(sessionId, newStatus)
        .then((data) => {
          const readerSessionData = data.session_data.filter((obj) => obj['reader-id'] == reader_id)
          setSessions(readerSessionData)
        })
        .catch((err) => {
          setError(err.message);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };
  // 2. Handle loading and error states in UI
  if (loading) {return <div>Loading sessions...</div>};
  if (error) {return <div>Error: {error}</div>};

  // 3. Render your sessions
  return (
<div className="min-h-screen bg-base-200 text-base-content p-4 md:p-8 font-sans">
  <div className="max-w-4xl mx-auto space-y-6">
    
    {/* Reader Header */}
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-base-100 p-5 rounded-2xl border border-base-300 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Avatar badge */}
        <div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl border border-primary/20 shrink-0">
          {readerName ? readerName.charAt(0) : "R"}
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-primary tracking-tight">
            {readerName}
          </h1>
          <p className="text-xs md:text-sm text-base-content/70 font-medium">
            Reader Dashboard & Active Queue
          </p>
        </div>
      </div>

      <div className="badge badge-primary badge-outline font-semibold px-3 py-2 self-start sm:self-auto text-xs">
        {sessions.length} {sessions.length === 1 ? 'Session' : 'Sessions'}
      </div>
    </header>

    {/* ================= MOBILE VIEW (Card Layout for Phones) ================= */}
    <div className="space-y-3 sm:hidden">
      {sessions.map((session) => {
        const statusLower = String(session['status']).toLowerCase();
        let badgeClass = "badge-neutral";
        if (statusLower.includes("in progress") || statusLower.includes("active")) {
          badgeClass = "badge-success";
        } else if (statusLower.includes("waiting") || statusLower.includes("pending")) {
          badgeClass = "badge-warning";
        } else if (statusLower.includes("completed") || statusLower.includes("done")) {
          badgeClass = "badge-info";
        }

        return (
          <div 
            key={session.session_id} 
            className="card bg-base-100 border border-base-300 shadow-sm p-4 space-y-3"
          >
            {/* Top Row: Client & Status */}
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-xs text-base-content/60 font-semibold uppercase tracking-wider block">Client</span>
                <span className="text-lg font-bold text-base-content">{session['sitter-name']}</span>
              </div>
              <span className={`badge ${badgeClass} badge-sm font-bold uppercase tracking-wide`}>
                {session['status']}
              </span>
            </div>

            {/* Middle Row: Created Time */}
            <div className="text-xs text-base-content/60 font-mono">
              Created: {session['created-at']}
            </div>

            {/* Bottom Row: Action Dropdown */}
            <div className="pt-2 border-t border-base-200">
              <select
                className="select select-bordered select-sm w-full bg-base-100 font-medium focus:select-primary"
                onChange={(e) => handleSessionChange(session.session_id, e.target.value)}
                defaultValue=""
                value=""
              >
                <option value="" disabled>Manage Session...</option>
                <option value="start-session">Start Session</option>
                <option value="end-session">Mark Session Complete</option>
                <option value="reset-session">Reset Session</option>
              </select>
            </div>
          </div>
        );
      })}
    </div>

    {/* ================= TABLET & DESKTOP VIEW (Table) ================= */}
    <div className="hidden sm:block card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table table-md w-full">
          <thead className="bg-base-200/60 text-base-content/70 text-xs uppercase tracking-wider">
            <tr>
              <th>Status</th>
              <th>Client</th>
              <th>Created</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-base-200/60 font-medium">
            {sessions.map((session) => {
              const statusLower = String(session['status']).toLowerCase();
              let badgeClass = "badge-neutral";
              if (statusLower.includes("in progress") || statusLower.includes("active")) {
                badgeClass = "badge-success";
              } else if (statusLower.includes("waiting") || statusLower.includes("pending")) {
                badgeClass = "badge-warning";
              } else if (statusLower.includes("completed") || statusLower.includes("done")) {
                badgeClass = "badge-info";
              }

              return (
                <tr key={session.session_id} className="hover:bg-base-200/30 transition-colors">
                  <td>
                    <span className={`badge ${badgeClass} badge-sm font-bold px-2.5 py-2 uppercase tracking-wide`}>
                      {session['status']}
                    </span>
                  </td>
                  <td className="font-bold text-base-content text-base">
                    {session['sitter-name']}
                  </td>
                  <td className="font-mono text-xs text-base-content/70">
                    {session['created-at']}
                  </td>
                  <td className="text-right">
                    <select
                      className="select select-bordered select-xs w-full max-w-[170px] bg-base-100 font-medium focus:select-primary"
                      onChange={(e) => handleSessionChange(session.session_id, e.target.value)}
                      defaultValue=""
                      value=""
                    >
                      <option value="" disabled>Select option...</option>
                      <option value="start-session">Start Session</option>
                      <option value="end-session">Mark Session Complete</option>
                      <option value="reset-session">Reset Session</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>

  </div>
</div>
  );
}

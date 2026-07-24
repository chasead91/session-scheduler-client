import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSessions } from '../api/sessions'

export default function Dashboard() {
  // const [sessions, setSessions] = useState([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);

  // useEffect(() => {
  //   // 1. Fetch sessions when component mounts
  //   getSessions()
  //     .then((data) => {
  //       setSessions(data);
  //     })
  //     .catch((err) => {
  //       setError(err.message);
  //     })
  //     .finally(() => {
  //       setLoading(false);
  //     });
  // }, []); // Empty dependency array ensures this runs once on mount

  const { data: sessions = [], isLoading, error } = useQuery({
    queryKey: ['sessions'], // Unique key for caching
    queryFn: getSessions,   // Uses your existing getSessions from api/sessions
    refetchInterval: 5000,  // 🔄 Automatically polls Flask every 5 seconds for live updates!
  });

  // 2. Handle loading and error states in UI
  if (isLoading) {return <div>Loading sessions...</div>};
  if (error) {return <div>Error: {error}</div>};

  // 3. Render your sessions
  return (
    <div>
      <h1>Dashboard</h1>
      <table>
        <thead>
          <tr>
            <th>Status</th>
            <th>Reader</th>
            <th>Location</th>
            <th>Client</th>
            <th>Session Type</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => (
            <tr key={session.session_id}>
              <td>{session['status']}</td>
              <td>{session['reader-name']}</td>
              <td>{session['location']}</td>
              <td>{session['sitter-name']}</td>
              <td>{session['session-type']}</td>
              <td>{session['created-at']}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <ul>
      </ul>
    </div>
  );
}

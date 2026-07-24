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
    <div>
      <h1>Dashboard for {readerName}</h1>
        <table>
          <thead>
            <tr>
              <th>Status</th>
              <th>Client</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.session_id}>
                <td>{session['status']}</td>
                <td>{session['sitter-name']}</td>
                <td>{session['created-at']}</td>
                <td>
                  <div>
                    <select
                        onChange={(e) => handleSessionChange(session.session_id, e.target.value)}
                        defaultValue=""
                        value = ""
                    >
                      <option value="" disabled>
                        Select an option
                      </option>
                      <option value="start-session">Start Session</option>
                      <option value="end-session">Mark Session Complete</option>
                      <option value="reset-session">Reset Session</option>
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
    </div>
  );
}

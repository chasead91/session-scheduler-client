import { useState, useEffect } from 'react';
import { getReaders, deleteReader } from '../api/readers';
import { getSessions } from '../api/sessions';
import { getSitterData, deleteSitter } from '../api/sitters';
import { updateSessionStatus } from '../api/sessions';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const [data, setData] = useState({ readers: [], sitters: [], sessions: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionAction, setSessionAction] = useState('')
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();

    // Fetch all resources concurrently
    Promise.all([
      getReaders({ signal: controller.signal }),
      getSitterData({ signal: controller.signal }),
      getSessions({ signal: controller.signal }),
    ])
      .then(([readers, sitters, sessions]) => {
        setData({ readers, sitters, sessions });
      })
      .catch((err) => {
        // Ignore errors caused by unmounting / aborted requests
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });

    // Cleanup: cancel requests if component unmounts
    return () => controller.abort();
  }, []);

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
          setData((prevData) =>({
            ...prevData,
            sessions: data.session_data,
          }))
        })
        .catch((err) => {
          setError(err.message);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  const handleReaderChange = (record_id, changeType) => {

    if(changeType == "edit-reader") {
      navigate(`/edit-reader/${record_id}`)
    } else if(changeType == "delete-reader") {
      deleteReader(record_id)
      .then((data) => {
        setData((prevData) => ({
          ...prevData,
          readers: data.readerData
        }))
      })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setIsLoading(false)
      })
    }
  }

  const handleDeleteClient = (sitterId) => {
    deleteSitter(sitterId)
    .then((data) => {
      setData((prevData) => ({
        ...prevData,
        sitters: data.sitterData
      }))
    })
    .catch((err) => {
      setError(err.message)
    })
    .finally(() => {
      setIsLoading(false)
    })
  }

  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Admin Panel</h1>
      <h2>Sessions</h2>

      {isLoading ? (
        <p>Loading Sessions...</p>
      ) : (
        <>
        <table>
          <thead>
            <tr>
              <th>Status</th>
              <th>Reader</th>
              <th>Client</th>
              <th>Session Type</th>
              <th>Location</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.sessions.map((session) => (
              <tr key={session.session_id}>
                <td>{session['status']}</td>
                <td>{session['reader-name']}</td>
                <td>{session['sitter-name']}</td>
                <td>{session['session-type']}</td>
                <td>{session['location']}</td>
                <td>{session['created-at']}</td>
                <td>
                  <div className="dropdown-container">
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
        </>
      )}

      <h2>Readers</h2>
      <button onClick={()=>{navigate('/create-reader')}}>Create Reader</button>
      {isLoading ? (
        <p>Loading Readers...</p>
      ) : (
        <>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Offering</th>
              <th>Bio</th>
              <th>Location</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.readers.map((reader) => (
              <tr key={reader.reader_id}>
                <td>{reader.name}</td>
                <td>{reader.offering}</td>
                <td>{reader.bio}</td>
                <td>{reader.location}</td>
                <td>
                  <div className="dropdown-container">
                    <select
                        onChange={(e) => handleReaderChange(reader.reader_id, e.target.value)}
                        defaultValue=""
                    >
                      <option value="" disabled>
                        Select an option
                      </option>
                      <option value="edit-reader">Edit Reader</option>
                      <option value="delete-reader">Delete Reader</option>
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </>
      )}
    
      <h2>Clients</h2>
      <button onClick={()=>{navigate('/')}}>Create Client</button>
      {isLoading ? (
        <p>Loading Clients...</p>
      ) : (
        <>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.sitters.map((sitter) => (
              <tr key={sitter.sitter_id}>
                <td>{sitter.name}</td>
                <td>
                  <button onClick={() => {handleDeleteClient(sitter.sitter_id)}}>Delete Sitter</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </>
      )}

    </div>
  );
}
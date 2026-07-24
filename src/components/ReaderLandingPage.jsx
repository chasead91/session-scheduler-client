import { useState, useEffect } from 'react';
import { getReaders } from '../api/readers';
import { useNavigate } from 'react-router-dom';

export default function ReaderLandingPage() {
  const [readers, setReaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate()

  useEffect(() => {
    // 1. Fetch sessions when component mounts
    getReaders()
      .then((data) => {
        setReaders(data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []); // Empty dependency array ensures this runs once on mount

  // 2. Handle loading and error states in UI
  if (loading) {return <div>Loading sessions...</div>};
  if (error) {return <div>Error: {error}</div>};

  // 3. Render your sessions
  return (
    <div>
      <h1>All Readers</h1>
      <table>
        <thead>
          <tr>
            <th>Reader Name</th>
          </tr>
        </thead>
        <tbody>
          {readers.map((reader) => (
            <tr key={reader.reader_id}>
              <td>
                <button onClick={() => navigate(`/reader-dashboard/${reader.reader_id}`)}>
                  {reader.name}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ul>
      </ul>
    </div>
  );
}

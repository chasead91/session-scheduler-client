import { useState, useEffect, useCallback } from 'react';
import { getReaders, deleteReader, uploadReaderData } from '../api/readers';
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

  const [sessionSearchTerm, setSessionSearchTerm] = useState('');
  const [readerSearchTerm, setReaderSearchTerm] = useState('');
  const [sitterSearchTerm, setSitterSearchTerm] = useState('');

  const [uploadingReaders, setUploadingReaders] = useState(false)
  const [readerFile, setReaderFile] = useState(null)
  const [isUploadingReaders, setIsUploadingReaders] = useState(false)
  const [readerUploadStatus, setReaderUploadStatus] = useState();

  const fetchData = useCallback((signal) => {
    setIsLoading(true);

    Promise.all([
      getReaders({ signal }),
      getSitterData({ signal }),
      getSessions({ signal }),
    ])
      .then(([readers, sitters, sessions]) => {
        setData({ readers, sitters, sessions });
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);

    return () => controller.abort();
  }, [fetchData]);

  const filteredSessionData = data.sessions.filter((session) => {
    const term = sessionSearchTerm.toLowerCase();
    return (
      session['status'].toLowerCase().includes(term) ||
      session['reader-name'].toLowerCase().includes(term) ||
      session['sitter-name'].toLowerCase().includes(term) ||
      session['location'].toLowerCase().includes(term)
    )
  })

  const filteredReaderData = data.readers.filter((reader) => {
    const term = readerSearchTerm.toLowerCase();
    return (
      reader.name.toLowerCase().includes(term)
    )
  })

  const filteredSitterData = data.sitters.filter((sitter) => {
    const term = sitterSearchTerm.toLowerCase();
    return (
      sitter.name.toLowerCase().includes(term)
    )
  })

  const handleSessionChange = async (sessionId, sessionAction) => {
    const statusMap = {
      'start-session': 'In Progress',
      'end-session': 'Complete',
      'reset-session': 'Waiting',
    };

    const newStatus = statusMap[sessionAction];
    if (!newStatus) return;

    try {
      setIsLoading(true);
      await updateSessionStatus(sessionId, newStatus);
      // Trigger a full refresh across all endpoints
      fetchData();
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleReaderChange = async (record_id, changeType) => {

    if (changeType == "edit-reader") {
      navigate(`/edit-reader/${record_id}`)
    } else if (changeType == "delete-reader") {
      try {
        setIsLoading(true);
        await deleteReader(record_id);
        // Trigger a full refresh across all endpoints
        fetchData();
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    }
  }

  const handleDeleteClient = async (sitterId) => {
    const confirmed = window.confirm('Are you sure you want to delete this client?')
    if (confirmed) {
      try {
        setIsLoading(true);
        await deleteSitter(sitterId);
        // Trigger a full refresh across all endpoints
        fetchData();
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setReaderFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!readerFile) {
      setReaderUploadStatus('Please select a file first.');
      return;
    }

    setIsUploadingReaders(true);
    setReaderUploadStatus('Uploading and processing...');

    const formData = new FormData();
    // 'file' key must match request.files['file'] in Flask
    formData.append('file', readerFile);

    try {
      // uploadReaderData calls apiClient, which already returns the parsed JSON data (or throws if !response.ok)
      const data = await uploadReaderData(formData);
      setReaderUploadStatus(`Success: ${data.message}`);
      setData((prevData) => ({
        ...prevData,
        readers: data.readerData
      }))
      const timer = setTimeout(() => {
        setReaderUploadStatus("")
      }, 4000)
      setReaderFile(null);
    } catch (err) {
      setReaderUploadStatus(`Upload failed: ${err.message}`);
    } finally {
      setIsUploadingReaders(false);
    }

  };

  const formatTime = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC' // Uncomment this if you want to keep UTC time instead of local time
    });
  };

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen bg-base-200 text-base-content p-6 lg:p-8 space-y-8 font-sans">

      {/* Admin Header */}
      <header className="flex items-center justify-between border-b border-base-300 pb-5">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-primary">Admin Panel</h1>
          <p className="text-sm text-base-content/70 mt-0.5">Manage active sessions, readers, and client rosters</p>
        </div>
      </header>

      {/* ================= SESSIONS SECTION ================= */}
      <section className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
        <div className="card-body p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="card-title text-xl font-bold">Sessions</h2>
              {!isLoading && data?.sessions && (
                <span className="badge badge-neutral badge-sm font-semibold">
                  {data.sessions.length}
                </span>
              )}
            </div>
          </div>
          <div>

            <input
              type='text'
              placeholder='Search by Status, Reader, Client, or Location...'
              value={sessionSearchTerm}
              onChange={(e) => setSessionSearchTerm(e.target.value)}
              className='input mb-8'
            />
          </div>

          {isLoading ? (
            <div className="flex items-center gap-3 py-8 text-base-content/70 justify-center">
              <span className="loading loading-spinner loading-md text-primary"></span>
              <span className="font-medium">Loading Sessions...</span>
            </div>
          ) : (
            <div className="h-80 overflow-x-auto mb-8">
              <table className="table table-sm w-full">
                <thead className="bg-base-200/60 text-base-content/70 text-xs uppercase tracking-wider">
                  <tr>
                    <th>Status</th>
                    <th>Reader</th>
                    <th>Client</th>
                    <th>Session Type</th>
                    <th>Location</th>
                    <th>Created</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-200/60 font-medium">
                  {filteredSessionData.map((session) => {
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
                          <span className={`badge ${badgeClass} badge-xs font-bold px-2 py-2 uppercase tracking-wider`}>
                            {session['status']}
                          </span>
                        </td>
                        <td className="font-semibold text-base-content">{session['reader-name']}</td>
                        <td>{session['sitter-name']}</td>
                        <td>
                          <span className="bg-base-200 text-xs px-2 py-1 rounded font-medium border border-base-300">
                            {session['session-type']}
                          </span>
                        </td>
                        <td className="text-base-content/80">{session['location']}</td>
                        <td className="font-mono text-xs text-base-content/60">{formatTime(session['created-at'])}</td>
                        <td className="text-right">
                          <select
                            className="select select-bordered select-xs w-full max-w-[170px] bg-base-100 focus:select-primary"
                            onChange={(e) => {
                              const action = e.target.value;
                              if (!action) return;

                              const actionText = e.target.options[e.target.selectedIndex].text;
                              const confirmed = window.confirm(`Are you sure you want to ${actionText}?`);

                              if (confirmed) {
                                handleSessionChange(session.session_id, action);
                              }

                              // Reset dropdown back to default placeholder state
                              e.target.value = "";
                            }}
                            defaultValue=""
                            value=""
                          >
                            <option value="" disabled>Actions...</option>
                            <option value="start-session">Start Session</option>
                            <option value="end-session">Mark Complete</option>
                            <option value="reset-session">Reset Session</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* ================= READERS SECTION ================= */}
      <section className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
        <div className="card-body p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="card-title text-xl font-bold">Readers</h2>
              {!isLoading && data?.readers && (
                <span className="badge badge-neutral badge-sm font-semibold">
                  {data.readers.length}
                </span>
              )}
            </div>
            <div className='flex flex-col gap-2'>
              <div className='flex gap-2'>
                <button
                  onClick={() => navigate('/create-reader')}
                  className="btn btn-primary btn-sm gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  Create Reader
                </button>
                <button
                  onClick={() => setUploadingReaders(!uploadingReaders)}
                  className="btn btn-primary btn-sm gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  Upload Readers
                </button>
              </div>
            </div>
          </div>
          <div>
            <input
              type='text'
              placeholder='Reader Name...'
              value={readerSearchTerm}
              onChange={(e) => setReaderSearchTerm(e.target.value)}
              className='input'
            />
          </div>

          {isLoading ? (
            <div className="flex items-center gap-3 py-8 text-base-content/70 justify-center">
              <span className="loading loading-spinner loading-md text-primary"></span>
              <span className="font-medium">Loading Readers...</span>
            </div>
          ) : (
            <div className="h-80 overflow-x-auto">
              <div className='flex justify-end items-center mb-8 p-2'>
                {uploadingReaders &&
                  <div>
                    <form onSubmit={handleUpload} className='flex gap-2 items-center'>
                      <input
                        type='file'
                        className='input'
                        accept='.csv'
                        onChange={(e) => handleFileChange(e)}
                      />
                      <button
                        type="submit"
                        className='btn btn-primary btn-sm'
                        disabled={!readerFile || isUploadingReaders}
                      >
                        {isUploadingReaders ? 'Uploading...' : 'Upload'}
                      </button>
                    </form>
                    {readerUploadStatus && <p className='text-xs italic mt-2'>{readerUploadStatus}</p>}
                  </div>
                }
              </div>
              <table className="table table-sm w-full">
                <thead className="bg-base-200/60 text-base-content/70 text-xs uppercase tracking-wider">
                  <tr>
                    <th>Name</th>
                    <th>Offering</th>
                    <th>Bio</th>
                    <th>Location</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-200/60 font-medium">
                  {filteredReaderData.map((reader) => (
                    <tr key={reader.reader_id} className="hover:bg-base-200/30 transition-colors">
                      <td className="font-bold text-base-content">{reader.name}</td>
                      <td>
                        <span className="badge badge-outline badge-sm font-medium">
                          {reader.offering}
                        </span>
                      </td>
                      <td className="max-w-xs">
                        <p className="line-clamp-1 text-xs text-base-content/70" title={reader.bio}>
                          {reader.bio}
                        </p>
                      </td>
                      <td className="text-base-content/80">{reader.location}</td>
                      <td className="text-right">
                        <select
                          className="select select-bordered select-xs w-full max-w-[150px] bg-base-100 focus:select-primary"
                          onChange={(e) => {
                            const action = e.target.value;
                            if (!action) return;

                            const actionText = e.target.options[e.target.selectedIndex].text;
                            const confirmed = window.confirm(`Are you sure you want to ${actionText}?`);

                            if (confirmed) {
                              handleReaderChange(reader.reader_id, e.target.value);
                            }

                            // Reset dropdown back to default placeholder state
                            e.target.value = "";
                          }}
                          defaultValue=""
                        >
                          <option value="" disabled>Actions...</option>
                          <option value="edit-reader">Edit Reader</option>
                          <option value="delete-reader">Delete Reader</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* ================= CLIENTS SECTION ================= */}
      <section className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
        <div className="card-body p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="card-title text-xl font-bold">Clients</h2>
              {!isLoading && data?.sitters && (
                <span className="badge badge-neutral badge-sm font-semibold">
                  {data.sitters.length}
                </span>
              )}
            </div>
            <button
              onClick={() => navigate('/')}
              className="btn btn-secondary btn-sm gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              Create Client
            </button>
          </div>
          <div>
            <input
              type='text'
              placeholder='Client Name...'
              value={sitterSearchTerm}
              onChange={(e) => setSitterSearchTerm(e.target.value)}
              className='input mb-8'
            />
          </div>

          {isLoading ? (
            <div className="flex items-center gap-3 py-8 text-base-content/70 justify-center">
              <span className="loading loading-spinner loading-md text-primary"></span>
              <span className="font-medium">Loading Clients...</span>
            </div>
          ) : (
            <div className="h-80 overflow-x-auto">
              <table className="table table-sm w-full">
                <thead className="bg-base-200/60 text-base-content/70 text-xs uppercase tracking-wider">
                  <tr>
                    <th>Client Name</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-200/60 font-medium">
                  {filteredSitterData.map((sitter) => (
                    <tr key={sitter.sitter_id} className="hover:bg-base-200/30 transition-colors">
                      <td className="font-semibold text-base-content">{sitter.name}</td>
                      <td className="text-right">
                        <button
                          onClick={() => handleDeleteClient(sitter.sitter_id)}
                          className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
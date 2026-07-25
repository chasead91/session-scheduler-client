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
  if (loading) { return <div>Loading sessions...</div> };
  if (error) { return <div>Error: {error}</div> };

  // 3. Render your sessions
  return (
    <div className="min-h-screen bg-base-200 text-base-content px-4 py-8 md:p-8 flex justify-center items-start font-sans">
      <div className="w-full max-w-md md:max-w-xl space-y-6">

        {/* Page Header */}
        <header className="text-center space-y-1">
          <h1 className="text-3xl md:text-4xl font-extrabold text-primary tracking-tight">
            Select Your Name
          </h1>
          <p className="text-sm md:text-base text-base-content/70 font-medium">
            Tap your profile to open your reader dashboard
          </p>
        </header>

        {/* Reader Directory Cards */}
        <main className="space-y-3">
          {readers.map((reader) => (
            <button
              key={reader.reader_id}
              onClick={() => navigate(`/reader-dashboard/${reader.reader_id}`)}
              className="w-full card bg-base-100 hover:bg-base-200/60 active:scale-[0.98] border border-base-300 shadow-sm transition-all duration-150 group"
            >
              <div className="card-body p-4 md:p-5 flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Avatar Placeholder */}
                  <div className="avatar placeholder">
                    <div className="bg-neutral text-neutral-content rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center">
                      <span className="text-base md:text-lg font-bold">
                        {reader.name.charAt(0)}
                      </span>
                    </div>
                  </div>

                  {/* Reader Name */}
                  <span className="text-lg md:text-xl font-bold text-base-content group-hover:text-primary transition-colors text-left">
                    {reader.name}
                  </span>
                </div>

                {/* Chevron Right Indicator */}
                <svg
                  className="w-5 h-5 text-base-content/40 group-hover:text-primary group-hover:translate-x-1 transition-all"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </main>

      </div>
    </div>
  );
}

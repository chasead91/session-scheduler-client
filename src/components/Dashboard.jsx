import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSessions } from '../api/sessions'

export default function Dashboard() {
  const { data: sessions = [], isLoading, error } = useQuery({
    queryKey: ['sessions'], // Unique key for caching
    queryFn: getSessions,   // Uses your existing getSessions from api/sessions
    refetchInterval: 5000,  // 🔄 Automatically polls Flask every 5 seconds for live updates!
  });

  const activeSessions = sessions.filter((session) => session.status == 'In Progress')
  const inProgressReaders = new Set(sessions.filter(session => session.status == 'In Progress').map(session => session['reader-name']))
  const availableReaders = new Set(sessions.filter(session => !inProgressReaders.has(session['reader-name'])).map(session => session['reader-name']))

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
  // 2. Handle loading and error states in UI
  if (isLoading) { return <div>Loading sessions...</div> };
  if (error) { return <div>Error: {error}</div> };

  // 3. Render your sessions
  return (
    <div className="min-h-screen bg-base-300 text-base-content p-6 lg:p-10 font-sans">

      {/* Header & Status Indicator */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-wide text-primary">
              DESERTS & DIVINATION
            </h1>
            <div className="badge badge-primary badge-outline font-bold uppercase text-xs tracking-widest">
              Live Board
            </div>
          </div>
          <p className="text-base-content/70 text-lg font-medium mt-1">
            Real-Time Session Monitoring
          </p>
        </div>

        {/* Sleek Live Indicator */}
        <div className="flex items-center gap-3 bg-base-100 border border-base-200 px-4 py-2 rounded-full shadow-sm self-start md:self-auto">
          <span className="relative flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-success"></span>
          </span>
          <span className="text-sm font-bold tracking-wider uppercase text-base-content/80">
            System Active
          </span>
        </div>
      </header>

      {/* Quick Stats Grid (Enhances "Live Dashboard" feel on projectors) */}
      <div className="flex justify-between gap-4 mb-8">

        <div className="stat bg-base-100 rounded-box shadow-sm border border-base-200/60 py-4">
          <div className="stat-title text-base-content/70 font-semibold">Total Active Sessions</div>
          <div className="stat-value text-primary text-3xl font-black">{activeSessions.length}</div>
        </div>

        <div className="stat bg-base-100 rounded-box shadow-sm border border-base-200/60 py-4">
          <div className="stat-title text-base-content/70 font-semibold">Available Readers</div>
          <div className="stat-value text-secondary text-3xl font-black">
            {availableReaders.size}
          </div>
        </div>

      </div>

      {/* Sleek Table Container */}
      <div className="bg-base-100 rounded-box shadow-lg border border-base-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-lg w-full">
            {/* Table Header */}
            <thead className="bg-base-200/50 text-base-content/70 text-sm font-bold uppercase tracking-wider">
              <tr>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Reader</th>
                <th className="py-4 px-6">Location</th>
                <th className="py-4 px-6">Client</th>
                <th className="py-4 px-6">Session Type</th>
                <th className="py-4 px-6 text-right">Created</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-base-200/60 text-lg font-medium">
              {sessions.filter(session => session.status != 'Complete').map((session) => {
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
                  <tr
                    key={session.session_id}
                    className="hover:bg-base-200/40 transition-colors"
                  >
                    {/* Status Column */}
                    <td className="py-5 px-6">
                      <span className={`badge ${badgeClass} badge-md font-bold px-3 py-2 uppercase tracking-wide`}>
                        {session['status']}
                      </span>
                    </td>

                    {/* Reader Name */}
                    <td className="py-5 px-6 font-bold text-base-content">
                      {session['reader-name']}
                    </td>

                    {/* Location */}
                    <td className="py-5 px-6 text-base-content/80">
                      <span className="inline-flex items-center gap-2">
                        <svg className="w-4 h-4 text-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {session['location']}
                      </span>
                    </td>

                    {/* Client / Sitter */}
                    <td className="py-5 px-6 text-base-content/90 font-medium">
                      {session['sitter-name']}
                    </td>

                    {/* Session Type */}
                    <td className="py-5 px-6">
                      <span className="bg-base-200 text-base-content/80 font-semibold text-sm px-3 py-1.5 rounded-full border border-base-300">
                        {session['session-type']}
                      </span>
                    </td>

                    {/* Created At */}
                    <td className="py-5 px-6 text-right text-base-content/60 font-mono text-base">
                      {formatTime(session['created-at'])}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

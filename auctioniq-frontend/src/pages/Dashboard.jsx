import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Quick Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [playersRes, reportsRes] = await Promise.all([
          api.get('/players'),
          api.get('/saved-reports')
        ]);
        setPlayers(playersRes.data);
        setReports(reportsRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle Search Input Change
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const filtered = players.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5); // limit to top 5 matches
    setSearchResults(filtered);
  }, [searchQuery, players]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  // Calculate statistics
  const totalPlayers = players.length;
  const avgRating = totalPlayers > 0 
    ? (players.reduce((sum, p) => sum + p.rating, 0) / totalPlayers).toFixed(2) 
    : '0.00';
  
  const topRatedPlayer = totalPlayers > 0
    ? [...players].sort((a, b) => b.rating - a.rating)[0]
    : null;
    
  const totalValue = players.reduce((sum, p) => sum + (p.soldPrice || 0), 0).toFixed(2);

  return (
    <div className="space-y-8 font-sans">
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-r from-primary-600 to-blue-700 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Decorative pattern */}
        <div className="absolute right-0 bottom-0 opacity-15 pointer-events-none">
          <svg className="w-64 h-64 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/></svg>
        </div>
        <div className="relative z-10 space-y-2">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Scouting & Intelligence Hub</h1>
          <p className="text-sm md:text-base text-primary-100 max-w-xl">
            Analyze player profiles, compare head-to-head metrics, and generate AI-powered decision intelligence reports to build your championship franchise.
          </p>
        </div>
      </div>

      {/* QUICK SEARCH */}
      <div className="relative max-w-2xl mx-auto">
        <div className="flex items-center bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-md px-4 py-3.5 gap-3 focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all">
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            type="text"
            placeholder="Quick search player by name (e.g. Virat Kohli, Bumrah...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent focus:outline-none dark:text-white placeholder-slate-400 text-sm"
          />
        </div>
        {/* Results Autocomplete */}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-xl z-20 overflow-hidden divide-y divide-slate-100 dark:divide-dark-border">
            {searchResults.map(p => (
              <div
                key={p.id}
                onClick={() => navigate(`/players/${p.id}`)}
                className="px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer flex justify-between items-center transition-colors"
              >
                <div>
                  <h4 className="font-semibold text-sm dark:text-white">{p.name}</h4>
                  <p className="text-xs text-slate-400">{p.role} • {p.iplTeam} • {p.country}</p>
                </div>
                <div className="bg-primary-500/10 text-primary-500 px-2 py-0.5 rounded-md text-xs font-bold">
                  Rating: {p.rating}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* STATISTICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Players Card */}
        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Scouted Pool</p>
            <h3 className="text-2xl font-bold dark:text-white mt-0.5">{totalPlayers} Players</h3>
          </div>
        </div>

        {/* Avg Rating Card */}
        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-500/10 text-green-500 rounded-xl">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Average Rating</p>
            <h3 className="text-2xl font-bold dark:text-white mt-0.5">{avgRating} / 10</h3>
          </div>
        </div>

        {/* Top Rated Card */}
        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-400 font-medium">Spearhead Star</p>
            <h3 className="text-lg font-bold dark:text-white truncate mt-0.5" title={topRatedPlayer?.name}>
              {topRatedPlayer ? topRatedPlayer.name : 'N/A'}
            </h3>
          </div>
        </div>

        {/* Total Market Value Card */}
        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Active Cap Space</p>
            <h3 className="text-2xl font-bold dark:text-white mt-0.5">₹{totalValue} Cr</h3>
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT: RECENT REPORTS & PLATFORM TIP */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RECENT REPORTS LIST */}
        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-6 shadow-sm lg:col-span-2 space-y-5">
          <div className="flex justify-between items-center pb-2">
            <h3 className="font-bold text-lg dark:text-white">Recent AI Scouting Reports</h3>
            <Link to="/saved-reports" className="text-primary-500 hover:underline text-sm font-semibold">View All</Link>
          </div>

          {reports.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-200 dark:border-dark-border rounded-xl">
              <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              <p className="text-sm text-slate-400">No reports generated yet.</p>
              <p className="text-xs text-slate-500 mt-1">Navigate to Player Directory and click "Generate AI Report" to create one.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.slice(0, 3).map(r => {
                let rec = "Scout analysis ready.";
                try {
                  const content = JSON.parse(r.reportContent);
                  rec = content.auctionRecommendation || rec;
                } catch(e) {}
                
                return (
                  <div key={r.id} className="p-4 border border-slate-100 dark:border-dark-border rounded-xl flex justify-between items-start hover:border-primary-500 dark:hover:border-primary-500/50 transition-colors">
                    <div>
                      <h4 className="font-semibold text-sm dark:text-white">{r.player.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{r.player.role} • {r.player.iplTeam}</p>
                      <p className="text-xs text-slate-500 mt-2 italic line-clamp-1">"{rec}"</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-[10px] text-slate-400">
                        {new Date(r.generatedAt).toLocaleDateString()}
                      </span>
                      <Link
                        to={`/saved-reports`}
                        className="text-xs text-primary-500 font-bold hover:underline"
                      >
                        Read Report
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* DECISION INTELLIGENCE TIP */}
        <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-primary-500/20 text-primary-400 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="font-bold text-lg tracking-wide">AI Assistant Tip</h3>
            <p className="text-xs leading-relaxed text-slate-400">
              You can ask the AuctionIQ AI Assistant floating widget questions directly like:
            </p>
            <ul className="text-xs space-y-2 text-primary-300 font-medium">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                "Should RCB buy KL Rahul?"
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                "Suggest a finisher under 10 crore."
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                "Compare Bumrah and Starc."
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                "Build the best XI under 80 crore."
              </li>
            </ul>
          </div>
          <button
            onClick={() => {
              // Open floating assistant widget automatically
              const ev = new CustomEvent('open-ai-chat');
              window.dispatchEvent(ev);
            }}
            className="w-full mt-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            Ask Assistant
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

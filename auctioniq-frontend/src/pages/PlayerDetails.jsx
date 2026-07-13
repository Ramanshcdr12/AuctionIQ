import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const PlayerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // AI report states
  const [reportLoading, setReportLoading] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [reportError, setReportError] = useState('');

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const response = await api.get(`/players/${id}`);
        setPlayer(response.data);
      } catch (error) {
        console.error("Error fetching player details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayer();
  }, [id]);

  const handleGenerateReport = async () => {
    setReportLoading(true);
    setReportError('');
    try {
      const response = await api.post('/ai/report', { playerId: id });
      const parsedReport = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
      setGeneratedReport(parsedReport);
      setTimeout(() => {
        document.getElementById('scouting-report')?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } catch (error) {
      console.error("Error generating report:", error);
      setReportError("Failed to generate AI report. Please ensure your backend is active.");
    } finally {
      setReportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="text-center py-20 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl">
        <h3 className="font-bold text-lg dark:text-white">Player Not Found</h3>
        <button onClick={() => navigate('/players')} className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-xl">Back to Directory</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* HEADER CARD */}
      <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-primary-500/10 text-primary-500 flex items-center justify-center font-black text-2xl shadow-inner">
            {player.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold dark:text-white leading-tight">{player.name}</h1>
              <span className="bg-primary-500/10 text-primary-500 px-2 py-0.5 rounded text-xs font-bold">
                Rating: {player.rating}
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1">{player.role} • {player.country} • Team: <span className="font-semibold text-amber-500">{player.iplTeam}</span></p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 dark:border-dark-border">
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Base Price</p>
            <p className="font-bold text-lg text-slate-700 dark:text-slate-200">₹{player.basePrice} Cr</p>
          </div>
          {player.soldPrice > 0 && (
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold text-amber-500">Auction Price</p>
              <p className="font-bold text-lg text-amber-500">₹{player.soldPrice} Cr</p>
            </div>
          )}
          <button
            onClick={handleGenerateReport}
            disabled={reportLoading}
            className="px-5 py-3 bg-gradient-to-r from-primary-500 to-blue-600 hover:from-primary-600 hover:to-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-primary-500/20 flex items-center gap-2"
          >
            {reportLoading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            ) : (
              <svg className="w-4 h-4 text-primary-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
            )}
            Generate AI Scouting Report
          </button>
        </div>
      </div>

      {/* REPORT ERRORS */}
      {reportError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <span>{reportError}</span>
        </div>
      )}

      {/* TABS CONTAINER */}
      <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl overflow-hidden shadow-sm">
        <div className="border-b border-slate-100 dark:border-dark-border flex">
          {['overview', 'batting', 'bowling'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-semibold capitalize border-b-2 transition-all ${
                activeTab === tab
                  ? 'border-primary-500 text-primary-500 bg-primary-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab === 'overview' ? 'Overview' : tab === 'batting' ? 'Batting Stats' : 'Bowling Stats'}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="font-bold text-base dark:text-white pb-2 border-b border-slate-100 dark:border-dark-border">Bio & Information</h3>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-slate-50 dark:border-dark-border/50"><td className="py-2.5 text-slate-400">Playing Role</td><td className="py-2.5 font-semibold dark:text-white">{player.role}</td></tr>
                    <tr className="border-b border-slate-50 dark:border-dark-border/50"><td className="py-2.5 text-slate-400">Batting Style</td><td className="py-2.5 font-semibold dark:text-white">{player.battingStyle}</td></tr>
                    <tr className="border-b border-slate-50 dark:border-dark-border/50"><td className="py-2.5 text-slate-400">Bowling Style</td><td className="py-2.5 font-semibold dark:text-white">{player.bowlingStyle}</td></tr>
                    <tr><td className="py-2.5 text-slate-400">Country</td><td className="py-2.5 font-semibold dark:text-white">{player.country}</td></tr>
                  </tbody>
                </table>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-base dark:text-white pb-2 border-b border-slate-100 dark:border-dark-border">Career Performance Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                    <p className="text-xs text-slate-400 font-medium">Matches</p>
                    <p className="text-xl font-bold dark:text-white mt-1">{player.matchesPlayed}</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                    <p className="text-xs text-slate-400 font-medium">Total Runs</p>
                    <p className="text-xl font-bold dark:text-white mt-1">{player.runsScored > 0 ? player.runsScored : '0'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                    <p className="text-xs text-slate-400 font-medium">Wickets Taken</p>
                    <p className="text-xl font-bold dark:text-white mt-1">{player.wicketsTaken > 0 ? player.wicketsTaken : '0'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                    <p className="text-xs text-slate-400 font-medium">Overall Rating</p>
                    <p className="text-xl font-bold text-primary-500 mt-1">{player.rating} / 10</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'batting' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                  <p className="text-xs text-slate-400">Matches</p>
                  <p className="text-lg font-bold dark:text-white mt-1">{player.matchesPlayed}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                  <p className="text-xs text-slate-400">Runs Scored</p>
                  <p className="text-lg font-bold dark:text-white mt-1">{player.runsScored > 0 ? player.runsScored : '0'}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                  <p className="text-xs text-slate-400">Batting Average</p>
                  <p className="text-lg font-bold dark:text-white mt-1">{player.battingAverage > 0 ? player.battingAverage : 'N/A'}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                  <p className="text-xs text-slate-400">Strike Rate</p>
                  <p className="text-lg font-bold dark:text-white mt-1">{player.strikeRate > 0 ? player.strikeRate : 'N/A'}</p>
                </div>
              </div>
              <div className="p-4 border border-slate-100 dark:border-dark-border rounded-xl">
                <p className="text-xs text-slate-400 uppercase font-semibold">Batting Profile</p>
                <p className="text-sm font-semibold dark:text-white mt-1.5">{player.name} is a **{player.battingStyle}** player, specializing in {player.role.toLowerCase()} operations.</p>
              </div>
            </div>
          )}

          {activeTab === 'bowling' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                  <p className="text-xs text-slate-400">Wickets</p>
                  <p className="text-lg font-bold dark:text-white mt-1">{player.wicketsTaken > 0 ? player.wicketsTaken : '0'}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                  <p className="text-xs text-slate-400">Bowling Average</p>
                  <p className="text-lg font-bold dark:text-white mt-1">{player.bowlingAverage > 0 ? player.bowlingAverage : 'N/A'}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                  <p className="text-xs text-slate-400">Economy Rate</p>
                  <p className="text-lg font-bold dark:text-white mt-1">{player.economyRate > 0 ? player.economyRate : 'N/A'}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                  <p className="text-xs text-slate-400">Overs Bowled</p>
                  <p className="text-lg font-bold dark:text-white mt-1">{player.oversBowled > 0 ? player.oversBowled : '0'}</p>
                </div>
              </div>
              <div className="p-4 border border-slate-100 dark:border-dark-border rounded-xl">
                <p className="text-xs text-slate-400 uppercase font-semibold">Bowling Profile</p>
                <p className="text-sm font-semibold dark:text-white mt-1.5">{player.name} specializes in **{player.bowlingStyle}** bowling with career workload of {player.oversBowled} overs.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI REPORT BLOCK */}
      {generatedReport && (
        <div id="scouting-report" className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-800 space-y-6 animate-fade-in">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="p-2 bg-primary-500/20 text-primary-400 rounded-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-wide">AI Scouting Evaluation Report</h2>
              <p className="text-xs text-slate-400">Generated in real-time by AuctionIQ Decision Engine</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Strengths */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase font-bold text-primary-400 tracking-wider">Key Strengths</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                {generatedReport.strengths?.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0"></span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase font-bold text-red-400 tracking-wider">Identified Weaknesses</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                {generatedReport.weaknesses?.map((w, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0"></span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-slate-800">
            {/* Playing Role */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
              <h5 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Analytical Role</h5>
              <p className="text-sm font-semibold text-white mt-1.5">{generatedReport.playingRole}</p>
            </div>

            {/* Suggested Max Bid */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
              <h5 className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">Suggested Max Bid</h5>
              <p className="text-sm font-semibold text-white mt-1.5">{generatedReport.suggestedMaxBid}</p>
            </div>

            {/* Best Team Fit */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl sm:col-span-2 lg:col-span-1">
              <h5 className="text-[10px] uppercase font-bold text-primary-400 tracking-wider">Best Franchise Fit</h5>
              <p className="text-sm font-semibold text-white mt-1.5">{generatedReport.bestTeamFit}</p>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800 text-sm text-slate-300">
            <div>
              <h5 className="text-[10px] uppercase font-bold text-primary-400 tracking-wider mb-1">Auction Recommendation</h5>
              <p className="leading-relaxed">{generatedReport.auctionRecommendation}</p>
            </div>
            <div>
              <h5 className="text-[10px] uppercase font-bold text-red-400 tracking-wider mb-1">Risk Analysis</h5>
              <p className="leading-relaxed">{generatedReport.riskAnalysis}</p>
            </div>
            <div>
              <h5 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Similar Profiles</h5>
              <p className="leading-relaxed font-semibold text-white">
                {Array.isArray(generatedReport.similarPlayers) ? generatedReport.similarPlayers.join(', ') : generatedReport.similarPlayers}
              </p>
            </div>
            <div>
              <h5 className="text-[10px] uppercase font-bold text-green-400 tracking-wider mb-1">Future Potential</h5>
              <p className="leading-relaxed">{generatedReport.futurePotential}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerDetails;

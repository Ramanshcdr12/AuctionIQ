import React, { useState, useEffect } from 'react';
import api from '../services/api';

const SavedReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeReport, setActiveReport] = useState(null); // Report selected to view details

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await api.get('/saved-reports');
      setReports(response.data);
    } catch (error) {
      console.error("Error loading saved reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    try {
      await api.delete(`/saved-reports/${id}`);
      setReports(prev => prev.filter(r => r.id !== id));
      if (activeReport?.id === id) {
        setActiveReport(null);
      }
    } catch (error) {
      console.error("Error deleting report:", error);
    }
  };

  if (loading && reports.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-bold dark:text-white">Saved Scouting Reports</h1>
        <p className="text-sm text-slate-400">Manage and review all AI-generated scouting evaluations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LIST OF REPORTS */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-bold text-base dark:text-white pb-2 border-b border-slate-100 dark:border-dark-border">Generated Reports</h3>
          
          {reports.length === 0 ? (
            <div className="text-center py-10 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl">
              <svg className="w-10 h-10 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <p className="text-xs text-slate-400">No saved reports found.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {reports.map(r => {
                const isSelected = activeReport?.id === r.id;
                let recommendation = "Report generated.";
                try {
                  const data = JSON.parse(r.reportContent);
                  recommendation = data.auctionRecommendation || recommendation;
                } catch(e) {}

                return (
                  <div
                    key={r.id}
                    onClick={() => setActiveReport(r)}
                    className={`p-4 border rounded-xl cursor-pointer transition-all flex flex-col justify-between hover:shadow-sm ${
                      isSelected
                        ? 'border-primary-500 bg-primary-500/5 dark:bg-primary-500/10'
                        : 'border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-sm dark:text-white">{r.player.name}</h4>
                        <span className="text-[10px] text-slate-400">{new Date(r.generatedAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{r.player.role} • {r.player.iplTeam}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 italic">"{recommendation}"</p>
                    </div>

                    <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-dark-border">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                        title="Delete Report"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* REPORT CONTENT VIEWER */}
        <div className="lg:col-span-2">
          {activeReport ? (
            (() => {
              let parsedReport = {};
              try {
                parsedReport = typeof activeReport.reportContent === 'string' ? JSON.parse(activeReport.reportContent) : activeReport.reportContent;
              } catch (e) {
                return (
                  <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-3xl p-8 text-center text-red-500">
                    Error parsing report content.
                  </div>
                );
              }

              return (
                <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 border border-slate-800 shadow-xl space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary-500/20 text-primary-400 rounded-xl">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </div>
                      <div>
                        <h2 className="text-lg font-bold tracking-wide">Scouting Report: {activeReport.player.name}</h2>
                        <p className="text-xs text-slate-400">Scouted on {new Date(activeReport.generatedAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Strengths */}
                    <div className="space-y-3">
                      <h4 className="text-xs uppercase font-bold text-primary-400 tracking-wider">Key Strengths</h4>
                      <ul className="space-y-2 text-sm text-slate-300">
                        {parsedReport.strengths?.map((s, idx) => (
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
                        {parsedReport.weaknesses?.map((w, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0"></span>
                            <span>{w}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-800">
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                      <h5 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Scout Role</h5>
                      <p className="text-sm font-semibold text-white mt-1.5">{parsedReport.playingRole}</p>
                    </div>
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                      <h5 className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">Max Bid Advice</h5>
                      <p className="text-sm font-semibold text-white mt-1.5">{parsedReport.suggestedMaxBid}</p>
                    </div>
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                      <h5 className="text-[10px] uppercase font-bold text-primary-400 tracking-wider">Franchise Fit</h5>
                      <p className="text-sm font-semibold text-white mt-1.5">{parsedReport.bestTeamFit}</p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-800 text-sm text-slate-300">
                    <div>
                      <h5 className="text-[10px] uppercase font-bold text-primary-400 tracking-wider mb-1">Auction Recommendation</h5>
                      <p className="leading-relaxed">{parsedReport.auctionRecommendation}</p>
                    </div>
                    <div>
                      <h5 className="text-[10px] uppercase font-bold text-red-400 tracking-wider mb-1">Risk Analysis</h5>
                      <p className="leading-relaxed">{parsedReport.riskAnalysis}</p>
                    </div>
                    <div>
                      <h5 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Similar Players</h5>
                      <p className="leading-relaxed font-semibold text-white">
                        {Array.isArray(parsedReport.similarPlayers) ? parsedReport.similarPlayers.join(', ') : parsedReport.similarPlayers}
                      </p>
                    </div>
                    <div>
                      <h5 className="text-[10px] uppercase font-bold text-green-400 tracking-wider mb-1">Future Potential</h5>
                      <p className="leading-relaxed">{parsedReport.futurePotential}</p>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="h-full min-h-[350px] flex flex-col items-center justify-center bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-3xl p-8 text-center text-slate-400">
              <svg className="w-16 h-16 text-slate-300 mb-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
              <h3 className="font-bold text-lg dark:text-white mb-1">No Report Selected</h3>
              <p className="text-xs">Click on any scouting card on the left panel to expand the evaluation details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedReports;

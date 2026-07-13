import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ComparePlayers = () => {
  const [playersList, setPlayersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected player IDs
  const [p1Id, setP1Id] = useState('');
  const [p2Id, setP2Id] = useState('');

  // Loaded player details
  const [player1, setPlayer1] = useState(null);
  const [player2, setPlayer2] = useState(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await api.get('/players');
        setPlayersList(response.data);
        // Set default comparison if we have players
        if (response.data.length >= 2) {
          setP1Id(response.data[0].id);
          setP2Id(response.data[1].id);
        }
      } catch (error) {
        console.error("Error loading players list:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayers();
  }, []);

  // Fetch comparison data when IDs change
  useEffect(() => {
    if (!p1Id || !p2Id) return;
    const fetchComparison = async () => {
      setComparisonLoading(true);
      try {
        const response = await api.get(`/compare?player1Id=${p1Id}&player2Id=${p2Id}`);
        setPlayer1(response.data[0]);
        setPlayer2(response.data[1]);
      } catch (error) {
        console.error("Error running player comparison:", error);
      } finally {
        setComparisonLoading(false);
      }
    };
    fetchComparison();
  }, [p1Id, p2Id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  // Utility to determine winner of a metric (higher is better)
  const getWinnerClass = (val1, val2, lowerIsBetter = false) => {
    if (val1 === undefined || val2 === undefined || val1 === null || val2 === null) return '';
    if (val1 === val2) return '';
    const isP1Winner = lowerIsBetter ? val1 < val2 : val1 > val2;
    return isP1Winner;
  };

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-bold dark:text-white">Compare Players</h1>
        <p className="text-sm text-slate-400">Select two players to compare their statistics side-by-side.</p>
      </div>

      {/* SELECTORS HEADER */}
      <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-5 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Selector 1 */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Player 1</label>
          <select
            value={p1Id}
            onChange={(e) => setP1Id(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900 focus:outline-none focus:border-primary-500 text-sm dark:text-white"
          >
            {playersList.map(p => (
              <option key={p.id} value={p.id} disabled={p.id == p2Id}>{p.name} ({p.role})</option>
            ))}
          </select>
        </div>

        {/* Selector 2 */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Player 2</label>
          <select
            value={p2Id}
            onChange={(e) => setP2Id(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900 focus:outline-none focus:border-primary-500 text-sm dark:text-white"
          >
            {playersList.map(p => (
              <option key={p.id} value={p.id} disabled={p.id == p1Id}>{p.name} ({p.role})</option>
            ))}
          </select>
        </div>
      </div>

      {/* COMPARISON RESULTS SCREEN */}
      {comparisonLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
        </div>
      ) : player1 && player2 ? (
        <div className="space-y-6">
          {/* OVERALL SUMMARY HEADER */}
          <div className="grid grid-cols-3 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-6 shadow-sm text-center items-center">
            {/* Player 1 Card */}
            <div>
              <h3 className="font-extrabold text-lg md:text-xl dark:text-white">{player1.name}</h3>
              <p className="text-xs text-slate-400 mt-1">{player1.role} • {player1.iplTeam}</p>
              <div className="mt-3 inline-block bg-primary-500/10 text-primary-500 font-bold px-3 py-1 rounded-xl text-xs md:text-sm">
                Rating: {player1.rating}
              </div>
            </div>

            {/* VS */}
            <div className="flex flex-col items-center">
              <span className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-400 flex items-center justify-center text-xs font-bold border border-slate-200 dark:border-dark-border shadow-inner">
                VS
              </span>
            </div>

            {/* Player 2 Card */}
            <div>
              <h3 className="font-extrabold text-lg md:text-xl dark:text-white">{player2.name}</h3>
              <p className="text-xs text-slate-400 mt-1">{player2.role} • {player2.iplTeam}</p>
              <div className="mt-3 inline-block bg-primary-500/10 text-primary-500 font-bold px-3 py-1 rounded-xl text-xs md:text-sm">
                Rating: {player2.rating}
              </div>
            </div>
          </div>

          {/* HEAD-TO-HEAD DETAILED STATS TABLE */}
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-dark-border">
              <h3 className="font-bold text-base dark:text-white">Key Performance Indicators (KPIs)</h3>
            </div>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/40 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-100 dark:border-dark-border">
                  <th className="py-4 px-6">Metric Category</th>
                  <th className="py-4 px-6 text-center">{player1.name}</th>
                  <th className="py-4 px-6 text-center">{player2.name}</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100 dark:divide-dark-border">
                {/* BIO */}
                <tr>
                  <td className="py-4 px-6 text-slate-400 font-medium">Playing Country</td>
                  <td className="py-4 px-6 text-center dark:text-white font-semibold">{player1.country}</td>
                  <td className="py-4 px-6 text-center dark:text-white font-semibold">{player2.country}</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-slate-400 font-medium">Batting Hand</td>
                  <td className="py-4 px-6 text-center dark:text-white font-semibold">{player1.battingStyle}</td>
                  <td className="py-4 px-6 text-center dark:text-white font-semibold">{player2.battingStyle}</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-slate-400 font-medium">Bowling Style</td>
                  <td className="py-4 px-6 text-center dark:text-white font-semibold">{player1.bowlingStyle}</td>
                  <td className="py-4 px-6 text-center dark:text-white font-semibold">{player2.bowlingStyle}</td>
                </tr>

                {/* BATTING COMP */}
                <tr className="bg-slate-50/50 dark:bg-slate-900/10">
                  <td className="py-4 px-6 font-bold text-primary-500" colSpan="3">Batting Analytics</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-slate-400 font-medium">IPL Matches Played</td>
                  <td className={`py-4 px-6 text-center font-bold ${getWinnerClass(player1.matchesPlayed, player2.matchesPlayed) === true ? 'text-green-500' : 'dark:text-white'}`}>
                    {player1.matchesPlayed}
                  </td>
                  <td className={`py-4 px-6 text-center font-bold ${getWinnerClass(player1.matchesPlayed, player2.matchesPlayed) === false ? 'text-green-500' : 'dark:text-white'}`}>
                    {player2.matchesPlayed}
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-slate-400 font-medium">Total Runs Scored</td>
                  <td className={`py-4 px-6 text-center font-bold ${getWinnerClass(player1.runsScored, player2.runsScored) === true ? 'text-green-500' : 'dark:text-white'}`}>
                    {player1.runsScored || 0}
                  </td>
                  <td className={`py-4 px-6 text-center font-bold ${getWinnerClass(player1.runsScored, player2.runsScored) === false ? 'text-green-500' : 'dark:text-white'}`}>
                    {player2.runsScored || 0}
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-slate-400 font-medium">Batting Average</td>
                  <td className={`py-4 px-6 text-center font-bold ${getWinnerClass(player1.battingAverage, player2.battingAverage) === true ? 'text-green-500' : 'dark:text-white'}`}>
                    {player1.battingAverage || 'N/A'}
                  </td>
                  <td className={`py-4 px-6 text-center font-bold ${getWinnerClass(player1.battingAverage, player2.battingAverage) === false ? 'text-green-500' : 'dark:text-white'}`}>
                    {player2.battingAverage || 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-slate-400 font-medium">Strike Rate</td>
                  <td className={`py-4 px-6 text-center font-bold ${getWinnerClass(player1.strikeRate, player2.strikeRate) === true ? 'text-green-500' : 'dark:text-white'}`}>
                    {player1.strikeRate || 'N/A'}
                  </td>
                  <td className={`py-4 px-6 text-center font-bold ${getWinnerClass(player1.strikeRate, player2.strikeRate) === false ? 'text-green-500' : 'dark:text-white'}`}>
                    {player2.strikeRate || 'N/A'}
                  </td>
                </tr>

                {/* BOWLING COMP */}
                <tr className="bg-slate-50/50 dark:bg-slate-900/10">
                  <td className="py-4 px-6 font-bold text-primary-500" colSpan="3">Bowling Analytics</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-slate-400 font-medium">Total Wickets Taken</td>
                  <td className={`py-4 px-6 text-center font-bold ${getWinnerClass(player1.wicketsTaken, player2.wicketsTaken) === true ? 'text-green-500' : 'dark:text-white'}`}>
                    {player1.wicketsTaken || 0}
                  </td>
                  <td className={`py-4 px-6 text-center font-bold ${getWinnerClass(player1.wicketsTaken, player2.wicketsTaken) === false ? 'text-green-500' : 'dark:text-white'}`}>
                    {player2.wicketsTaken || 0}
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-slate-400 font-medium">Bowling Average</td>
                  <td className={`py-4 px-6 text-center font-bold ${player1.wicketsTaken > 0 && player2.wicketsTaken > 0 && getWinnerClass(player1.bowlingAverage, player2.bowlingAverage, true) === true ? 'text-green-500' : 'dark:text-white'}`}>
                    {player1.bowlingAverage || 'N/A'}
                  </td>
                  <td className={`py-4 px-6 text-center font-bold ${player1.wicketsTaken > 0 && player2.wicketsTaken > 0 && getWinnerClass(player1.bowlingAverage, player2.bowlingAverage, true) === false ? 'text-green-500' : 'dark:text-white'}`}>
                    {player2.bowlingAverage || 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-slate-400 font-medium">Economy Rate</td>
                  <td className={`py-4 px-6 text-center font-bold ${player1.economyRate > 0 && player2.economyRate > 0 && getWinnerClass(player1.economyRate, player2.economyRate, true) === true ? 'text-green-500' : 'dark:text-white'}`}>
                    {player1.economyRate || 'N/A'}
                  </td>
                  <td className={`py-4 px-6 text-center font-bold ${player1.economyRate > 0 && player2.economyRate > 0 && getWinnerClass(player1.economyRate, player2.economyRate, true) === false ? 'text-green-500' : 'dark:text-white'}`}>
                    {player2.economyRate || 'N/A'}
                  </td>
                </tr>

                {/* AUCTION COMP */}
                <tr className="bg-slate-50/50 dark:bg-slate-900/10">
                  <td className="py-4 px-6 font-bold text-primary-500" colSpan="3">Market Valuation</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-slate-400 font-medium">Base Price</td>
                  <td className="py-4 px-6 text-center dark:text-white font-semibold">₹{player1.basePrice} Cr</td>
                  <td className="py-4 px-6 text-center dark:text-white font-semibold">₹{player2.basePrice} Cr</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-slate-400 font-medium">Sold Price (Last Auction)</td>
                  <td className="py-4 px-6 text-center dark:text-white font-semibold">₹{player1.soldPrice || '0.00'} Cr</td>
                  <td className="py-4 px-6 text-center dark:text-white font-semibold">₹{player2.soldPrice || '0.00'} Cr</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl">
          <p className="text-slate-400 text-sm">Please select two different players to begin comparative analytics.</p>
        </div>
      )}
    </div>
  );
};

export default ComparePlayers;

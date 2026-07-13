import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const PlayerList = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [nameSearch, setNameSearch] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');

  // Dropdown metadata
  const [teams, setTeams] = useState([]);
  const [roles, setRoles] = useState([]);
  const [countries, setCountries] = useState([]);

  // Fetch filters metadata on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [teamsRes, rolesRes, countriesRes] = await Promise.all([
          api.get('/players/meta/teams'),
          api.get('/players/meta/roles'),
          api.get('/players/meta/countries')
        ]);
        setTeams(teamsRes.data);
        setRoles(rolesRes.data);
        setCountries(countriesRes.data);
      } catch (error) {
        console.error("Error fetching metadata:", error);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch players with active filters
  useEffect(() => {
    const fetchPlayers = async () => {
      setLoading(true);
      try {
        const params = {};
        if (nameSearch.trim()) params.name = nameSearch.trim();
        if (selectedTeam) params.team = selectedTeam;
        if (selectedRole) params.role = selectedRole;
        if (selectedCountry) params.country = selectedCountry;

        const response = await api.get('/players', { params });
        setPlayers(response.data);
      } catch (error) {
        console.error("Error fetching players:", error);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchPlayers();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [nameSearch, selectedTeam, selectedRole, selectedCountry]);

  const handleResetFilters = () => {
    setNameSearch('');
    setSelectedTeam('');
    setSelectedRole('');
    setSelectedCountry('');
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Player Directory</h1>
          <p className="text-sm text-slate-400">Search and filter through the {players.length} scouted players.</p>
        </div>
        <button
          onClick={handleResetFilters}
          className="px-4 py-2 border border-slate-200 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold transition-all self-start sm:self-center"
        >
          Reset Filters
        </button>
      </div>

      {/* FILTER BAR PANEL */}
      <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-5 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Name Search */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Search Name</label>
          <input
            type="text"
            placeholder="Search by player name..."
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900 focus:outline-none focus:border-primary-500 text-sm dark:text-white placeholder-slate-400"
          />
        </div>

        {/* Team Filter */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">IPL Franchise</label>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900 focus:outline-none focus:border-primary-500 text-sm dark:text-white"
          >
            <option value="">All Franchises</option>
            {teams.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Role Filter */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Playing Role</label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900 focus:outline-none focus:border-primary-500 text-sm dark:text-white"
          >
            <option value="">All Roles</option>
            {roles.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Country Filter */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Country</label>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900 focus:outline-none focus:border-primary-500 text-sm dark:text-white"
          >
            <option value="">All Countries</option>
            {countries.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* PLAYERS LIST GRID */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
        </div>
      ) : players.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-200 dark:border-dark-border rounded-2xl bg-white dark:bg-dark-card">
          <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <h3 className="font-bold text-lg dark:text-white">No Players Found</h3>
          <p className="text-slate-400 text-sm mt-1">Try adjusting your filters or search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {players.map(p => (
            <div
              key={p.id}
              className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl overflow-hidden hover:shadow-lg transition-all group flex flex-col justify-between"
            >
              {/* Header card info */}
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-3">
                  <span className="bg-primary-500/10 text-primary-500 px-2.5 py-1 rounded-lg text-xs font-bold">
                    Rating: {p.rating}
                  </span>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                    p.iplTeam === 'Unsold' 
                      ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' 
                      : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {p.iplTeam}
                  </span>
                </div>

                <h3 className="font-bold text-lg dark:text-white group-hover:text-primary-500 transition-colors">{p.name}</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">{p.role} • {p.country}</p>

                {/* Micro Statistics */}
                <div className="grid grid-cols-2 gap-4 mt-5 py-3 border-t border-b border-slate-100 dark:border-dark-border text-xs">
                  <div>
                    <p className="text-slate-400">Runs</p>
                    <p className="font-bold dark:text-white text-sm mt-0.5">{p.runsScored > 0 ? p.runsScored : '0'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Wickets</p>
                    <p className="font-bold dark:text-white text-sm mt-0.5">{p.wicketsTaken > 0 ? p.wicketsTaken : '0'}</p>
                  </div>
                </div>
              </div>

              {/* Bottom Bid Info & Actions */}
              <div className="p-5 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-dark-border flex justify-between items-center gap-3">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Base Price</p>
                  <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">₹{p.basePrice} Cr</p>
                </div>
                <button
                  onClick={() => navigate(`/players/${p.id}`)}
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-primary-500/15"
                >
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlayerList;

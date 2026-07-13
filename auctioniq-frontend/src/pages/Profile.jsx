import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateProfile } = useAuth();

  const [email, setEmail] = useState(user?.email || '');
  const [favoriteTeam, setFavoriteTeam] = useState(user?.favoriteTeam || 'RCB');
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const teams = [
    { code: 'RCB', name: 'Royal Challengers Bengaluru' },
    { code: 'CSK', name: 'Chennai Super Kings' },
    { code: 'MI', name: 'Mumbai Indians' },
    { code: 'KKR', name: 'Kolkata Knight Riders' },
    { code: 'SRH', name: 'Sunrisers Hyderabad' },
    { code: 'GT', name: 'Gujarat Titans' },
    { code: 'LSG', name: 'Lucknow Super Giants' },
    { code: 'DC', name: 'Delhi Capitals' },
    { code: 'RR', name: 'Rajasthan Royals' },
    { code: 'PBKS', name: 'Punjab Kings' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }

    setMessage('');
    setError('');
    setLoading(true);

    const res = await updateProfile(email, favoriteTeam);
    if (res.success) {
      setMessage('Profile updated successfully!');
    } else {
      setError(res.error);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-bold dark:text-white">Scout Profile Settings</h1>
        <p className="text-sm text-slate-400">Manage your account information and app preferences.</p>
      </div>

      <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-6 shadow-sm space-y-6">
        {/* Messages */}
        {message && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-500 px-4 py-3 rounded-xl text-sm flex items-center gap-3">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{message}</span>
          </div>
        )}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-3">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <span>{error}</span>
          </div>
        )}

        {/* Scout Bio Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-dark-border">
          <div className="w-14 h-14 rounded-2xl bg-primary-500 text-white font-extrabold text-xl flex items-center justify-center">
            {user?.username ? user.username.substring(0,2).toUpperCase() : 'SC'}
          </div>
          <div>
            <h3 className="font-bold text-lg dark:text-white">{user?.username}</h3>
            <p className="text-xs text-slate-400 capitalize">{user?.role ? user.role.replace('ROLE_', '').toLowerCase() : 'scout'} • Level 1 Analyst</p>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Username</label>
            <input
              type="text"
              value={user?.username || ''}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-100 dark:bg-slate-900/50 cursor-not-allowed text-slate-400 text-sm focus:outline-none"
              disabled
            />
            <p className="text-[10px] text-slate-400 mt-1.5">Usernames are unique and cannot be modified.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900 focus:outline-none focus:border-primary-500 text-sm dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Favorite Franchise</label>
            <select
              value={favoriteTeam}
              onChange={(e) => setFavoriteTeam(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900 focus:outline-none focus:border-primary-500 text-sm dark:text-white"
            >
              {teams.map(t => (
                <option key={t.code} value={t.code}>{t.name}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-md shadow-primary-500/15 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;

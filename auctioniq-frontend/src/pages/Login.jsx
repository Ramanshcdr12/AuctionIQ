import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);

    const res = await login(username, password);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 relative overflow-hidden font-sans">
      {/* Decorative gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-10 shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary-500 text-white p-3 rounded-2xl mb-4 shadow-lg shadow-primary-500/20">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wide">Welcome to AuctionIQ</h2>
          <p className="text-sm text-slate-400 mt-1">IPL Scouting & Decision Platform</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-3">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 focus:outline-none focus:border-primary-500 text-white placeholder-slate-600 transition-all text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 focus:outline-none focus:border-primary-500 text-white placeholder-slate-600 transition-all text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-all mt-2 shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="text-center mt-8 pt-6 border-t border-slate-800">
          <p className="text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-400 hover:underline font-semibold transition-all">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Theme Management
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Mobile sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // AI Chat Widget states
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: `Hi ${user?.username || 'Scout'}! I am AuctionIQ Bot. Ask me anything about player comparisons, auction recommendations, or squad building.` }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const handleOpenChat = () => setChatOpen(true);
    window.addEventListener('open-ai-chat', handleOpenChat);
    return () => window.removeEventListener('open-ai-chat', handleOpenChat);
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, chatOpen]);

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await api.post('/ai/chat', { message: userText });
      setChatMessages(prev => [...prev, { sender: 'ai', text: response.data.response }]);
    } catch (error) {
      console.error("Chat error:", error);
      setChatMessages(prev => [...prev, { sender: 'ai', text: "Error connecting to AI Assistant. Please check if backend is running." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" /></svg>
    )},
    { name: 'Player Directory', path: '/players', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
    )},
    { name: 'Compare Analytics', path: '/compare', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
    )},
    { name: 'Scouting Reports', path: '/saved-reports', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
    )},
    { name: 'My Profile', path: '/profile', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
    )}
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-dark-bg dark:text-dark-text flex">
      {/* SIDEBAR FOR DESKTOP */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-dark-card border-r border-slate-200 dark:border-dark-border">
        <div className="p-6 border-b border-slate-200 dark:border-dark-border flex items-center gap-3">
          <div className="bg-primary-500 text-white p-2 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-wide text-primary-500">AuctionIQ</h1>
            <p className="text-xs text-slate-400">IPL Scouting Platform</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-dark-border">
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* MOBILE SIDEBAR MODAL */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-slate-950/60 backdrop-blur-sm">
          <div className="w-64 bg-white dark:bg-dark-card p-6 flex flex-col h-full animate-slide-in">
            <div className="flex justify-between items-center pb-6 border-b border-slate-200 dark:border-dark-border">
              <span className="font-bold text-xl text-primary-500">AuctionIQ</span>
              <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <nav className="flex-1 py-6 space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary-500 text-white shadow-lg'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* HEADER / NAVBAR */}
        <header className="h-16 bg-white dark:bg-dark-card border-b border-slate-200 dark:border-dark-border px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="p-2 md:hidden rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h2 className="font-semibold text-lg hidden sm:block">
              {navItems.find(item => item.path === location.pathname)?.name || 'AuctionIQ Analytics'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-all"
              title="Toggle Theme"
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>

            {/* Quick Scout Info */}
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-dark-border">
              <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-sm">
                {user?.username ? user.username.substring(0, 2).toUpperCase() : 'SC'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold leading-tight">{user?.username || 'Chief Scout'}</p>
                <p className="text-xs text-slate-400 leading-none capitalize">{user?.role ? user.role.replace('ROLE_', '').toLowerCase() : 'scout'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN ROUTE CONTENT */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>

      {/* FLOATING AI CHAT WIDGET */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
        {/* Chat Window Overlay */}
        {chatOpen && (
          <div className="w-80 md:w-96 h-[480px] bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-2xl flex flex-col mb-4 overflow-hidden transition-all duration-300">
            {/* Header */}
            <div className="p-4 bg-primary-500 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-white/20 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div>
                  <h3 className="font-bold text-sm">AuctionIQ AI Assistant</h3>
                  <span className="text-xs text-primary-100 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Offline/Online Intelligent Mode
                  </span>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Messages Content */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 dark:bg-slate-900/50">
              {chatMessages.map((m, idx) => (
                <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                    m.sender === 'user'
                      ? 'bg-primary-500 text-white rounded-tr-none'
                      : 'bg-white dark:bg-dark-card text-slate-800 dark:text-dark-text border border-slate-200 dark:border-dark-border rounded-tl-none'
                  }`}>
                    {m.sender === 'ai' ? (
                      <div className="whitespace-pre-line leading-relaxed markdown-style">
                        {m.text}
                      </div>
                    ) : (
                      <p>{m.text}</p>
                    )}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-dark-card text-slate-500 dark:text-slate-400 rounded-2xl rounded-tl-none px-4 py-3 text-sm border border-slate-200 dark:border-dark-border flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                    <span>AI is calculating...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendChatMessage} className="p-3 border-t border-slate-200 dark:border-dark-border flex gap-2 bg-white dark:bg-dark-card">
              <input
                type="text"
                placeholder="Ask about KL Rahul, finisher under 10cr..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900 focus:outline-none focus:border-primary-500 dark:focus:border-primary-500 dark:text-white"
              />
              <button
                type="submit"
                disabled={chatLoading || !chatInput.trim()}
                className="p-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-xl transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </button>
            </form>
          </div>
        )}

        {/* Float Circle Toggle Button */}
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="p-4 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-2xl shadow-primary-500/30 flex items-center justify-center transition-all transform hover:scale-105 active:scale-95"
        >
          {chatOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <div className="relative">
              <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-green-400 border border-white dark:border-slate-900"></span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default DashboardLayout;

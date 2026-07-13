import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PlayerList from './pages/PlayerList';
import PlayerDetails from './pages/PlayerDetails';
import ComparePlayers from './pages/ComparePlayers';
import SavedReports from './pages/SavedReports';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Main Routes wrapped in DashboardLayout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/players"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <PlayerList />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/players/:id"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <PlayerDetails />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/compare"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ComparePlayers />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/saved-reports"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SavedReports />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Profile />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

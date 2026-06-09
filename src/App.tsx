import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import DriverDashboard from './pages/DriverDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import api from './api';
import { User } from './types';
import LoadingSpinner from './components/LoadingSpinner';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('ecotrack_theme') as 'light' | 'dark') || 'light';
  });

  // Synchronize authenticated user profile on application startup
  const syncUserSession = async () => {
    const token = localStorage.getItem('ecotrack_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.data.user);
      } else {
        localStorage.removeItem('ecotrack_token');
        localStorage.removeItem('ecotrack_user');
      }
    } catch (err) {
      console.warn('Session sync failed. Token might be stale.');
      localStorage.removeItem('ecotrack_token');
      localStorage.removeItem('ecotrack_user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncUserSession();
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('ecotrack_theme', theme);
  }, [theme]);

  const handleLoginSuccess = (loggedInUser: User, token: string) => {
    localStorage.setItem('ecotrack_token', token);
    localStorage.setItem('ecotrack_user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('ecotrack_token');
    localStorage.removeItem('ecotrack_user');
    setUser(null);
    toast.success('Successfully logged out.');
  };

  const refreshUserProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.data.user);
      }
    } catch (err) {
      console.error('Failed to sync updated wallet/profile metrics.', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center transition-colors">
        <LoadingSpinner message="Checking Kathmandu municipality session status..." />
      </div>
    );
  }

  // Helper route guards
  const UserGuard = ({ children }: { children: React.ReactNode }) => {
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'user') return <Navigate to="/" replace />;
    return <>{children}</>;
  };

  const DriverGuard = ({ children }: { children: React.ReactNode }) => {
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'driver') return <Navigate to="/" replace />;
    return <>{children}</>;
  };

  const AdminGuard = ({ children }: { children: React.ReactNode }) => {
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'admin') return <Navigate to="/" replace />;
    return <>{children}</>;
  };

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-slate-50/50 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#064e3b',
              color: '#fff',
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif',
            },
            success: {
              iconTheme: {
                primary: '#34d399',
                secondary: '#064e40',
              },
            },
          }}
        />

        <Navbar
          user={user}
          onLogout={handleLogout}
          theme={theme}
          onToggleTheme={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
        />

        <main className="flex-grow">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            <Routes>
            {/* Public Entry Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            
            <Route
              path="/login"
              element={
                user ? (
                  <Navigate
                    to={
                      user.role === 'admin'
                        ? '/admin/dashboard'
                        : user.role === 'driver'
                        ? '/driver/dashboard'
                        : '/dashboard'
                    }
                    replace
                  />
                ) : (
                  <LoginPage onLoginSuccess={handleLoginSuccess} />
                )
              }
            />
            
            <Route
              path="/register"
              element={
                user ? (
                  <Navigate
                    to={
                      user.role === 'driver'
                        ? '/driver/dashboard'
                        : '/dashboard'
                    }
                    replace
                  />
                ) : (
                  <RegisterPage onRegisterSuccess={handleLoginSuccess} />
                )
              }
            />

            {/* CITIZEN ROLES (USER only) */}
            <Route
              path="/dashboard"
              element={
                <UserGuard>
                  <UserDashboard user={user} onRefreshUser={refreshUserProfile} />
                </UserGuard>
              }
            />
            <Route
              path="/create-report"
              element={
                <UserGuard>
                  <UserDashboard user={user} onRefreshUser={refreshUserProfile} />
                </UserGuard>
              }
            />
            <Route
              path="/my-reports"
              element={
                <UserGuard>
                  <UserDashboard user={user} onRefreshUser={refreshUserProfile} />
                </UserGuard>
              }
            />
            <Route
              path="/collection-history"
              element={
                <UserGuard>
                  <UserDashboard user={user} onRefreshUser={refreshUserProfile} />
                </UserGuard>
              }
            />

            {/* DRIVER ROLES (DRIVER only) */}
            <Route
              path="/driver/dashboard"
              element={
                <DriverGuard>
                  <DriverDashboard user={user} />
                </DriverGuard>
              }
            />
            <Route
              path="/driver/collections"
              element={
                <DriverGuard>
                  <DriverDashboard user={user} />
                </DriverGuard>
              }
            />
            <Route
              path="/driver/history"
              element={
                <DriverGuard>
                  <DriverDashboard user={user} />
                </DriverGuard>
              }
            />

            {/* EXECUTIVE ADMINISTRATIVE ROLES (ADMIN only) */}
            <Route
              path="/admin/dashboard"
              element={
                <AdminGuard>
                  <AdminDashboard />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <AdminGuard>
                  <AdminDashboard />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/collections"
              element={
                <AdminGuard>
                  <AdminDashboard />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminGuard>
                  <AdminDashboard />
                </AdminGuard>
              }
            />

            {/* Wildcard Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

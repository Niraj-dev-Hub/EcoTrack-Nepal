import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowRight, ShieldAlert, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../api';
import { User } from '../types';

interface LoginResponse {
  token: string;
  user: User;
}

interface LoginPageProps {
  onLoginSuccess: (user: User, token: string) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      toast.error('Session expired. Please sign in again.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/login', { email, password });
      
      if (res.data.success) {
        const { token, user } = res.data.data as LoginResponse;
        onLoginSuccess(user, token);
        toast.success(`Welcome back, ${user.name}!`);
        
        // Redirect dynamically based on user role
        if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (user.role === 'driver') {
          navigate('/driver/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setErrorMsg(res.data.message || 'Authorization failed.');
        toast.error(res.data.message || 'Login failed.');
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Invalid email or password credentials.';
      setErrorMsg(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-gray-150 dark:border-slate-800 shadow-xl shadow-gray-100/40 dark:shadow-none transition-colors">
        <div>
          <div className="mx-auto h-12 w-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow shadow-emerald-200 dark:shadow-none">
            <LogIn className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Sign In to EcoTrack
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500 dark:text-slate-400">
            Or{' '}
            <Link to="/register" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-550 transition-colors">
              create a citizen/driver account
            </Link>
          </p>
        </div>

        {/* Toggle between Sign In / Create Account */}
        <div className="grid grid-cols-2 gap-2 bg-gray-50 dark:bg-slate-800 p-1.5 rounded-xl border border-gray-100 dark:border-slate-700">
          <button
            type="button"
            className="py-2 px-3 text-xs font-extrabold rounded-lg transition-all bg-emerald-600 text-white shadow"
          >
            Sign In (Existing User)
          </button>
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="py-2 px-3 text-xs font-extrabold rounded-lg transition-all text-gray-400 hover:text-gray-800 dark:hover:text-slate-200"
          >
            Create Account (New User)
          </button>
        </div>

        {errorMsg && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl p-4 flex gap-3 text-red-850 dark:text-red-300 text-sm">
            <ShieldAlert className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-semibold">Sign in failed</p>
              <p className="text-red-700/90 dark:text-red-400 mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Demo Accounts Assist */}
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/60 rounded-xl p-4 text-xs text-emerald-950 dark:text-emerald-300">
          <p className="font-bold mb-1 flex items-center gap-1">💡 Demo accounts (autoseeded):</p>
          <ul className="space-y-1 font-mono">
            <li>Admin: <span className="font-bold">admin@ecotrack.com</span> | <span className="font-bold">admin123</span></li>
            <li>Driver: <span className="font-bold">driver@ecotrack.com</span> | <span className="font-bold">driver123</span></li>
            <li>User: <span className="font-bold">user@ecotrack.com</span> | <span className="font-bold">user123</span></li>
          </ul>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-750 dark:text-slate-355 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 text-gray-900 dark:text-slate-100 text-sm transition-all outline-none"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-750 dark:text-slate-355 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 text-gray-900 dark:text-slate-100 text-sm transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-1.5 justify-center">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center gap-1.5 justify-center">
                  Sign In <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

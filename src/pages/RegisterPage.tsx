import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User as UserIcon, MapPin, Phone, ArrowRight, ShieldAlert } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../api';
import { User } from '../types';

interface RegisterResponse {
  token: string;
  user: User;
}

interface RegisterPageProps {
  onRegisterSuccess: (user: User, token: string) => void;
}

export default function RegisterPage({ onRegisterSuccess }: RegisterPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'driver'>('user');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name || !email || !password || !role) {
      toast.error('Please input all mandatory fields.');
      return;
    }

    if (name.trim().length < 3) {
      toast.error('Name must be at least 3 characters.');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/register', {
        name,
        email: email.toLowerCase(),
        password,
        role,
        address,
        phone
      });

      if (res.data.success) {
        const { token, user } = res.data.data as RegisterResponse;
        onRegisterSuccess(user, token);
        toast.success(`Account registered successfully! Welcome, ${user.name}`);
        
        if (user.role === 'driver') {
          navigate('/driver/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setErrorMsg(res.data.message || 'Registration failed.');
        toast.error(res.data.message || 'Registration failed.');
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Server reported issue registering your account.';
      setErrorMsg(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-gray-150 shadow-xl shadow-gray-100/40">
        <div>
          <div className="mx-auto h-12 w-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow shadow-emerald-200">
            <UserPlus className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
            Create an Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            Or{' '}
            <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors">
              sign in if you have one
            </Link>
          </p>
        </div>

        {/* Toggle between Sign In / Create Account */}
        <div className="grid grid-cols-2 gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="py-2 px-3 text-xs font-extrabold rounded-lg transition-all text-gray-500 hover:text-gray-800"
          >
            Sign In (Existing User)
          </button>
          <button
            type="button"
            className="py-2 px-3 text-xs font-extrabold rounded-lg transition-all bg-emerald-600 text-white shadow"
          >
            Create Account (New User)
          </button>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 text-red-800 text-sm">
            <ShieldAlert className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-semibold">Registration failed</p>
              <p className="text-red-700/90 mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Role Toggler Selection */}
        <div className="grid grid-cols-2 gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
          <button
            type="button"
            onClick={() => setRole('user')}
            className={`py-2 px-3 text-xs font-bold rounded-lg transition-all ${
              role === 'user'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Citizen (User)
          </button>
          <button
            type="button"
            onClick={() => setRole('driver')}
            className={`py-2 px-3 text-xs font-bold rounded-lg transition-all ${
              role === 'driver'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Waste Driver
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 text-gray-900 text-sm outline-none transition-all"
                placeholder="Sita Sharma"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 text-gray-900 text-sm outline-none transition-all"
                placeholder="sita@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 text-gray-900 text-sm outline-none transition-all"
                placeholder="At least 6 characters"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Address (Town/Ward)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 text-gray-900 text-sm outline-none transition-all"
                placeholder="Ward 5, New Baneshwor"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 text-gray-900 text-sm outline-none transition-all"
                placeholder="+977-984XXXXXXX"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-1.5 justify-center">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Registering...
                </span>
              ) : (
                <span className="flex items-center gap-1.5 justify-center">
                  Register Account <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

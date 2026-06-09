import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Leaf, 
  Wallet, 
  User as UserIcon, 
  LogOut, 
  LayoutDashboard, 
  FileText, 
  ClipboardList, 
  History, 
  Users,
  Sun,
  Moon,
  Info,
  Phone
} from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function Navbar({ user, onLogout, theme, onToggleTheme }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoutClick = () => {
    onLogout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const linkClass = (path: string) =>
    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
      isActive(path)
        ? 'border-emerald-500 text-emerald-700 dark:text-emerald-400 dark:border-emerald-400'
        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'
    }`;

  const mobileLinkClass = (path: string) =>
    `block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200 ${
      isActive(path)
        ? 'bg-emerald-50/50 border-emerald-500 text-emerald-700 dark:bg-slate-800 dark:text-emerald-400'
        : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
    }`;

  return (
    <nav className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
              <div className="bg-emerald-500 p-2 rounded-xl text-white group-hover:scale-105 transition-transform duration-200 shadow-sm shadow-emerald-250">
                <Leaf className="h-5 w-5" />
              </div>
              <span className="font-sans font-bold text-lg tracking-tight text-gray-900 dark:text-white bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">
                EcoTrack <span className="text-gray-900 dark:text-emerald-400">Nepal</span>
              </span>
            </Link>
          </div>

          {/* Right Side: desktop nav + buttons */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:gap-4">
            {/* Desktop Navigation (moved right so links are right-aligned on laptops) */}
            <div className="hidden sm:flex sm:items-center sm:space-x-6 lg:space-x-8">
              {user?.role === 'user' && (
                <Link to="/dashboard" className={linkClass('/dashboard')}>
                  <LayoutDashboard className="h-4 w-4 mr-1.5" /> Dashboard
                </Link>
              )}

              {user?.role === 'driver' && (
                <Link to="/driver/dashboard" className={linkClass('/driver/dashboard')}>
                  <LayoutDashboard className="h-4 w-4 mr-1.5" /> Driver Panel
                </Link>
              )}

              {user?.role === 'admin' && (
                <Link to="/admin/dashboard" className={linkClass('/admin/dashboard')}>
                  <LayoutDashboard className="h-4 w-4 mr-1.5" /> Analytics
                </Link>
              )}

              <Link to="/about" className={linkClass('/about')}>
                <Info className="h-4 w-4 mr-1.5" /> About
              </Link>
              <Link to="/contact" className={linkClass('/contact')}>
                <Phone className="h-4 w-4 mr-1.5" /> Contact
              </Link>
            </div>
            {/* Dark Mode Switcher Toggle */}
            <button
              onClick={onToggleTheme}
              id="theme-toggle"
              className="p-2 rounded-xl text-gray-500 hover:text-emerald-600 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-amber-400 dark:hover:bg-slate-800 transition-all duration-250 cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {user ? (
              <>
                {user.role === 'user' && (
                  <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950 px-3 py-1.5 rounded-full text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900 font-mono text-sm font-semibold">
                    <Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                    <span>Rs. {user.walletBalance.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-gray-700 dark:text-slate-300 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold">
                  <UserIcon className="h-3.5 w-3.5 text-gray-500 dark:text-slate-400" />
                  <span>{user.name} ({user.role})</span>
                </div>

                <button
                  onClick={handleLogoutClick}
                  className="inline-flex items-center justify-center p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:text-red-650 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200 cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-gray-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-medium text-sm px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow"
                >
                  Join Us
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu trigger */}
          <div className="-mr-2 flex items-center sm:hidden gap-2">
            {/* Mobile Mode Switcher Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl text-gray-500 hover:text-emerald-600 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-amber-400 dark:hover:bg-slate-800 transition-all duration-250 cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-gray-400 dark:text-slate-400 hover:text-gray-500 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 focus:outline-none transition-colors"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="sm:hidden bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800">
          <div className="pt-2 pb-3 space-y-1">
            {user ? (
              <>
                {user.role === 'user' && (
                  <>
                    <div className="px-4 py-2 flex items-center justify-between border-b border-gray-100 dark:border-slate-800 mb-2">
                      <span className="text-xs text-gray-400">Wallet Balance</span>
                      <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full text-emerald-800 dark:text-emerald-300 font-mono text-sm font-semibold">
                        <Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Rs. {user.walletBalance.toLocaleString()}</span>
                      </div>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className={mobileLinkClass('/dashboard')}
                    >
                      Dashboard
                    </Link>
                  </>
                )}

                {user.role === 'driver' && (
                  <>
                    <Link
                      to="/driver/dashboard"
                      onClick={() => setIsOpen(false)}
                      className={mobileLinkClass('/driver/dashboard')}
                    >
                      Driver Panel
                    </Link>
                  </>
                )}

                {user.role === 'admin' && (
                  <>
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setIsOpen(false)}
                      className={mobileLinkClass('/admin/dashboard')}
                    >
                      Analytics
                    </Link>
                  </>
                )}

                <div className="pt-4 pb-2 border-t border-gray-100 dark:border-slate-800">
                  <div className="flex items-center px-4 mb-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-800 dark:text-emerald-100 font-bold">
                        {user.name.charAt(0)}
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-800 dark:text-slate-200">{user.name}</div>
                      <div className="text-xs text-gray-500 dark:text-slate-400">{user.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogoutClick();
                    }}
                    className="w-full text-left block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-500 transition-colors cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="px-4 py-3 space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
                >
                  Join Us
                </Link>
              </div>
            )}

            <div className="pt-2 pb-2 border-t border-gray-100 dark:border-slate-800 space-y-1">
              <Link
                to="/about"
                onClick={() => setIsOpen(false)}
                className={mobileLinkClass('/about')}
              >
                About EcoTrack
              </Link>
              <Link
                to="/contact"
                onClick={() => setIsOpen(false)}
                className={mobileLinkClass('/contact')}
              >
                Contact Helpdesk
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

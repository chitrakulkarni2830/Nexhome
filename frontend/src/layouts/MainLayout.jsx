import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-blue-700 transition-colors">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-slate-900 tracking-tight">NexHome</span>
              </Link>
              
              {user && (
                <div className="hidden md:flex items-center gap-1">
                  <Link 
                    to="/dashboard" 
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location.pathname.includes('dashboard') 
                        ? 'bg-slate-100 text-slate-900' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Dashboard
                  </Link>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
                    <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-semibold">
                      U
                    </div>
                  </div>
                  <button 
                    onClick={handleLogout} 
                    className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md transition-colors border border-slate-200 hover:bg-slate-50"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link 
                    to="/login" 
                    className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2 transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link 
                    to="/register" 
                    className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg shadow-sm transition-all hover:shadow focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 outline-none"
                  >
                    Create account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-grow w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;

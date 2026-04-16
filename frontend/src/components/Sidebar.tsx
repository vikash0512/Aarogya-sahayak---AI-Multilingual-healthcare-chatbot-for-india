import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BriefcaseMedical, Home, MessageSquare, BookOpen, MapPin, History, Settings, X, LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const location = useLocation();
  const path = location.pathname;
  const { user, signOut } = useAuth();

  const navLinks = [
    { name: 'Home', path: '/dashboard', icon: Home },
    { name: 'Chat', path: '/chat', icon: MessageSquare },
    { name: 'Health Topics', path: '/topics', icon: BookOpen },
    { name: 'Nearby PHC', path: '/phc', icon: MapPin },
    { name: 'My History', path: '/history', icon: History },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 
        flex flex-col justify-between shrink-0 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        h-full
      `}>
        {/* Logo Section */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white shadow-sm shadow-blue-500/30">
              <BriefcaseMedical className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-slate-900 dark:text-white text-base font-bold leading-tight">Arogya Sahayak</h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Medical Dashboard</p>
            </div>
          </div>
          <button className="lg:hidden text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-lg" onClick={() => setIsOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = path === link.path || (path.startsWith('/article') && link.path === '/topics');
            return (
              <Link 
                key={link.name}
                to={link.path} 
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors group ${
                  isActive 
                    ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-400 border border-primary/10' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'fill-current' : 'group-hover:text-primary transition-colors'}`} />
                <span className={`text-sm ${isActive ? 'font-bold' : 'font-medium'}`}>{link.name}</span>
              </Link>
            );
          })}
        </nav>
        
        {/* Bottom Settings & User */}
        <div className="p-4 pt-0 space-y-2 shrink-0">
          <Link 
            to="/settings" 
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors mb-2 ${
              path === '/settings'
                ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-400 border border-primary/10' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Settings className={`w-5 h-5 ${path === '/settings' ? 'fill-current' : ''}`} />
            <span className={`text-sm ${path === '/settings' ? 'font-bold' : 'font-medium'}`}>Settings</span>
          </Link>
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex items-center justify-between gap-2">
            <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 w-full rounded-xl">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg shrink-0">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs text-slate-500 capitalize truncate">Premium Member</p>
                </div>
              </div>
            </div>
            <button 
              onClick={signOut}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors shrink-0"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

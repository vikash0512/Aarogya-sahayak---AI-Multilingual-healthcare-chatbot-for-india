import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BriefcaseMedical, LayoutDashboard, Users, BookOpen, UploadCloud, 
  Box, BrainCircuit, ShieldCheck, History, LogOut, X, Settings, Database, Smartphone
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile } from '../api';
import { getProfilePhotoUrlFromExtra } from '../utils/profilePhoto';

interface AdminSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function AdminSidebar({ isOpen, setIsOpen }: AdminSidebarProps) {
  const location = useLocation();
  const path = location.pathname;
  const { user, signOut } = useAuth();
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const profile = await getUserProfile();
        if (!mounted) return;
        setProfilePhotoUrl(getProfilePhotoUrlFromExtra(profile.extra_data));
      } catch {
        if (mounted) setProfilePhotoUrl('');
      }
    };

    if (user) {
      load();
    } else {
      setProfilePhotoUrl('');
    }

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const platformLinks = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Knowledge Base Manager', path: '/admin/knowledge', icon: BookOpen },
    { name: 'Document Ingestion', path: '/admin/ingestion', icon: UploadCloud },
  ];

  const aiConfigLinks = [
    { name: 'Vector Index', path: '/admin/vector', icon: Box },
    { name: 'LLM Config', path: '/admin/llm', icon: BrainCircuit },
    { name: 'Guardrails', path: '/admin/guardrails', icon: ShieldCheck },
    { name: 'Audit Logs', path: '/admin/audit', icon: History },
    { name: 'Supabase', path: '/admin/supabase', icon: Database },
    { name: 'WhatsApp API', path: '/admin/whatsapp', icon: Smartphone },
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
        flex flex-col h-full shrink-0 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo Area */}
        <div className="p-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg flex items-center justify-center text-primary">
              <BriefcaseMedical className="w-7 h-7" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-base font-bold leading-none text-slate-900 dark:text-white">Arogya Sahayak</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Admin Console</p>
            </div>
          </div>
          <button className="lg:hidden text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-lg" onClick={() => setIsOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-2">Platform</p>
          {platformLinks.map((link) => {
            const Icon = link.icon;
            const isActive = path === link.path;
            return (
              <Link 
                key={link.name}
                to={link.path} 
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                  isActive 
                    ? 'bg-primary/10 text-primary dark:text-blue-400' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'fill-current' : 'group-hover:text-primary transition-colors'}`} />
                <span className="text-sm font-medium">{link.name}</span>
              </Link>
            );
          })}

          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-6">AI Configuration</p>
          {aiConfigLinks.map((link) => {
            const Icon = link.icon;
            const isActive = path === link.path;
            return (
              <Link 
                key={link.name}
                to={link.path} 
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                  isActive 
                    ? 'bg-primary/10 text-primary dark:text-blue-400' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'fill-current' : 'group-hover:text-primary transition-colors'}`} />
                <span className="text-sm font-medium">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0 space-y-4">
          <Link 
            to="/admin/settings"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
              path === '/admin/settings'
                ? 'bg-primary/10 text-primary dark:text-blue-400' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Settings className={`w-5 h-5 ${path === '/admin/settings' ? 'fill-current' : 'group-hover:text-primary transition-colors'}`} />
            <span className="text-sm font-medium">Platform Settings</span>
          </Link>
          
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <div className="h-9 w-9 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold overflow-hidden shrink-0">
              {profilePhotoUrl ? (
                <img src={profilePhotoUrl} alt="Profile" className="w-full h-full object-cover rounded-full" loading="lazy" />
              ) : (
                <>{user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'A'}</>
              )}
            </div>
            <div className="flex flex-col flex-1 overflow-hidden min-w-0">
              <p className="text-sm font-medium truncate text-slate-900 dark:text-white">
                {user?.user_metadata?.full_name || 'Admin User'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate w-24" title={user?.email}>
                {user?.email}
              </p>
            </div>
            <button 
              onClick={signOut}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
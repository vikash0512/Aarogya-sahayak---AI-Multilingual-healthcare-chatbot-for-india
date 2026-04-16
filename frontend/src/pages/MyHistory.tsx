import React, { useState, useEffect } from 'react';
import { Link, useOutletContext, useNavigate } from 'react-router-dom';
import {
  BriefcaseMedical, Home, MessageSquare, BookOpen, MapPin, History,
  Settings, Menu, Search, Bell, ArrowRight, ShieldCheck, ExternalLink,
  Star, Info, ChevronLeft, ChevronRight, Bug, Thermometer, Droplets,
  MoreHorizontal, Sparkles, Pill
} from 'lucide-react';
import { LayoutContextType } from '../components/Layout';
import { getChatSessions } from '../api';

const historyData = [
  {
    id: 1,
    type: 'Consultations',
    title: 'Consultation: Seasonal Flu Symptoms',
    date: 'Oct 24, 2:30 PM',
    author: 'Dr. Rao',
    icon: BriefcaseMedical,
    iconBg: 'bg-blue-50 dark:bg-blue-900/20',
    iconColor: 'text-primary dark:text-blue-400',
    badges: [
      { text: 'Safety Score: 98%', color: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-900/30 dark:text-blue-400' },
      { text: 'Video Call', color: 'bg-slate-50 text-slate-600 ring-slate-500/20 dark:bg-slate-700 dark:text-slate-300' }
    ],
    actionText: 'View Details',
    actionIcon: ArrowRight
  },
  {
    id: 2,
    type: 'Symptoms Logged',
    title: 'Symptom Log: Migraine',
    date: 'Oct 20, 9:00 AM',
    author: 'Self-reported',
    icon: Thermometer,
    iconBg: 'bg-orange-50 dark:bg-orange-900/20',
    iconColor: 'text-orange-600 dark:text-orange-400',
    badges: [
      { text: 'Severity: Moderate', color: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20 dark:bg-yellow-900/30 dark:text-yellow-400' }
    ],
    actionText: 'View Details',
    actionIcon: ArrowRight
  },
  {
    id: 3,
    type: 'Saved Topics',
    title: 'Topic: Managing Blood Pressure',
    date: 'Oct 15, 4:45 PM',
    author: 'Saved Article',
    icon: BookOpen,
    iconBg: 'bg-purple-50 dark:bg-purple-900/20',
    iconColor: 'text-purple-600 dark:text-purple-400',
    badges: [
      { text: 'Hypertension', color: 'bg-slate-50 text-slate-600 ring-slate-500/20 dark:bg-slate-700 dark:text-slate-300' },
      { text: 'Diet', color: 'bg-slate-50 text-slate-600 ring-slate-500/20 dark:bg-slate-700 dark:text-slate-300' }
    ],
    actionText: 'Read Now',
    actionIcon: ExternalLink
  },
  {
    id: 4,
    type: 'Consultations',
    title: 'Vaccination: Annual Booster',
    date: 'Oct 05, 11:00 AM',
    author: 'City Hospital',
    icon: ShieldCheck,
    iconBg: 'bg-emerald-50 dark:bg-emerald-900/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    badges: [
      { text: 'Completed', color: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-400' }
    ],
    actionText: 'View Details',
    actionIcon: ArrowRight
  },
  {
    id: 5,
    type: 'Symptoms Logged',
    title: 'Symptom Log: Joint Pain',
    date: 'Sep 28, 8:15 AM',
    author: 'Self-reported',
    icon: Thermometer,
    iconBg: 'bg-orange-50 dark:bg-orange-900/20',
    iconColor: 'text-orange-600 dark:text-orange-400',
    badges: [
      { text: 'Severity: Mild', color: 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-900/30 dark:text-green-400' }
    ],
    actionText: 'View Details',
    actionIcon: ArrowRight
  },
  {
    id: 6,
    type: 'Saved Topics',
    title: 'Topic: Importance of Hydration',
    date: 'Sep 20, 2:30 PM',
    author: 'Saved Article',
    icon: BookOpen,
    iconBg: 'bg-purple-50 dark:bg-purple-900/20',
    iconColor: 'text-purple-600 dark:text-purple-400',
    badges: [
      { text: 'Wellness', color: 'bg-slate-50 text-slate-600 ring-slate-500/20 dark:bg-slate-700 dark:text-slate-300' }
    ],
    actionText: 'Read Now',
    actionIcon: ExternalLink
  }
];

export default function MyHistory() {
  const { toggleSidebar } = useOutletContext<LayoutContextType>();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  const [dbSessions, setDbSessions] = useState<any[]>([]);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const data = await getChatSessions();
      if (Array.isArray(data)) {
        setDbSessions(data);
      }
    } catch (err) {
      console.error('Failed to load sessions', err);
    }
  };

  const formattedSessions = dbSessions.map(session => ({
    id: session.id,
    type: 'Consultations',
    title: session.last_message ? `Chat: ${session.last_message.substring(0, 30)}...` : `Session ${session.id}`,
    date: new Date(session.created_at).toLocaleDateString() + ' ' + new Date(session.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    author: 'AI Health Assistant',
    icon: MessageSquare,
    iconBg: 'bg-blue-50 dark:bg-blue-900/20',
    iconColor: 'text-primary dark:text-blue-400',
    badges: [
      { text: `${session.message_count} messages`, color: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-900/30 dark:text-blue-400' }
    ],
    actionText: 'Resume Chat',
    actionIcon: ArrowRight,
    onClick: () => navigate('/chat', { state: { sessionId: session.id } })
  }));

  const allHistory = [...formattedSessions, ...historyData.filter(d => d.type !== 'Consultations')];

  const filteredHistory = allHistory.filter(item => 
    activeFilter === 'All' ? true : item.type === activeFilter
  );

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full bg-background-light dark:bg-background-dark">
        {/* Header */}
        <header className="flex-none px-6 md:px-8 py-6 md:py-8 border-b border-slate-200 dark:border-slate-800 bg-white/80 backdrop-blur-md dark:bg-slate-900/80 z-10 sticky top-0">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">My History</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl">Access your complete archive of past consultations, symptom logs, and personalized health insights.</p>
            </div>
            <button className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg" onClick={toggleSidebar}>
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden px-4 md:px-8 pb-8 pt-4 gap-8">
          {/* Left Column (History List) */}
          <div className="flex flex-[2] flex-col overflow-y-auto pr-2 scroll-smooth">
            {/* Filters */}
            <div className="sticky top-0 z-10 bg-background-light dark:bg-background-dark py-4 mb-2">
              <div className="flex flex-wrap gap-2">
                {['All', 'Consultations', 'Symptoms Logged', 'Saved Topics'].map(filter => (
                  <button 
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-5 py-2 rounded-full text-sm font-medium shadow-sm transition-all ${
                      activeFilter === filter 
                        ? 'bg-primary text-white hover:bg-primary-dark hover:scale-105' 
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* History Items */}
            <div className="flex flex-col gap-4 pb-12">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((item) => {
                  const Icon = item.icon;
                  const ActionIcon = item.actionIcon;
                  return (
                    <div key={item.id} className="group relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl bg-white dark:bg-slate-800 p-5 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md hover:border-primary/30 transition-all duration-300">
                      <div className="flex items-start gap-4">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${item.iconBg} ${item.iconColor}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <h3 className="text-base font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{item.title}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{item.date} • {item.author}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            {item.badges.map((badge, idx) => (
                              <span key={idx} className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${badge.color}`}>
                                {badge.text}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={item.onClick || undefined}
                        className="shrink-0 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-primary dark:text-blue-400 px-4 py-2 text-sm font-semibold transition-colors flex items-center gap-2 self-start sm:self-center mt-4 sm:mt-0"
                      >
                        <span>{item.actionText}</span>
                        <ActionIcon className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500 dark:text-slate-400">
                  <History className="w-12 h-12 mb-4 opacity-20" />
                  <p>No history found for this category.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (Sidebar Widgets) */}
          <div className="hidden xl:flex flex-1 flex-col gap-6 max-w-sm">
            {/* Monthly Summary Chart */}
            <div className="rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Monthly Summary</h3>
                <button className="text-slate-400 hover:text-primary">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
              
              {/* Bar Chart */}
              <div className="flex items-end gap-3 h-32 w-full mt-4 mb-2">
                <div className="flex-1 flex flex-col gap-2 items-center">
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-t-lg relative h-full flex items-end overflow-hidden group">
                    <div className="w-full bg-primary/40 h-[30%] group-hover:bg-primary/60 transition-all duration-500 rounded-t-lg"></div>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400">WK 1</span>
                </div>
                <div className="flex-1 flex flex-col gap-2 items-center">
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-t-lg relative h-full flex items-end overflow-hidden group">
                    <div className="w-full bg-primary/60 h-[55%] group-hover:bg-primary/80 transition-all duration-500 rounded-t-lg"></div>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400">WK 2</span>
                </div>
                <div className="flex-1 flex flex-col gap-2 items-center">
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-t-lg relative h-full flex items-end overflow-hidden group">
                    <div className="w-full bg-primary/30 h-[20%] group-hover:bg-primary/50 transition-all duration-500 rounded-t-lg"></div>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400">WK 3</span>
                </div>
                <div className="flex-1 flex flex-col gap-2 items-center">
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-t-lg relative h-full flex items-end overflow-hidden group">
                    <div className="w-full bg-primary h-[85%] group-hover:bg-primary/90 transition-all duration-500 rounded-t-lg"></div>
                  </div>
                  <span className="text-[10px] font-medium text-slate-900 dark:text-white font-bold">WK 4</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Total Activities</span>
                  <span className="font-bold text-slate-900 dark:text-white">{dbSessions.length + 5}</span>
                </div>
                <div className="flex justify-between items-center text-xs mt-2">
                  <span className="text-slate-500 dark:text-slate-400">Symptoms Logged</span>
                  <span className="font-bold text-slate-900 dark:text-white">5</span>
                </div>
              </div>
            </div>

            {/* Daily Health Tip */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900 to-slate-900 dark:from-slate-800 dark:to-black p-6 shadow-md text-white">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="w-24 h-24" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3 text-blue-300">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">Daily Health Tip</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-200">
                  Based on your recent <strong className="text-white">flu symptoms</strong>, ensure you stay hydrated and monitor your temperature twice a day. Rest is key to recovery.
                </p>
                <button className="mt-4 text-xs font-bold text-blue-300 hover:text-white transition-colors flex items-center gap-1">
                  VIEW MORE INSIGHTS <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Refill Card */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 flex items-center gap-4 hover:border-primary/30 transition-colors cursor-pointer group">
              <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-primary dark:text-blue-400">
                <Pill className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Need a refill?</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Order from Nearby PHC instantly.</p>
              </div>
              <button className="ml-auto rounded-full p-2 group-hover:bg-slate-100 dark:group-hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AdminLayoutContextType } from '../components/AdminLayout';
import { Menu, Bell, Users, MessageSquare, ShieldCheck, AlertTriangle, Activity, TrendingUp, TrendingDown, BarChart3, FileText, Loader2 } from 'lucide-react';
import { getDashboardStats } from '../api';

export default function AdminDashboard() {
  const { toggleSidebar } = useOutletContext<AdminLayoutContextType>();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      setStats({
        activeUsers: 0, queriesToday: 0, queriesYesterday: 0,
        avgConfidence: 0, flaggedResponses: 0, totalDocuments: 0,
        totalMessages: 0, queryTrend: [], topTopics: []
      });
    } finally { setLoading(false); }
  };

  if (loading) {
    return <main className="flex-1 flex items-center justify-center bg-background-light dark:bg-background-dark"><Loader2 className="w-8 h-8 animate-spin text-primary" /></main>;
  }

  const queryTrendChange = stats.queriesYesterday > 0 
    ? Math.round(((stats.queriesToday - stats.queriesYesterday) / stats.queriesYesterday) * 100) 
    : stats.queriesToday > 0 ? 100 : 0;

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark relative">
      <header className="h-16 px-6 md:px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button className="lg:hidden p-2 text-slate-500" onClick={toggleSidebar}><Menu className="w-6 h-6" /></button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h2>
            <p className="text-xs text-slate-500 hidden sm:block">Real-time system health & analytics.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadStats} className="px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">Refresh</button>
          <button className="relative p-2 text-slate-500 hover:text-primary rounded-full hover:bg-slate-50 dark:hover:bg-slate-800">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30"><Users className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.activeUsers}</p>
              <p className="text-xs text-slate-500 mt-1">Active Users (24h)</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30"><MessageSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /></div>
                {queryTrendChange !== 0 && (
                  <span className={`flex items-center gap-0.5 text-xs font-medium ${queryTrendChange > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {queryTrendChange > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(queryTrendChange)}%
                  </span>
                )}
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.queriesToday}</p>
              <p className="text-xs text-slate-500 mt-1">Queries Today</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-900/30"><ShieldCheck className="w-5 h-5 text-violet-600 dark:text-violet-400" /></div>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.avgConfidence}%</p>
              <p className="text-xs text-slate-500 mt-1">Avg. Confidence Score</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/30"><AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" /></div>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.flaggedResponses}</p>
              <p className="text-xs text-slate-500 mt-1">Flagged Responses</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Query Volume Trend */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary" /> Query Volume (7 Days)</h3>
              </div>
              <div className="flex items-end gap-3 h-40">
                {(stats.queryTrend || []).map((day: any, i: number) => {
                  const maxVal = Math.max(...(stats.queryTrend || []).map((d: any) => d.queries), 1);
                  const height = (day.queries / maxVal) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-[10px] font-medium text-slate-500">{day.queries}</span>
                      <div className="w-full rounded-t-md bg-primary/20 relative" style={{ height: `${Math.max(height, 4)}%` }}>
                        <div className="absolute inset-0 bg-primary rounded-t-md" style={{ opacity: 0.3 + (height / 150) }}></div>
                      </div>
                      <span className="text-[10px] text-slate-400">{day.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Topic Distribution */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2"><Activity className="w-5 h-5 text-primary" /> System Summary</h3>
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-300">Total Messages</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{stats.totalMessages}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2"><FileText className="w-4 h-4 text-slate-400" /> Indexed Documents</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{stats.totalDocuments}</span>
                </div>
                <hr className="border-slate-100 dark:border-slate-800" />
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Topic Focus</p>
                  {(stats.topTopics || []).map((topic: any, i: number) => (
                    <div key={i} className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-600 dark:text-slate-300">{topic.name}</span>
                        <span className="text-slate-500">{topic.value}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${topic.value}%`, backgroundColor: topic.color }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

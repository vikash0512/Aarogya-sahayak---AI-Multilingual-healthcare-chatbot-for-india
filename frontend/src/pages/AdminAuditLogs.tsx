import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AdminLayoutContextType } from '../components/AdminLayout';
import { Menu, Search, FileText, CheckCircle2, AlertTriangle, XCircle, Clock, Loader2 } from 'lucide-react';
import { getAuditLogs } from '../api';

export default function AdminAuditLogs() {
  const { toggleSidebar } = useOutletContext<AdminLayoutContextType>();
  const [searchTerm, setSearchTerm] = useState('');
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadLogs(); }, []);

  const loadLogs = async () => {
    try {
      const data = await getAuditLogs(searchTerm);
      setLogs(data);
    } catch (err) {} finally { setLoading(false); }
  };

  const handleSearch = () => { setLoading(true); loadLogs(); };

  const getStatusIcon = (status: string) => {
    if (status === 'Success') return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (status === 'Warning') return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark relative">
      <header className="h-16 px-6 md:px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" onClick={toggleSidebar}><Menu className="w-6 h-6" /></button>
          <div><h2 className="text-xl font-bold text-slate-900 dark:text-white">Audit Logs</h2>
            <p className="text-xs text-slate-500 hidden sm:block">System event logs and administrative actions.</p></div>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input type="text" placeholder="Search logs..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white outline-none text-sm shadow-sm" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            {loading ? (
              <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : logs.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No audit logs found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Timestamp</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Resource</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">IP</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {logs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 text-xs text-slate-500 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {log.timestamp}</td>
                        <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">{log.user}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{log.action}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{log.resource}</td>
                        <td className="px-6 py-4 text-xs text-slate-500 font-mono">{log.ip || '—'}</td>
                        <td className="px-6 py-4"><div className="flex items-center gap-1.5">{getStatusIcon(log.status)}<span className="text-xs font-medium">{log.status}</span></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
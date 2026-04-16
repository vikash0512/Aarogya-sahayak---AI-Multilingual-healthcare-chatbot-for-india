import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AdminLayoutContextType } from '../components/AdminLayout';
import { Menu, Search, Filter, FileText, CheckCircle2, Clock, AlertCircle, RefreshCw, Trash2, MoreVertical, Loader2 } from 'lucide-react';
import { getDocuments, deleteDocument, reindexDocument } from '../api';

export default function AdminKnowledgeBase() {
  const { toggleSidebar } = useOutletContext<AdminLayoutContextType>();
  const [searchTerm, setSearchTerm] = useState('');
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDocs(); }, []);

  const loadDocs = async () => {
    try {
      const data = await getDocuments();
      setDocs(data);
    } catch (err) {} finally { setLoading(false); }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This will also remove its vectors.`)) return;
    try {
      await deleteDocument(id);
      setDocs(prev => prev.filter(d => d.id !== String(id) && d.id !== id));
    } catch (err: any) { alert(err.message); }
  };

  const handleReindex = async (id: number) => {
    try {
      await reindexDocument(id);
      setDocs(prev => prev.map(d => (d.id === String(id) || d.id === id) ? { ...d, status: 'Processing' } : d));
      // Reload after delay
      setTimeout(loadDocs, 5000);
    } catch (err: any) { alert(err.message); }
  };

  const filtered = docs.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark relative">
      <header className="h-16 px-6 md:px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" onClick={toggleSidebar}><Menu className="w-6 h-6" /></button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Knowledge Base Manager</h2>
            <p className="text-xs text-slate-500 hidden sm:block">Manage ingested documents and vector chunks.</p>
          </div>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input type="text" placeholder="Search documents..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white outline-none text-sm shadow-sm" />
            </div>
            <button onClick={loadDocs} className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 text-sm font-medium shadow-sm">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            {loading ? (
              <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No documents found. Upload documents via the Ingestion page.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Document Name</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Chunks</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date Added</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {filtered.map(doc => (
                      <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4"><div className="flex items-center gap-3"><FileText className="w-5 h-5 text-slate-400" /><span className="text-sm font-medium text-slate-900 dark:text-white">{doc.name}</span></div></td>
                        <td className="px-6 py-4"><span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{doc.type}</span></td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{doc.chunks?.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                            doc.status === 'Indexed' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400' :
                            doc.status === 'Processing' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400' :
                            'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {doc.status === 'Indexed' && <CheckCircle2 className="w-3 h-3" />}
                            {doc.status === 'Processing' && <Clock className="w-3 h-3 animate-pulse" />}
                            {doc.status === 'Failed' && <AlertCircle className="w-3 h-3" />}
                            {doc.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">{doc.date}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleReindex(Number(doc.id))} className="p-1.5 text-slate-400 hover:text-primary transition-colors rounded-lg hover:bg-primary/10" title="Re-index"><RefreshCw className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(Number(doc.id), doc.name)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20" title="Delete"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
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
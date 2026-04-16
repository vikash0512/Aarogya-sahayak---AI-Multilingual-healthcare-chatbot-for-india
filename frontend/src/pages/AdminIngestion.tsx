import React, { useState, useRef, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AdminLayoutContextType } from '../components/AdminLayout';
import { 
  Menu, HelpCircle, Bell, UploadCloud, Sliders, 
  Bot, Activity, FileText, CheckCircle2, ChevronRight, Loader2, AlertCircle
} from 'lucide-react';
import { uploadDocument, processDocument, getDocumentStatus, getDocuments } from '../api';

export default function AdminIngestion() {
  const { toggleSidebar } = useOutletContext<AdminLayoutContextType>();
  const [chunkSize, setChunkSize] = useState(512);
  const [sourceLanguage, setSourceLanguage] = useState('English');
  const [sourceAuthority, setSourceAuthority] = useState('high');
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [currentDoc, setCurrentDoc] = useState<any>(null);
  const [completedDocs, setCompletedDocs] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadCompletedDocs();
  }, []);

  const loadCompletedDocs = async () => {
    try {
      const docs = await getDocuments();
      setCompletedDocs(docs.filter((d: any) => d.status === 'Indexed'));
    } catch (err) {}
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    setStatusMessage('Uploading file...');

    try {
      const result = await uploadDocument(file, chunkSize, sourceLanguage, sourceAuthority);
      setCurrentDoc({ id: result.id, name: file.name, status: 'uploaded' });
      setStatusMessage('File uploaded. Starting processing...');

      // Auto-start processing
      setProcessing(true);
      await processDocument(result.id);
      setStatusMessage('Processing started. Chunking and embedding...');

      // Poll for status
      const pollStatus = setInterval(async () => {
        try {
          const status = await getDocumentStatus(result.id);
          setCurrentDoc(status);
          if (status.status === 'indexed') {
            clearInterval(pollStatus);
            setProcessing(false);
            setStatusMessage(`✅ Successfully processed! ${status.chunks} chunks created.`);
            loadCompletedDocs();
          } else if (status.status === 'failed') {
            clearInterval(pollStatus);
            setProcessing(false);
            setError(`Processing failed: ${status.error}`);
          }
        } catch (err) {
          clearInterval(pollStatus);
        }
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark relative">
      <header className="h-16 px-6 md:px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" onClick={toggleSidebar}>
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Ingest New Medical Records</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Upload and process clinical documents for the knowledge base.</p>
          </div>
        </div>
        <button className="relative p-2 text-slate-500 hover:text-primary transition-colors rounded-full hover:bg-slate-50 dark:hover:bg-slate-800">
          <Bell className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-3xl mx-auto flex flex-col gap-6">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            {/* Upload Card */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-primary" />
                Document Upload
              </h3>
              <div 
                onClick={triggerUpload}
                className="group border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 rounded-xl p-10 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-4"
              >
                <div className="h-16 w-16 rounded-full bg-slate-50 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700 flex items-center justify-center shadow-sm transition-colors">
                  {uploading ? <Loader2 className="w-8 h-8 text-primary animate-spin" /> : <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-primary transition-colors" />}
                </div>
                <div className="space-y-1">
                  <p className="text-base font-semibold text-slate-900 dark:text-white">{uploading ? 'Uploading...' : 'Click to upload or drag and drop'}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">PDF, DOCX, JSON, or TXT (max. 25MB)</p>
                </div>
                <button className="mt-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  Browse Files
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.docx,.txt,.json,.csv" onChange={handleFileUpload} />
              </div>
            </div>

            {/* Configuration */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-primary" />
                Processing Configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Source Language</label>
                  <select value={sourceLanguage} onChange={(e) => setSourceLanguage(e.target.value)}
                    className="w-full h-11 pl-3 pr-10 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm bg-slate-50 dark:bg-slate-800 outline-none">
                    <option>English</option><option>Hindi</option><option>Bengali</option><option>Tamil</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Source Authority</label>
                  <select value={sourceAuthority} onChange={(e) => setSourceAuthority(e.target.value)}
                    className="w-full h-11 pl-3 pr-10 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm bg-slate-50 dark:bg-slate-800 outline-none">
                    <option value="high">Verified (High Trust)</option>
                    <option value="medium">External Partner (Medium)</option>
                    <option value="low">Public Domain (Low)</option>
                  </select>
                </div>
                <div className="md:col-span-2 pt-2 space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Chunk Size (Characters)</label>
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono font-medium text-slate-900 dark:text-white">{chunkSize}</span>
                  </div>
                  <input className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                    max="2048" min="128" step="128" type="range" value={chunkSize}
                    onChange={(e) => setChunkSize(Number(e.target.value))} />
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>128 (Granular)</span><span>1024 (Broad)</span><span>2048 (Max)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Status */}
        <aside className="w-full lg:w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col shrink-0 lg:h-full h-auto">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-slate-500" />
              Processing Status
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {statusMessage && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-sm text-primary font-medium">
                {processing && <Loader2 className="w-4 h-4 animate-spin inline mr-2" />}
                {statusMessage}
              </div>
            )}

            {currentDoc && (
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-start gap-3 mb-3">
                  <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-1.5 rounded">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{currentDoc.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{currentDoc.status} {currentDoc.chunks ? `• ${currentDoc.chunks} chunks` : ''}</p>
                  </div>
                </div>
                {processing && (
                  <div className="space-y-1.5">
                    <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-full rounded-full animate-pulse"></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Completed */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">Completed</h4>
              <div className="space-y-2">
                {completedDocs.length === 0 ? (
                  <p className="text-xs text-slate-400">No documents processed yet.</p>
                ) : completedDocs.map(doc => (
                  <div key={doc.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                    <CheckCircle2 className="text-green-500 w-5 h-5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-900 dark:text-white truncate">{doc.name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Success • {doc.chunks} chunks</p>
                    </div>
                    <ChevronRight className="text-slate-300 dark:text-slate-600 w-4 h-4" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AdminLayoutContextType } from '../components/AdminLayout';
import { 
  Menu, HelpCircle, Bell, Database, Server, 
  Settings2, Save, CheckCircle2, AlertCircle, Box, Layers, Loader2
} from 'lucide-react';
import { getVectorConfig, saveVectorConfig } from '../api';

export default function AdminVectorIndex() {
  const { toggleSidebar } = useOutletContext<AdminLayoutContextType>();
  const [provider, setProvider] = useState('chromadb');
  const [apiKey, setApiKey] = useState('');
  const [environment, setEnvironment] = useState('');
  const [indexName, setIndexName] = useState('arogya-medical-index');
  const [dimensions, setDimensions] = useState(384);
  const [distanceMetric, setDistanceMetric] = useState('cosine');
  const [topK, setTopK] = useState(5);
  const [similarityThreshold, setSimilarityThreshold] = useState(0.75);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await getVectorConfig();
      setProvider(data.provider || 'chromadb');
      setEnvironment(data.environment || '');
      setIndexName(data.index_name || 'arogya-medical-index');
      setDimensions(data.dimensions || 384);
      setDistanceMetric(data.distance_metric || 'cosine');
      setTopK(data.top_k || 5);
      setSimilarityThreshold(data.similarity_threshold || 0.75);
    } catch (err) {
      setError('Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const payload: any = {
        provider, environment, index_name: indexName,
        dimensions, distance_metric: distanceMetric,
        top_k: topK, similarity_threshold: similarityThreshold,
      };
      if (apiKey && !apiKey.includes('...')) {
        payload.api_key = apiKey;
      }
      await saveVectorConfig(payload);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center bg-background-light dark:bg-background-dark">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark relative">
      <header className="h-16 px-6 md:px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" onClick={toggleSidebar}>
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Vector Database Configuration</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Manage vector search index, dimensionality, and database connections.</p>
          </div>
        </div>
        <button className="relative p-2 text-slate-500 hover:text-primary transition-colors rounded-full hover:bg-slate-50 dark:hover:bg-slate-800">
          <Bell className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}
          
          {/* Provider Selection */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              Vector Database Provider
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { id: 'chromadb', label: 'ChromaDB', sub: 'Local (Default)', icon: Box, color: 'green' },
                { id: 'pgvector', label: 'Supabase (pgvector)', sub: 'PostgreSQL Database', icon: Database, color: 'emerald' },
                { id: 'pinecone', label: 'Pinecone', sub: 'Managed Cloud', icon: Box, color: 'blue' },
                { id: 'qdrant', label: 'Qdrant', sub: 'Open Source', icon: Layers, color: 'red' },
              ].map(p => (
                <div key={p.id} onClick={() => setProvider(p.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center gap-3 ${
                    provider === p.id ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
                  }`}>
                  <div className={`w-12 h-12 rounded-full bg-${p.color}-100 dark:bg-${p.color}-900/30 flex items-center justify-center text-${p.color}-600`}>
                    <p.icon className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-slate-900 dark:text-white">{p.label}</p>
                    <p className="text-xs text-slate-500">{p.sub}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {provider !== 'chromadb' && provider !== 'pgvector' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">API Key / Connection String</label>
                  <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter API key..."
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 outline-none font-mono text-sm" />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Environment / Region</label>
                  <input type="text" value={environment} onChange={(e) => setEnvironment(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Index Name</label>
                  <input type="text" value={indexName} onChange={(e) => setIndexName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none text-sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Index Configuration */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-primary" /> Index Parameters
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Vector Dimensions</label>
                <select value={dimensions} onChange={(e) => setDimensions(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none">
                  <option value={384}>384 (all-MiniLM-L6-v2 - Default)</option>
                  <option value={768}>768 (BioBERT / HuggingFace)</option>
                  <option value={1536}>1536 (OpenAI text-embedding-ada-002)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Distance Metric</label>
                <select value={distanceMetric} onChange={(e) => setDistanceMetric(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none">
                  <option value="cosine">Cosine Similarity</option>
                  <option value="l2">Euclidean Distance (L2)</option>
                  <option value="ip">Dot Product</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Top-K Retrieval</label>
                <input type="number" value={topK} min={1} max={20}
                  onChange={(e) => setTopK(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Similarity Threshold</label>
                <input type="number" value={similarityThreshold} step={0.05} min={0} max={1}
                  onChange={(e) => setSimilarityThreshold(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none" />
              </div>
            </div>
          </div>

          {/* Save */}
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <AlertCircle className="w-4 h-4" /> Re-indexing may be required if dimensions or metric change.
            </div>
            <button onClick={handleSave} disabled={saving}
              className={`px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                isSaved ? 'bg-green-500 text-white' : 'bg-primary hover:bg-primary-dark text-white shadow-sm shadow-primary/30'
              } disabled:opacity-50`}>
              {isSaved ? <><CheckCircle2 className="w-5 h-5" /> Saved</> : saving ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : <><Save className="w-5 h-5" /> Save Configuration</>}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

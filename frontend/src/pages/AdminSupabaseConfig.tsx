import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AdminLayoutContextType } from '../components/AdminLayout';
import { Menu, Database, Save, CheckCircle2, Loader2, AlertCircle, Link2, Key, Shield, TestTube2, Wifi, WifiOff } from 'lucide-react';
import { getSupabaseConfig, saveSupabaseConfig, testSupabaseConnection } from '../api';

export default function AdminSupabaseConfig() {
  const { toggleSidebar } = useOutletContext<AdminLayoutContextType>();
  const [projectUrl, setProjectUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [serviceKey, setServiceKey] = useState('');
  const [databaseUrl, setDatabaseUrl] = useState('');
  const [jwtSecret, setJwtSecret] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => { loadConfig(); }, []);

  const loadConfig = async () => {
    try {
      const data = await getSupabaseConfig();
      setProjectUrl(data.project_url || '');
      setAnonKey(data.anon_key || '');
      setServiceKey(data.service_key || '');
      setDatabaseUrl(data.database_url || '');
      setJwtSecret(data.jwt_secret || '');
      setIsConfigured(data.is_configured || false);
    } catch (err) { setError('Failed to load Supabase configuration'); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      await saveSupabaseConfig({
        project_url: projectUrl, anon_key: anonKey, service_key: serviceKey,
        database_url: databaseUrl, jwt_secret: jwtSecret,
      });
      setIsSaved(true); setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleTestConnection = async () => {
    setTesting(true); setTestResult(null); setError('');
    try {
      const result = await testSupabaseConnection();
      setTestResult(result);
      if (result.success) setIsConfigured(true);
    } catch (err: any) { setError(err.message); }
    finally { setTesting(false); }
  };

  if (loading) return <main className="flex-1 flex items-center justify-center bg-background-light dark:bg-background-dark"><Loader2 className="w-8 h-8 animate-spin text-primary" /></main>;

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark relative">
      <header className="h-16 px-6 md:px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" onClick={toggleSidebar}><Menu className="w-6 h-6" /></button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-500" /> Supabase Configuration
            </h2>
            <p className="text-xs text-slate-500 hidden sm:block">Configure your Supabase project for authentication and database.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isConfigured ? (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-medium">
              <Wifi className="w-3.5 h-3.5" /> Connected
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-full text-xs font-medium">
              <WifiOff className="w-3.5 h-3.5" /> Not Configured
            </span>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center gap-2 text-sm text-red-700 dark:text-red-400"><AlertCircle className="w-4 h-4" /> {error}</div>}

          {/* Info Banner */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 border border-emerald-200 dark:border-emerald-800/30 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-emerald-900 dark:text-emerald-300 mb-1">🔗 How to get your Supabase credentials</h3>
            <ol className="text-xs text-emerald-700 dark:text-emerald-400 space-y-1 list-decimal list-inside">
              <li>Go to <strong>supabase.com/dashboard</strong> and open your project</li>
              <li><strong>Project URL & Anon Key</strong>: Settings → API → Project URL & anon/public key</li>
              <li><strong>Service Key</strong>: Settings → API → service_role key (keep secret!)</li>
              <li><strong>Database URL</strong>: Settings → Database → Connection string → URI</li>
              <li><strong>JWT Secret</strong>: Settings → API → JWT Settings → JWT Secret</li>
            </ol>
          </div>

          {/* Project URL */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2"><Link2 className="w-5 h-5 text-primary" /> Project Connection</h3>
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Supabase Project URL</label>
                <input type="url" value={projectUrl} onChange={(e) => setProjectUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none text-sm"
                  placeholder="https://your-project-id.supabase.co" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Database Connection URL</label>
                <input type="password" value={databaseUrl} onChange={(e) => setDatabaseUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none text-sm font-mono"
                  placeholder="postgresql://postgres:password@host:6543/postgres" />
                <p className="text-xs text-slate-400">Found in Supabase → Settings → Database → Connection string</p>
              </div>
            </div>
          </div>

          {/* API Keys */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2"><Key className="w-5 h-5 text-amber-500" /> API Keys</h3>
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Anon / Public Key</label>
                <input type="password" value={anonKey} onChange={(e) => setAnonKey(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none text-sm font-mono"
                  placeholder="eyJhbGciOiJIUzI1NiIs..." />
                <p className="text-xs text-slate-400">Safe for client-side use. Used by the frontend.</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  Service Role Key <Shield className="w-3.5 h-3.5 text-red-400" />
                </label>
                <input type="password" value={serviceKey} onChange={(e) => setServiceKey(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none text-sm font-mono"
                  placeholder="eyJhbGciOiJIUzI1NiIs..." />
                <p className="text-xs text-red-400">⚠️ Keep this secret! Backend-only. Never expose to frontend.</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">JWT Secret</label>
                <input type="password" value={jwtSecret} onChange={(e) => setJwtSecret(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none text-sm font-mono"
                  placeholder="your-jwt-secret" />
                <p className="text-xs text-slate-400">Used to verify Supabase JWTs. Found in Settings → API → JWT Secret.</p>
              </div>
            </div>
          </div>

          {/* Test Results */}
          {testResult && (
            <div className={`rounded-xl border p-5 ${testResult.success ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30' : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30'}`}>
              <h4 className={`text-sm font-semibold mb-3 ${testResult.success ? 'text-emerald-800 dark:text-emerald-300' : 'text-red-800 dark:text-red-300'}`}>
                {testResult.success ? '✅ All connections successful!' : '❌ Connection test failed'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {Object.entries(testResult.results || {}).filter(([k]) => !k.endsWith('_error')).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 text-sm">
                    {value ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                    <span className="capitalize text-slate-700 dark:text-slate-300">{key}</span>
                    {(testResult.results as any)[`${key}_error`] && (
                      <span className="text-xs text-red-500 truncate max-w-[200px]">{(testResult.results as any)[`${key}_error`]}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-between">
            <button onClick={handleTestConnection} disabled={testing || !projectUrl}
              className="px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 text-sm border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50">
              {testing ? <><Loader2 className="w-4 h-4 animate-spin" /> Testing...</> : <><TestTube2 className="w-4 h-4" /> Test Connection</>}
            </button>
            <button onClick={handleSave} disabled={saving}
              className={`px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all text-sm ${
                isSaved ? 'bg-green-500 text-white' : 'bg-primary hover:bg-primary-dark text-white'} disabled:opacity-50`}>
              {isSaved ? <><CheckCircle2 className="w-5 h-5" /> Saved</> : saving ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : <><Save className="w-5 h-5" /> Save Configuration</>}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

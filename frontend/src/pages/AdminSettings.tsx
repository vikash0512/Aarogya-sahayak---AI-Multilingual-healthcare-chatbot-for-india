import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AdminLayoutContextType } from '../components/AdminLayout';
import { Menu, Bell, Settings, Globe, Mail, Database, Save, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { getSettings, saveSettings } from '../api';

export default function AdminSettings() {
  const { toggleSidebar } = useOutletContext<AdminLayoutContextType>();
  const [platformName, setPlatformName] = useState('Arogya Sahayak');
  const [supportEmail, setSupportEmail] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [rateLimitPerMinute, setRateLimitPerMinute] = useState(20);
  const [confidenceThreshold, setConfidenceThreshold] = useState(85);
  const [fallbackMessage, setFallbackMessage] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { loadConfig(); }, []);

  const loadConfig = async () => {
    try {
      const data = await getSettings();
      setPlatformName(data.platform_name || 'Arogya Sahayak');
      setSupportEmail(data.support_email || '');
      setMaintenanceMode(data.maintenance_mode ?? false);
      setRateLimitPerMinute(data.rate_limit_per_minute || 20);
      setConfidenceThreshold(data.confidence_threshold || 85);
      setFallbackMessage(data.fallback_message || '');
    } catch (err) { setError('Failed to load'); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      await saveSettings({
        platform_name: platformName, support_email: supportEmail,
        maintenance_mode: maintenanceMode, rate_limit_per_minute: rateLimitPerMinute,
        confidence_threshold: confidenceThreshold, fallback_message: fallbackMessage,
      });
      setIsSaved(true); setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  if (loading) return <main className="flex-1 flex items-center justify-center bg-background-light dark:bg-background-dark"><Loader2 className="w-8 h-8 animate-spin text-primary" /></main>;

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark relative">
      <header className="h-16 px-6 md:px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" onClick={toggleSidebar}><Menu className="w-6 h-6" /></button>
          <div><h2 className="text-xl font-bold text-slate-900 dark:text-white">Platform Settings</h2>
            <p className="text-xs text-slate-500 hidden sm:block">Configure general platform settings.</p></div>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center gap-2 text-sm text-red-700 dark:text-red-400"><AlertCircle className="w-4 h-4" /> {error}</div>}
          
          {/* General */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2"><Settings className="w-5 h-5 text-primary" /> General</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"><Globe className="w-4 h-4 text-slate-400" /> Platform Name</label>
                <input type="text" value={platformName} onChange={(e) => setPlatformName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" /> Support Email</label>
                <input type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Rate Limit (per minute)</label>
                <input type="number" value={rateLimitPerMinute} onChange={(e) => setRateLimitPerMinute(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Confidence Threshold (%)</label>
                <input type="number" value={confidenceThreshold} onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none text-sm" />
              </div>
              <div className="flex items-center justify-between md:col-span-2 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800/30">
                <div><p className="font-medium text-slate-900 dark:text-white text-sm">Maintenance Mode</p><p className="text-xs text-slate-500 mt-0.5">When enabled, users will see a maintenance page.</p></div>
                <button onClick={() => setMaintenanceMode(!maintenanceMode)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${maintenanceMode ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${maintenanceMode ? 'left-[22px]' : 'left-0.5'}`}></span>
                </button>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Fallback Message</label>
                <textarea rows={3} value={fallbackMessage} onChange={(e) => setFallbackMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white outline-none resize-y" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button onClick={handleSave} disabled={saving}
              className={`px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                isSaved ? 'bg-green-500 text-white' : 'bg-primary hover:bg-primary-dark text-white'} disabled:opacity-50`}>
              {isSaved ? <><CheckCircle2 className="w-5 h-5" /> Saved</> : saving ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : <><Save className="w-5 h-5" /> Save Settings</>}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
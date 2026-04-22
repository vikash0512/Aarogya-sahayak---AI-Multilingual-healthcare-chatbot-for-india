import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AdminLayoutContextType } from '../components/AdminLayout';
import { 
  Menu, HelpCircle, Bell, BrainCircuit, Key, 
  Settings2, Save, CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';
import { getLLMConfig, saveLLMConfig } from '../api';

export default function AdminLLMConfig() {
  const { toggleSidebar } = useOutletContext<AdminLayoutContextType>();
  const [temperature, setTemperature] = useState(0.7);
  const [provider, setProvider] = useState('gemini');
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('gemini-1.5-flash');
  const [maxTokens, setMaxTokens] = useState(2048);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await getLLMConfig();
      setProvider(data.provider || 'gemini');
      setApiKey(''); // API key is masked from backend
      setModelName(data.model_name || 'gemini-1.5-flash');
      setTemperature(data.temperature ?? 0.7);
      setMaxTokens(data.max_tokens || 2048);
      setSystemPrompt(data.system_prompt || '');
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
        provider,
        model_name: modelName,
        temperature,
        max_tokens: maxTokens,
        system_prompt: systemPrompt,
      };
      // Only send API key if user entered a new one
      if (apiKey && !apiKey.includes('...')) {
        payload.api_key = apiKey;
      }
      await saveLLMConfig(payload);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save configuration');
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
      {/* Header */}
      <header className="h-16 px-6 md:px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" onClick={toggleSidebar}>
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">LLM Configuration</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Manage AI models, API keys, and generation parameters.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-slate-500 hover:text-primary transition-colors rounded-full hover:bg-slate-50 dark:hover:bg-slate-800">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Provider Selection */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-primary" />
              AI Provider Settings
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div 
                onClick={() => { setProvider('gemini'); setModelName('gemini-2.5-flash'); }}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center gap-3 ${
                  provider === 'gemini' 
                    ? 'border-primary bg-primary/5 dark:bg-primary/10' 
                    : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-slate-900 dark:text-white">Google Gemini</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Recommended</p>
                </div>
              </div>
              
              <div 
                onClick={() => { setProvider('openai'); setModelName('gpt-4-turbo'); }}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center gap-3 ${
                  provider === 'openai' 
                    ? 'border-primary bg-primary/5 dark:bg-primary/10' 
                    : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-slate-900 dark:text-white">OpenAI</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">GPT-4 / GPT-3.5</p>
                </div>
              </div>

              <div 
                onClick={() => { setProvider('local'); setModelName('llama-3-8b-instruct'); }}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center gap-3 ${
                  provider === 'local' 
                    ? 'border-primary bg-primary/5 dark:bg-primary/10' 
                    : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-slate-900 dark:text-white">Local / Custom</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Ollama / vLLM</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Key className="w-4 h-4 text-slate-400" />
                  {provider === 'local' ? 'LM Studio Base URL / API Key (optional)' : 'API Key'}
                </label>
                <input 
                  type={provider === 'local' ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={provider === 'local' ? 'http://localhost:1234/v1 (recommended)' : 'Enter your API key...'}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none font-mono text-sm"
                />
                {provider === 'local' ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    For LM Studio, you can leave this empty (defaults to <span className="font-mono">http://localhost:1234/v1</span>). If you paste a URL here, the backend treats it as the local server base URL.
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400">Your API key is encrypted and stored securely. Leave empty to keep existing key.</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Model Selection</label>
                {provider === 'local' ? (
                  <input
                    type="text"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    placeholder="Enter your local model id (e.g., gemma-4...)"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none font-mono text-sm"
                  />
                ) : (
                  <select 
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                  >
                    {provider === 'gemini' && (
                      <>
                        <option value="gemini-2.5-flash">gemini-2.5-flash (Latest, Recommended)</option>
                        <option value="gemini-2.5-pro">gemini-2.5-pro (Most Capable)</option>
                        <option value="gemini-2.0-flash-lite">gemini-2.0-flash-lite (Fastest)</option>
                      </>
                    )}
                    {provider === 'openai' && (
                      <>
                        <option value="gpt-4-turbo">gpt-4-turbo</option>
                        <option value="gpt-4o">gpt-4o</option>
                        <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                      </>
                    )}
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Generation Parameters */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-primary" />
              Generation Parameters
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Temperature</label>
                  <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono font-medium text-slate-900 dark:text-white">{temperature.toFixed(2)}</span>
                </div>
                <input 
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary" 
                  max="2" min="0" step="0.1" type="range" 
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                />
                <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500">
                  <span>Precise (0.0)</span>
                  <span>Creative (2.0)</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Max Tokens</label>
                <input 
                  type="number" 
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  System Prompt
                  <span className="text-xs font-normal text-slate-500">Defines AI persona and constraints</span>
                </label>
                <textarea 
                  rows={6}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none resize-y text-sm leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Save Action */}
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <AlertCircle className="w-4 h-4" />
              Changes will apply immediately to all new queries.
            </div>
            <button 
              onClick={handleSave}
              disabled={saving}
              className={`px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                isSaved 
                  ? 'bg-green-500 text-white' 
                  : 'bg-primary hover:bg-primary-dark text-white shadow-sm shadow-primary/30'
              } disabled:opacity-50`}
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Saved
                </>
              ) : saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Configuration
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}

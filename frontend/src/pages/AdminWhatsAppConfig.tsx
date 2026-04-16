import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Save, AlertCircle, Smartphone, CheckCircle, RefreshCcw, Link2, MapPin } from 'lucide-react';
import { AdminLayoutContextType } from '../components/AdminLayout';
import { getSettings, saveSettings } from '../api';

export default function AdminIntegrationsConfig() {
  const { toggleSidebar } = useOutletContext<AdminLayoutContextType>();
  const [provider, setProvider] = useState('twilio');
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [verifyToken, setVerifyToken] = useState('arogya_secret_token');
  const [isActive, setIsActive] = useState(false);
  const [googleMapsKey, setGoogleMapsKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<null | 'success' | 'error'>(null);

  useEffect(() => {
    getSettings().then((data) => {
      setGoogleMapsKey(data.google_maps_api_key || '');
    }).catch(console.error);
    // Note: getWhatsAppConfig to be implemented if needed
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveSettings({ google_maps_api_key: googleMapsKey });
      // Would also save whatsapp config here
      setSaveStatus('success');
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900">
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Third-Party Integrations</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Configure WhatsApp Sandbox and Google Maps APIs.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isSaving ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save Configuration
            </button>
          </div>
        </div>

        {saveStatus === 'success' && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-4 rounded-xl flex items-center gap-3">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <p className="font-medium">Configurations saved successfully.</p>
          </div>
        )}

        {/* Google Maps Config Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Google Maps API Integration
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Required for the "Find Nearby PHC" feature to display interactive maps and directions.
            </p>
          </div>
          <div className="p-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Google Maps JavaScript API Key
            </label>
            <input
              type="password"
              value={googleMapsKey}
              onChange={(e) => setGoogleMapsKey(e.target.value)}
              placeholder="AIzaSyA..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <p className="text-xs text-slate-500 mt-2">
              Ensure you have enabled the <b>Maps JavaScript API</b>, <b>Places API</b>, and <b>Directions API</b> on your Google Cloud Console.
            </p>
          </div>
        </div>

        {/* WhatsApp Config Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              WhatsApp Sandbox Integration
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Provides chatbot accessibility to users without internet relying on WhatsApp.
            </p>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Provider
                </label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="twilio">Twilio Sandbox for WhatsApp</option>
                  <option value="meta">Meta Graph API (Official)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Phone Number ID / Twilio Phone
                </label>
                <input
                  type="text"
                  value={phoneNumberId}
                  onChange={(e) => setPhoneNumberId(e.target.value)}
                  placeholder="e.g. +14155238886 or 123456789"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Access Token / Auth Token
              </label>
              <input
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="Enter your Twilio Auth Token or Meta Access Token"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Verify Token (For Webhook)
              </label>
              <input
                type="text"
                value={verifyToken}
                onChange={(e) => setVerifyToken(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <p className="text-xs text-slate-500 mt-2">
                This token must match the verify token used when setting up your Meta Webhook.
              </p>
            </div>
            
            <div className="flex items-center gap-2 mt-4">
               <input 
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
               />
               <label htmlFor="isActive" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Enable WhatsApp Integration
               </label>
            </div>
          </div>
        </div>
        
        {/* Webhook URL Section */}
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
           <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                 <Link2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                 <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Webhook URL</h3>
                 <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                    Provide this URL to your provider (Meta or Twilio) to receive incoming messages.
                 </p>
                 <code className="block bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-700 rounded-lg p-3 text-sm font-mono text-slate-800 dark:text-slate-200 break-all select-all">
                    https://your-domain.com/api/chat/whatsapp/webhook/
                 </code>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}

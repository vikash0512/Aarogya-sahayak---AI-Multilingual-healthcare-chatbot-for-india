import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AdminLayoutContextType } from '../components/AdminLayout';
import { Menu, Bell, Shield, AlertTriangle, Lock, Zap, Save, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { getGuardrails, saveGuardrails } from '../api';

export default function AdminGuardrails() {
  const { toggleSidebar } = useOutletContext<AdminLayoutContextType>();
  const [diagnosisBlocking, setDiagnosisBlocking] = useState(true);
  const [prescriptionBlocking, setPrescriptionBlocking] = useState(true);
  const [piiRedaction, setPiiRedaction] = useState(true);
  const [toxicityFilter, setToxicityFilter] = useState(true);
  const [disclaimerText, setDisclaimerText] = useState('');
  const [emergencyKeywords, setEmergencyKeywords] = useState('');
  const [emergencyResponse, setEmergencyResponse] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { loadConfig(); }, []);

  const loadConfig = async () => {
    try {
      const data = await getGuardrails();
      setDiagnosisBlocking(data.diagnosis_blocking ?? true);
      setPrescriptionBlocking(data.prescription_blocking ?? true);
      setPiiRedaction(data.pii_redaction ?? true);
      setToxicityFilter(data.toxicity_filter ?? true);
      setDisclaimerText(data.disclaimer_text || '');
      setEmergencyKeywords(data.emergency_keywords || '');
      setEmergencyResponse(data.emergency_response || '');
    } catch (err) { setError('Failed to load'); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      await saveGuardrails({
        diagnosis_blocking: diagnosisBlocking, prescription_blocking: prescriptionBlocking,
        pii_redaction: piiRedaction, toxicity_filter: toxicityFilter,
        disclaimer_text: disclaimerText, emergency_keywords: emergencyKeywords,
        emergency_response: emergencyResponse,
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
          <div><h2 className="text-xl font-bold text-slate-900 dark:text-white">Safety Guardrails</h2>
            <p className="text-xs text-slate-500 hidden sm:block">Configure medical safety rules, emergency responses, and PII protection.</p></div>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-sm text-red-700 dark:text-red-400"><AlertCircle className="w-4 h-4" /> {error}</div>}
          
          {/* Medical Safety Rules */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /> Medical Safety Rules</h3>
            <div className="space-y-4">
              {[
                { label: 'Block Self-Diagnosis', desc: 'Prevent AI from providing definitive diagnoses.', value: diagnosisBlocking, set: setDiagnosisBlocking },
                { label: 'Block Self-Prescription', desc: 'Prevent AI from recommending specific medications.', value: prescriptionBlocking, set: setPrescriptionBlocking },
                { label: 'PII Redaction', desc: 'Automatically redact phone numbers, Aadhaar numbers, and emails.', value: piiRedaction, set: setPiiRedaction },
                { label: 'Toxicity Filter', desc: 'Block toxic, abusive, or harmful language.', value: toxicityFilter, set: setToxicityFilter },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div><p className="font-medium text-slate-900 dark:text-white text-sm">{item.label}</p><p className="text-xs text-slate-500 mt-0.5">{item.desc}</p></div>
                  <button onClick={() => item.set(!item.value)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${item.value ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${item.value ? 'left-[22px]' : 'left-0.5'}`}></span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-500" /> Disclaimer</h3>
            <textarea rows={3} value={disclaimerText} onChange={(e) => setDisclaimerText(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white outline-none resize-y" />
          </div>

          {/* Emergency Keywords */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Zap className="w-5 h-5 text-red-500" /> Emergency Detection</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Emergency Keywords (comma-separated)</label>
                <textarea rows={2} value={emergencyKeywords} onChange={(e) => setEmergencyKeywords(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white outline-none resize-y" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Emergency Response</label>
                <textarea rows={2} value={emergencyResponse} onChange={(e) => setEmergencyResponse(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white outline-none resize-y" />
              </div>
            </div>
          </div>

          {/* Save */}
          <div className="flex items-center justify-end">
            <button onClick={handleSave} disabled={saving}
              className={`px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                isSaved ? 'bg-green-500 text-white' : 'bg-primary hover:bg-primary-dark text-white'} disabled:opacity-50`}>
              {isSaved ? <><CheckCircle2 className="w-5 h-5" /> Saved</> : saving ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : <><Save className="w-5 h-5" /> Save Guardrails</>}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { LayoutContextType } from '../components/Layout';
import { 
  Bell, User, Camera, Activity, Gauge, 
  CheckCircle2, FileText, Upload, File, Eye, Trash2,
  Sliders, TrendingDown, Lock, ShieldCheck, Menu, Loader2
} from 'lucide-react';
import { getUserProfile, updateUserProfile, getUserDocuments, uploadUserDocument, deleteUserDocument } from '../api';
import { useAuth } from '../contexts/AuthContext';

export default function Settings() {
  const { toggleSidebar } = useOutletContext<LayoutContextType>();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Profile State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Female');
  const [language, setLanguage] = useState('EN');
  
  // BMI State
  const [height, setHeight] = useState<number>(165);
  const [weight, setWeight] = useState<number>(62);
  const [newWeight, setNewWeight] = useState<string>('');
  
  // Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    loadProfile();
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const docs = await getUserDocuments();
      setDocuments(docs);
    } catch (err) {
      console.error("Failed to load documents", err);
    }
  };

  const loadProfile = async () => {
    try {
      const data = await getUserProfile();
      setName(data.name || '');
      setEmail(data.email || '');
      setLanguage(data.language_preference || 'EN');
      
      const extra = data.extra_data || {};
      setPhone(extra.phone || '');
      setAge(extra.age || '');
      setGender(extra.gender || 'Female');
      setHeight(extra.height || 165);
      setWeight(extra.weight || 62);
      
    } catch (err) {
      console.error("Failed to load profile", err);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await updateUserProfile({
        name,
        language_preference: language,
        extra_data: {
          phone,
          age,
          gender,
          height,
          weight
        }
      });
      // Optionally show a toast here
    } catch (err) {
      console.error("Failed to save profile", err);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      try {
        setLoading(true);
        await uploadUserDocument(file);
        await loadDocuments(); // Reload list after upload
      } catch (err) {
        console.error("Upload failed", err);
        alert("Failed to upload document");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteDocument = async (id: number) => {
    try {
      await deleteUserDocument(id);
      setDocuments(documents.filter(d => d.id !== id));
    } catch (err) {
      console.error("Failed to delete document", err);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleUpdateWeight = () => {
    if (newWeight && !isNaN(parseFloat(newWeight))) {
      const w = parseFloat(newWeight);
      setWeight(w);
      setNewWeight('');
      // Auto save on weight update
      updateUserProfile({
        extra_data: { weight: w }
      });
    }
  };

  // Calculate BMI
  const heightInMeters = height / 100;
  const bmi = heightInMeters > 0 ? (weight / (heightInMeters * heightInMeters)).toFixed(1) : '0';
  const bmiValue = parseFloat(bmi);
  
  let bmiCategory = '';
  let bmiColor = '';
  let bmiPosition = 0;
  
  if (bmiValue < 18.5) {
    bmiCategory = 'Underweight';
    bmiColor = 'text-blue-500 dark:text-blue-400';
    bmiPosition = (bmiValue / 18.5) * 18.5;
  } else if (bmiValue < 25) {
    bmiCategory = 'Normal Weight';
    bmiColor = 'text-green-600 dark:text-green-400';
    bmiPosition = 18.5 + ((bmiValue - 18.5) / 6.5) * 31.5;
  } else if (bmiValue < 30) {
    bmiCategory = 'Overweight';
    bmiColor = 'text-orange-500 dark:text-orange-400';
    bmiPosition = 50 + ((bmiValue - 25) / 5) * 20;
  } else {
    bmiCategory = 'Obese';
    bmiColor = 'text-red-500 dark:text-red-400';
    bmiPosition = 70 + Math.min(((bmiValue - 30) / 10) * 30, 30);
  }

  if (loading) {
    return (
      <div className="flex h-full w-full overflow-hidden bg-background-light dark:bg-background-dark items-center justify-center">
         <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full overflow-hidden">
      <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full bg-background-light dark:bg-background-dark">
        {/* Header */}
        <header className="flex-none px-6 md:px-8 py-6 md:py-8 border-b border-slate-200 dark:border-slate-800 bg-white/80 backdrop-blur-md dark:bg-slate-900/80 z-10 sticky top-0">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Settings & Profile</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl">Manage your account, preferences, and health profile.</p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={saveProfile} 
                disabled={saving}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold shadow-sm disabled:opacity-50 flex items-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>
              <button className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg" onClick={toggleSidebar}>
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
            {/* Left Column */}
            <div className="flex-1 flex flex-col gap-8">
              
              {/* Personal Information */}
              <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Personal Information
                  </h3>
                </div>
                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex flex-col items-center gap-4 min-w-[120px]">
                      <div className="relative group cursor-pointer">
                        <div className="h-32 w-32 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-4xl overflow-hidden ring-4 ring-slate-50 dark:ring-slate-700">
                          {name.charAt(0) || email.charAt(0) || 'U'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Full Name</label>
                        <input className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all" type="text" value={name} onChange={e => setName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Email Address (Readonly)</label>
                        <input className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 outline-none transition-all cursor-not-allowed" type="email" value={email} readOnly />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Phone Number</label>
                        <input className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Age</label>
                        <input className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all" type="number" value={age} onChange={e => setAge(e.target.value)} />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Physical Metrics */}
                <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col">
                  <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" />
                      Physical Metrics
                    </h3>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-center gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Gender</label>
                      <select className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none cursor-pointer" value={gender} onChange={e => setGender(e.target.value)}>
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Height (cm)</label>
                        <input 
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all" 
                          type="number" 
                          value={height}
                          onChange={(e) => setHeight(Number(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Weight (kg)</label>
                        <input 
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all" 
                          type="number" 
                          value={weight}
                          onChange={(e) => setWeight(Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* BMI Index */}
                <section className="bg-gradient-to-br from-blue-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden relative">
                  <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700/50">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <Gauge className="w-5 h-5 text-primary" />
                      BMI Index
                    </h3>
                  </div>
                  <div className="p-6 flex flex-col items-center justify-center relative z-10">
                    <div className="text-center mb-6">
                      <span className="text-5xl font-bold text-slate-800 dark:text-white">{bmi}</span>
                      <p className={`text-sm font-medium mt-2 flex items-center justify-center gap-1 ${bmiColor}`}>
                        <CheckCircle2 className="w-4 h-4" />
                        {bmiCategory}
                      </p>
                    </div>
                    
                    <div className="w-full mt-2">
                      <div className="flex h-4 w-full rounded-full overflow-hidden shadow-inner">
                        <div className="w-[18.5%] bg-blue-300 relative group">
                          <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap transition-opacity">Underweight &lt;18.5</div>
                        </div>
                        <div className="w-[31.5%] bg-green-400 relative group">
                          <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap transition-opacity">Normal 18.5-25</div>
                        </div>
                        <div className="w-[20%] bg-orange-400 relative group">
                          <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap transition-opacity">Overweight 25-30</div>
                        </div>
                        <div className="w-[30%] bg-red-400 relative group">
                          <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap transition-opacity">Obese &gt;30</div>
                        </div>
                      </div>
                      <div className="relative w-full h-4 mt-1">
                        <div className="absolute top-0 -translate-x-1/2 transition-all duration-500" style={{ left: `${Math.min(Math.max(bmiPosition, 0), 100)}%` }}>
                          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-slate-800 dark:border-b-white mx-auto"></div>
                          <div className="text-[10px] font-bold text-slate-800 dark:text-white text-center mt-1">You</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between w-full text-[10px] text-slate-400 mt-4 font-medium px-1">
                      <span>15</span>
                      <span>18.5</span>
                      <span>25</span>
                      <span>30</span>
                      <span>40</span>
                    </div>
                  </div>
                </section>
              </div>

              {/* Medical Documents */}
              <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Medical Documents (RAG Isolated)
                  </h3>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileUpload}
                    accept=".pdf,.jpg,.jpeg,.png,.docx,.txt"
                  />
                  <button onClick={triggerUpload} className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark dark:hover:text-blue-400 transition-colors">
                    <Upload className="w-4 h-4" />
                    Upload
                  </button>
                </div>
                <div className="p-6">
                  {documents.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-sm">
                      No documents uploaded yet. Upload your health records so the AI can use them.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {documents.map((doc) => (
                        <div key={doc.id} className="flex items-center gap-4 p-4 rounded-lg border border-slate-100 dark:border-slate-700 hover:border-primary/30 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all group cursor-pointer">
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${doc.type === 'pdf' ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-500'}`}>
                            <File className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{doc.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Added {doc.created_at} • {doc.size} • {doc.status}</p>
                          </div>
                          <button onClick={() => handleDeleteDocument(doc.id)} className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* Health Preferences */}
              <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-primary" />
                    Health Preferences
                  </h3>
                </div>
                <div className="p-6 space-y-8">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-700">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Preferred Language</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Select your primary language for AI consultation.</p>
                    </div>
                    <select className="w-full sm:w-48 px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none cursor-pointer" value={language} onChange={e => setLanguage(e.target.value)}>
                      <option value="EN">English</option>
                      <option value="HI">Hindi (Primary)</option>
                      <option value="MR">Marathi</option>
                      <option value="GU">Gujarati</option>
                    </select>
                  </div>
                </div>
              </section>

            </div>

            {/* Right Column */}
            <aside className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
              
              {/* Weight Tracker */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                  <TrendingDown className="w-5 h-5 text-primary" />
                  Weight Tracker
                </h3>
                <div className="flex flex-col gap-2">
                  <div className="mb-4 space-y-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-700">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">Log New Entry</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input 
                          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all text-sm" 
                          placeholder="62.5" 
                          type="number" 
                          value={newWeight}
                          onChange={(e) => setNewWeight(e.target.value)}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">kg</span>
                      </div>
                      <button 
                        onClick={handleUpdateWeight}
                        className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg shadow-sm shadow-primary/30 transition-all active:scale-[0.98] whitespace-nowrap"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Current Weight</span>
                      <span className="font-bold text-slate-900 dark:text-white">{weight.toFixed(1)} kg</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Security */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                  <Lock className="w-5 h-5 text-primary" />
                  Account Security
                </h3>
                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30">
                  <ShieldCheck className="text-blue-600 dark:text-blue-400 w-5 h-5 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-blue-800 dark:text-blue-300">Managed by Supabase</p>
                    <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-1">Your credentials and sessions are securely managed.</p>
                  </div>
                </div>
              </div>

            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

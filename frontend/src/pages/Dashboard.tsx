import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  BriefcaseMedical, Home, MessageSquare, BookOpen, MapPin, History,
  Settings, Menu, ArrowRight, Lightbulb, ShieldCheck, Sun, Activity
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LayoutContextType } from '../components/Layout';

export default function Dashboard() {
  const { toggleSidebar } = useOutletContext<LayoutContextType>();
  const { user } = useAuth();

  // Helper to format name cleanly
  const userName = user?.user_metadata?.full_name 
    ? user.user_metadata.full_name.split(' ')[0] 
    : user?.email?.split('@')[0] 
    || 'User';

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white">
            <BriefcaseMedical className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-primary-dark">Arogya</span>
        </div>
        <button className="text-slate-600 dark:text-slate-300 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" onClick={toggleSidebar}>
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 scroll-smooth pb-20">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
          
          {/* Left Column (Main Dashboard Content) */}
          <div className="flex-1 flex flex-col gap-8 min-w-0">
            
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight capitalize">Welcome Back, {userName}</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Here is your daily health summary.</p>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-sm border border-blue-100 dark:border-slate-700 w-fit">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">AI System Online</span>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Link to="/chat" className="group bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer relative overflow-hidden block">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <MessageSquare className="w-16 h-16 text-primary" />
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-primary mb-4">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">Start New Chat</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Consult with our AI assistant immediately.</p>
                <div className="flex items-center text-primary text-sm font-semibold group-hover:gap-2 transition-all">
                  <span>Start Now</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </Link>
              
              <Link to="/topics" className="group bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer relative overflow-hidden block">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <BookOpen className="w-16 h-16 text-primary" />
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-primary mb-4">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">Health Topics</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Read about symptoms and prevention.</p>
                <div className="flex items-center text-primary text-sm font-semibold group-hover:gap-2 transition-all">
                  <span>Explore</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </Link>
              
              <div className="group bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <MapPin className="w-16 h-16 text-primary" />
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-primary mb-4">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">Find Nearby PHC</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Locate the closest Primary Health Center.</p>
                <div className="flex items-center text-primary text-sm font-semibold group-hover:gap-2 transition-all">
                  <span>Locate</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Your Recent Health Activity</h3>
                <Link className="text-primary text-sm font-medium hover:underline hover:text-primary-dark" to="#">View Full History</Link>
              </div>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1 space-y-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Last Reported Symptoms</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1.5 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-600 rounded-lg text-sm font-medium">Mild Fever</span>
                      <span className="px-3 py-1.5 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-600 rounded-lg text-sm font-medium">Headache</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Health Safety Score</p>
                      <span className="text-2xl font-bold text-primary">85%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
                      <div className="bg-primary h-2.5 rounded-full shadow-sm shadow-blue-200 dark:shadow-none" style={{width: '85%'}}></div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Based on your recent check-ins and symptom reports.</p>
                  </div>
                </div>
                <div className="hidden md:block w-px bg-slate-100 dark:bg-slate-700"></div>
                <div className="flex-1 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-100 dark:border-blue-900/30">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 bg-white dark:bg-slate-800 rounded-full shadow-sm">
                      <Lightbulb className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">Latest Recommendation</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        Based on your mild fever, it is recommended to stay hydrated and monitor your temperature every 4 hours. If it exceeds 101°F, consult a doctor immediately.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow-lg mb-8">
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
              <div className="absolute -right-10 -top-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
              <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-blue-300 opacity-20 rounded-full blur-2xl"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-6 md:p-8 gap-6">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wide backdrop-blur-sm mb-3 border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
                    Monsoon Alert
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Dengue Awareness</h3>
                  <p className="text-blue-50 max-w-lg mb-6 text-sm md:text-base leading-relaxed opacity-90">
                    Protect your family from vector-borne diseases this season. Learn about symptoms, prevention tips, and when to seek medical help.
                  </p>
                  <button className="bg-white text-blue-700 hover:bg-blue-50 px-5 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm inline-flex items-center gap-2 group cursor-pointer">
                    Learn More
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
                <div className="hidden md:block w-32 h-32 md:w-48 md:h-48 bg-center bg-contain bg-no-repeat rounded-lg" style={{backgroundImage: "url('https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&w=300&h=300')"}}></div>
              </div>
            </div>
          </div>

          {/* Right Column (Sidebar widgets) */}
          <div className="w-full lg:w-80 flex flex-col gap-6 flex-shrink-0 mb-8">
            {/* Verified Badge */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center text-center group hover:border-blue-100 transition-colors">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-primary mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white">Government Verified</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-3 leading-relaxed">
                This platform complies with national digital health standards for data privacy.
              </p>
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Secure • Private • Reliable</span>
            </div>

            {/* Tips for Today */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-900/20 rounded-bl-[4rem] -mr-0 -mt-0"></div>
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-5 relative z-10">
                <Sun className="w-5 h-5 text-amber-500" />
                Tips for Today
              </h4>
              <div className="space-y-5 relative z-10">
                <div className="flex gap-3 items-start group">
                  <div className="w-1 h-full min-h-[40px] bg-primary/20 group-hover:bg-primary transition-colors rounded-full"></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Stay Hydrated</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">Drink at least 3L of water today to maintain optimal hydration.</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start group">
                  <div className="w-1 h-full min-h-[40px] bg-primary/20 group-hover:bg-primary transition-colors rounded-full"></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Take a Walk</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">A 15-minute walk after meals can improve digestion significantly.</p>
                  </div>
                </div>
              </div>
              <button className="w-full mt-6 py-2.5 text-xs font-bold text-primary border border-blue-100 hover:bg-blue-50 dark:border-blue-900 dark:hover:bg-blue-900/30 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer">
                View All Tips
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Emergency Help */}
            <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-4 border border-red-100 dark:border-red-900/30 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0 animate-pulse">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-red-600 dark:text-red-300 uppercase tracking-wider mb-0.5">Emergency Help</p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Call Ambulance: <span className="font-bold text-red-600 dark:text-red-400 text-base ml-1">102</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

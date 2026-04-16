import React, { useState, useRef } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  BriefcaseMedical, Home, MessageSquare, BookOpen, MapPin, History,
  Settings, Menu, Search, Bell, ArrowRight, ShieldCheck, ExternalLink,
  Star, Info, ChevronLeft, ChevronRight, Bug, Thermometer, Droplets
} from 'lucide-react';
import { LayoutContextType } from '../components/Layout';

export default function HealthTopics() {
  const { toggleSidebar } = useOutletContext<LayoutContextType>();
  const [showNotifications, setShowNotifications] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full bg-background-light dark:bg-background-dark">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-white/80 backdrop-blur-md dark:bg-slate-900/80 z-10 sticky top-0">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Health Topics</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Explore verified health information by category</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg" onClick={toggleSidebar}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative w-full md:w-80 lg:w-96">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search className="w-5 h-5" />
              </span>
              <input className="w-full py-2.5 pl-10 pr-4 text-sm text-slate-900 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder-slate-400 transition-all shadow-sm" placeholder="Search diseases, treatments..." type="text" />
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 text-slate-500 hover:text-primary hover:bg-primary/5 rounded-full transition-colors relative"
              >
                <Bell className="w-6 h-6" />
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
              </button>
              
              {showNotifications && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden z-50">
                  <div className="p-3 border-b border-slate-100 dark:border-slate-700 font-bold text-sm text-slate-800 dark:text-white">Notifications</div>
                  <div className="p-3 text-sm text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">Hydration Reminder</p>
                    <p className="text-xs mt-1">Time to drink a glass of water.</p>
                  </div>
                  <div className="p-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">Health Advisory</p>
                    <p className="text-xs mt-1">Dengue cases are rising in your area. Read prevention tips.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth">
          <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 max-w-[1600px] mx-auto">
            {/* Left Column (Topics Grid) */}
            <div className="flex-1 flex flex-col gap-8 min-w-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                {/* Topic Card 1 */}
                <Link to="/article/vaccination" className="group bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-lg hover:border-primary/20 transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 dark:bg-blue-900/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-blue-100 dark:border-blue-800">
                      <BriefcaseMedical className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Vaccination</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">Official immunization schedules and guidelines for all age groups.</p>
                  </div>
                  <div className="text-primary text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all group-hover:text-blue-600 relative z-10">
                    View Details <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>

                {/* Topic Card 2 */}
                <Link to="/article/womens-health" className="group bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-lg hover:border-primary/20 transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50/50 dark:bg-rose-900/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-lg bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-500 mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-rose-100 dark:border-rose-800">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Women's Health</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">Comprehensive guides on reproductive health, maternal care, and wellness.</p>
                  </div>
                  <div className="text-primary text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all group-hover:text-blue-600 relative z-10">
                    View Details <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>

                {/* Topic Card 3 */}
                <Link to="/article/child-health" className="group bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-lg hover:border-primary/20 transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50/50 dark:bg-orange-900/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-lg bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-500 mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-orange-100 dark:border-orange-800">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Child Health</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">Pediatric care guidelines, growth charts, and common childhood illnesses.</p>
                  </div>
                  <div className="text-primary text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all group-hover:text-blue-600 relative z-10">
                    View Details <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>

                {/* Topic Card 4 */}
                <Link to="/article/nutrition" className="group bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-lg hover:border-primary/20 transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-green-50/50 dark:bg-green-900/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-green-600 mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-green-100 dark:border-green-800">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Nutrition & Diet</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">Balanced diet plans, nutritional facts, and dietary management.</p>
                  </div>
                  <div className="text-primary text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all group-hover:text-blue-600 relative z-10">
                    View Details <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>

                {/* Topic Card 5 */}
                <Link to="/article/mental-health" className="group bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-lg hover:border-primary/20 transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50/50 dark:bg-purple-900/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-500 mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-purple-100 dark:border-purple-800">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Mental Health</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">Resources for anxiety, depression, and psychological well-being.</p>
                  </div>
                  <div className="text-primary text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all group-hover:text-blue-600 relative z-10">
                    View Details <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>

                {/* Topic Card 6 */}
                <Link to="/article/communicable" className="group bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-lg hover:border-primary/20 transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-red-50/50 dark:bg-red-900/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-500 mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-red-100 dark:border-red-800">
                      <Bug className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Communicable Diseases</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">Protocols for infectious diseases, outbreaks, and containment.</p>
                  </div>
                  <div className="text-primary text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all group-hover:text-blue-600 relative z-10">
                    View Details <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>

                {/* Topic Card 7 */}
                <Link to="/article/non-communicable" className="group bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-lg hover:border-primary/20 transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50/50 dark:bg-amber-900/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-500 mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-amber-100 dark:border-amber-800">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Non-Communicable</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">Management of chronic conditions like diabetes and heart disease.</p>
                  </div>
                  <div className="text-primary text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all group-hover:text-blue-600 relative z-10">
                    View Details <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>

                {/* Topic Card 8 */}
                <Link to="/article/preventive" className="group bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-lg hover:border-primary/20 transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50/50 dark:bg-teal-900/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-lg bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-500 mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-teal-100 dark:border-teal-800">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Preventive Care</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">Screening guidelines, lifestyle modifications, and early detection.</p>
                  </div>
                  <div className="text-primary text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all group-hover:text-blue-600 relative z-10">
                    View Details <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              </div>

              {/* Popular Topics Carousel */}
              <div className="flex flex-col gap-5 mt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Popular Topics This Week</h3>
                  <div className="flex gap-2">
                    <button onClick={() => scroll('left')} className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={() => scroll('right')} className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div ref={scrollContainerRef} className="flex gap-5 overflow-x-auto pb-6 scrollbar-hide snap-x">
                  <Link to="/article/dengue" className="min-w-[280px] md:min-w-[320px] bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white flex flex-col justify-between shadow-lg shadow-blue-500/20 snap-start hover:-translate-y-1 transition-transform duration-300 cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/20">
                        <Bug className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-sm border border-white/10">Trending</span>
                    </div>
                    <div className="mt-6">
                      <h4 className="font-bold text-lg">Dengue Prevention</h4>
                      <p className="text-sm text-blue-100 mt-2 opacity-90">Key steps to stay safe this monsoon season.</p>
                    </div>
                  </Link>
                  
                  <Link to="/article/flu" className="min-w-[280px] md:min-w-[320px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 flex flex-col justify-between shadow-sm snap-start hover:shadow-md hover:border-indigo-200 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 flex items-center justify-center border border-indigo-100 dark:border-indigo-800">
                        <Thermometer className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="mt-6">
                      <h4 className="font-bold text-lg text-slate-900 dark:text-white">Seasonal Flu</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Recognizing symptoms early and home care tips.</p>
                    </div>
                  </Link>
                  
                  <Link to="/article/anemia" className="min-w-[280px] md:min-w-[320px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 flex flex-col justify-between shadow-sm snap-start hover:shadow-md hover:border-rose-200 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-900/30 text-rose-500 flex items-center justify-center border border-rose-100 dark:border-rose-800">
                        <Droplets className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="mt-6">
                      <h4 className="font-bold text-lg text-slate-900 dark:text-white">Anemia Awareness</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Dietary changes for correcting iron deficiency.</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column (Sidebar) */}
            <aside className="w-full xl:w-80 2xl:w-96 flex flex-col gap-6 shrink-0 relative z-0">
              <div className="sticky top-0 flex flex-col gap-6">
                {/* Trusted Sources */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden">
                  <div className="absolute -top-6 -right-6 w-24 h-24 bg-green-50 dark:bg-green-900/20 rounded-full blur-2xl opacity-60"></div>
                  <div className="flex items-center gap-2 mb-4 relative z-10">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Trusted Sources</h3>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed relative z-10">
                    All information provided is verified and directly sourced from official national health bodies to ensure accuracy.
                  </p>
                  <div className="flex flex-col gap-3 relative z-10">
                    <a href="https://www.mohfw.gov.in/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/30 hover:bg-white hover:shadow-md hover:border-slate-200 border border-transparent dark:hover:bg-slate-700 transition-all duration-200 group">
                      <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-600 shadow-sm flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold text-[10px] border border-slate-100 dark:border-slate-500">MOHFW</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">MoHFW</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Govt. of India</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                    </a>
                    <a href="https://www.icmr.gov.in/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/30 hover:bg-white hover:shadow-md hover:border-slate-200 border border-transparent dark:hover:bg-slate-700 transition-all duration-200 group">
                      <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-600 shadow-sm flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold text-[10px] border border-slate-100 dark:border-slate-500">ICMR</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">ICMR</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Medical Research</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                    </a>
                    <a href="https://www.who.int/india" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/30 hover:bg-white hover:shadow-md hover:border-slate-200 border border-transparent dark:hover:bg-slate-700 transition-all duration-200 group">
                      <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-600 shadow-sm flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold text-[10px] border border-slate-100 dark:border-slate-500">WHO</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">WHO India</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">World Health Org</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                    </a>
                  </div>
                  <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-center gap-2 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                      <ShieldCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-xs font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide">Verified Content</span>
                    </div>
                  </div>
                </div>

                {/* Premium Card */}
                <div className="bg-slate-900 dark:bg-slate-800 rounded-xl p-6 shadow-md relative overflow-hidden group cursor-pointer border border-slate-800">
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 opacity-100 z-0"></div>
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl z-0"></div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <span className="inline-block px-2.5 py-1 bg-white/10 backdrop-blur-sm rounded text-[10px] uppercase tracking-wider text-white font-bold border border-white/10">Premium</span>
                      <Star className="w-6 h-6 text-white/50 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="font-bold text-white text-lg mb-2">Clinical Protocols</h3>
                    <p className="text-sm text-slate-300 mb-5 leading-relaxed">Access detailed clinical decision support tools and flowcharts.</p>
                    <button className="w-full py-2.5 bg-white text-slate-900 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors shadow-lg shadow-black/20 flex items-center justify-center gap-2">
                      Upgrade Plan <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4 border border-blue-100 dark:border-blue-800 flex items-start gap-3">
                  <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <p className="text-xs text-primary/80 dark:text-blue-300 leading-relaxed">
                    Content is for educational purposes only. Always consult a certified medical professional for diagnosis.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

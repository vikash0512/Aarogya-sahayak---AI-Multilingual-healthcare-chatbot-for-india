import React, { useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import {
  BriefcaseMedical, Home, MessageSquare, BookOpen, MapPin, History,
  Settings, Menu, Search, Bell, ArrowLeft, ShieldCheck, ExternalLink,
  ChevronRight, PlayCircle, Play, Check, ChevronDown, ThumbsUp, ThumbsDown,
  Mail, Link as LinkIcon, Bookmark, Share2
} from 'lucide-react';
import { LayoutContextType } from '../components/Layout';

const ARTICLE_DATA: Record<string, any> = {
  'vaccination': {
    category: 'Child Health',
    title: 'Essential Vaccination Guide for Families',
    desc: 'A comprehensive overview of mandatory and recommended immunizations for children and adults in India, ensuring protection against preventable diseases.',
    img: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=1200&q=80',
    contentTitle: 'Why Vaccination Matters'
  },
  'womens-health': {
    category: 'Womens Health',
    title: 'Maternal & Women\'s Health',
    desc: 'Comprehensive guides on reproductive health, maternal care, and wellness throughout all stages of life.',
    img: 'https://images.unsplash.com/photo-1542884748-2b87b36c6b90?auto=format&fit=crop&w=1200&q=80',
    contentTitle: 'Understanding Maternal Care'
  },
  'child-health': {
    category: 'Child Health',
    title: 'Pediatric Care Guidelines',
    desc: 'Pediatric care guidelines, growth charts, and common childhood illnesses explained.',
    img: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=1200&q=80',
    contentTitle: 'Growth and Development'
  },
  'mental-health': {
    category: 'Mental Health',
    title: 'Resources for Psychological Well-being',
    desc: 'Resources for anxiety, depression, and psychological well-being. Break the stigma and find help.',
    img: 'https://images.unsplash.com/photo-1528716321680-815a8cdb8cbe?auto=format&fit=crop&w=1200&q=80',
    contentTitle: 'Prioritizing Mental Wellness'
  },
  'nutrition': {
    category: 'Nutrition & Diet',
    title: 'Balanced Diet & Nutritional Facts',
    desc: 'Balanced diet plans, nutritional facts, and dietary management for chronic conditions.',
    img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80',
    contentTitle: 'Building a Healthy Diet'
  },
  'communicable': {
    category: 'Communicable Diseases',
    title: 'Infectious Diseases & Containment',
    desc: 'Protocols for infectious diseases, outbreaks, and containment. Hand hygiene is key.',
    img: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&w=1200&q=80',
    contentTitle: 'Preventing the Spread'
  },
  'non-communicable': {
    category: 'Non-Communicable',
    title: 'Management of Chronic Conditions',
    desc: 'Management of chronic conditions like diabetes and heart disease.',
    img: 'https://images.unsplash.com/photo-1505751172876-fa19616ae3b1?auto=format&fit=crop&w=1200&q=80',
    contentTitle: 'Living with Chronic Conditions'
  },
  'preventive': {
    category: 'Preventive Care',
    title: 'Screenings & Early Detection',
    desc: 'Screening guidelines, lifestyle modifications, and early detection.',
    img: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=1200&q=80',
    contentTitle: 'Importance of Screenings'
  },
  'dengue': {
    category: 'Trending',
    title: 'Dengue Prevention & Safety',
    desc: 'Key steps to stay safe this monsoon season.',
    img: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&w=1200&q=80',
    contentTitle: 'How to Prevent Dengue'
  },
  'flu': {
    category: 'Seasonal',
    title: 'Seasonal Flu Awareness',
    desc: 'Recognizing symptoms early and home care tips.',
    img: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
    contentTitle: 'Flu Prevention'
  },
  'anemia': {
    category: 'Awareness',
    title: 'Anemia Awareness & Iron Deficiency',
    desc: 'Dietary changes for correcting iron deficiency.',
    img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80',
    contentTitle: 'Iron-Rich Foods'
  }
};

export default function Article() {
  const { toggleSidebar } = useOutletContext<LayoutContextType>();
  const [showNotifications, setShowNotifications] = useState(false);
  const { topicId } = useParams();
  
  const article = ARTICLE_DATA[topicId || 'vaccination'] || ARTICLE_DATA['vaccination'];

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full bg-white dark:bg-background-dark">
        {/* Header */}
        <header className="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/90 backdrop-blur-md dark:bg-slate-900/90 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg" onClick={toggleSidebar}>
              <Menu className="w-6 h-6" />
            </button>
            <Link to="/topics" className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors text-sm font-medium">
              <ArrowLeft className="w-5 h-5" />
              Back to Health Topics
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex relative w-64 lg:w-72">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search className="w-5 h-5" />
              </span>
              <input className="w-full py-2 pl-10 pr-4 text-sm text-slate-900 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder-slate-400 transition-all" placeholder="Search within article..." type="text" />
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-500 hover:text-primary hover:bg-primary/5 rounded-full transition-colors relative"
              >
                <Bell className="w-6 h-6" />
                <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
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
            <button className="p-2 text-slate-500 hover:text-primary hover:bg-primary/5 rounded-full transition-colors">
              <Bookmark className="w-6 h-6" />
            </button>
            <button className="p-2 text-slate-500 hover:text-primary hover:bg-primary/5 rounded-full transition-colors">
              <Share2 className="w-6 h-6" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto scroll-smooth">
          <div className="flex flex-col xl:flex-row max-w-[1600px] mx-auto min-h-full">
            {/* Left Column (Article Content) */}
            <div className="flex-1 p-6 lg:p-10 xl:pr-12 xl:border-r border-slate-100 dark:border-slate-800 min-w-0">
              <div className="max-w-4xl mx-auto">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-6">
                  <span>Health Topics</span>
                  <ChevronRight className="w-3 h-3" />
                  <span>{article.category}</span>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-slate-900 dark:text-slate-200 capitalize">{topicId || 'Vaccination'}</span>
                </div>

                {/* Title & Meta */}
                <div className="mb-8">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border border-green-200 dark:border-green-800">
                      <ShieldCheck className="w-4 h-4" />
                      Verified by MoHFW
                    </span>
                    <span className="text-slate-400 text-xs flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      8 min read
                    </span>
                    <span className="text-slate-400 text-xs flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      Updated: Oct 24, 2023
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white leading-tight mb-6">{article.title}</h1>
                  <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                    {article.desc}
                  </p>
                </div>

                {/* Hero Image */}
                <div className="rounded-2xl overflow-hidden mb-10 shadow-lg relative aspect-video bg-slate-100">
                  <img alt={article.title} className="w-full h-full object-cover" src={article.img} />
                </div>

                {/* Article Content */}
                <div className="space-y-10 text-slate-800 dark:text-slate-200">
                  <section>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{article.contentTitle}</h2>
                    <p className="mb-4 leading-7 text-slate-600 dark:text-slate-300">
                      Vaccines are one of the most effective ways to protect your family and community from harmful diseases. They work by preparing the body's immune system to recognize and fight pathogens. According to the World Health Organization (WHO), immunization prevents 3.5-5 million deaths every year from diseases like diphtheria, tetanus, pertussis, influenza, and measles.
                    </p>
                    <p className="leading-7 text-slate-600 dark:text-slate-300">
                      In India, the Universal Immunization Programme (UIP) is one of the largest public health interventions in the world. It provides free vaccines against 12 life-threatening diseases to all children across the country.
                    </p>
                  </section>

                  {/* Video Section */}
                  <section className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-4">
                      <PlayCircle className="w-6 h-6 text-primary" />
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Helpful Video Guide</h3>
                    </div>
                    <div className="relative rounded-lg overflow-hidden bg-black aspect-video group cursor-pointer">
                      <img className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity" src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80" alt="Video thumbnail" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Play className="w-8 h-8 text-white fill-current ml-1" />
                        </div>
                      </div>
                      <div className="absolute bottom-4 left-4 text-white">
                        <p className="font-bold text-sm">Understanding How Vaccines Work</p>
                        <p className="text-xs opacity-80">Dr. Rajesh Kumar • 4:32</p>
                      </div>
                    </div>
                  </section>

                  {/* Key Takeaways */}
                  <section className="bg-blue-50 dark:bg-blue-900/10 border-l-4 border-primary p-6 rounded-r-lg">
                    <h3 className="text-lg font-bold text-primary dark:text-blue-400 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                      Key Takeaways
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                        <Check className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <span className="text-sm leading-relaxed">Vaccines are safe, effective, and rigorously tested before approval.</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                        <Check className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <span className="text-sm leading-relaxed">Adhering to the schedule ensures maximum immunity at the right age.</span>
                      </li>
                      <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                        <Check className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <span className="text-sm leading-relaxed">Most side effects are minor and temporary, such as a sore arm or mild fever.</span>
                      </li>
                    </ul>
                  </section>

                  {/* Schedule Table */}
                  <section>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Recommended Schedule</h2>
                    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm">
                      <div className="grid grid-cols-12 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 uppercase tracking-wide py-3 px-4">
                        <div className="col-span-3 md:col-span-2">Age</div>
                        <div className="col-span-6 md:col-span-7">Vaccine</div>
                        <div className="col-span-3 md:col-span-3 text-right">Status</div>
                      </div>
                      <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        <div className="grid grid-cols-12 py-4 px-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors items-center group cursor-pointer">
                          <div className="col-span-3 md:col-span-2 text-sm font-bold text-primary">At Birth</div>
                          <div className="col-span-6 md:col-span-7">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">BCG, OPV, Hep-B</p>
                            <p className="text-xs text-slate-500 mt-0.5 hidden md:block">Tuberculosis, Polio, Hepatitis B</p>
                          </div>
                          <div className="col-span-3 md:col-span-3 text-right">
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">Essential</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-12 py-4 px-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors items-center group cursor-pointer">
                          <div className="col-span-3 md:col-span-2 text-sm font-bold text-primary">6 Weeks</div>
                          <div className="col-span-6 md:col-span-7">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">Pentavalent-1, Rotavirus</p>
                            <p className="text-xs text-slate-500 mt-0.5 hidden md:block">Diphtheria, Pertussis, Tetanus, etc.</p>
                          </div>
                          <div className="col-span-3 md:col-span-3 text-right">
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">Essential</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-12 py-4 px-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors items-center group cursor-pointer">
                          <div className="col-span-3 md:col-span-2 text-sm font-bold text-primary">9-12 Months</div>
                          <div className="col-span-6 md:col-span-7">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">MR-1, JE-1</p>
                            <p className="text-xs text-slate-500 mt-0.5 hidden md:block">Measles & Rubella, Japanese Encephalitis</p>
                          </div>
                          <div className="col-span-3 md:col-span-3 text-right">
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Regional</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-12 py-4 px-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors items-center group cursor-pointer">
                          <div className="col-span-3 md:col-span-2 text-sm font-bold text-primary">16-24 Months</div>
                          <div className="col-span-6 md:col-span-7">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">DPT Booster-1, MR-2</p>
                            <p className="text-xs text-slate-500 mt-0.5 hidden md:block">Booster doses for sustained immunity</p>
                          </div>
                          <div className="col-span-3 md:col-span-3 text-right">
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">Essential</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 p-3 text-center">
                        <button className="text-primary text-sm font-semibold hover:underline">View Full Schedule PDF</button>
                      </div>
                    </div>
                  </section>

                  {/* FAQ */}
                  <section>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Common Questions</h2>
                    <div className="space-y-4">
                      <details className="group bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 open:border-primary/50 open:ring-1 open:ring-primary/20">
                        <summary className="flex items-center justify-between p-4 cursor-pointer font-semibold text-slate-900 dark:text-white marker:content-none select-none">
                          <span>Are vaccines safe for newborns?</span>
                          <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform" />
                        </summary>
                        <div className="px-4 pb-4 pt-0 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                          Yes, vaccines are thoroughly tested for safety before being approved. The immune system of a newborn is capable of handling the vaccines scheduled for them.
                        </div>
                      </details>
                      <details className="group bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 open:border-primary/50 open:ring-1 open:ring-primary/20">
                        <summary className="flex items-center justify-between p-4 cursor-pointer font-semibold text-slate-900 dark:text-white marker:content-none select-none">
                          <span>What if I miss a scheduled dose?</span>
                          <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform" />
                        </summary>
                        <div className="px-4 pb-4 pt-0 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                          If you miss a dose, consult your pediatrician immediately. Most vaccines can be given later as part of a catch-up schedule. Do not restart the entire series.
                        </div>
                      </details>
                    </div>
                  </section>
                </div>

                {/* Footer Actions */}
                <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <ThumbsUp className="w-5 h-5" />
                      Helpful
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <ThumbsDown className="w-5 h-5" />
                      Not Helpful
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-blue-100 hover:text-blue-600 transition-colors">
                      <Mail className="w-5 h-5" />
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-blue-100 hover:text-blue-600 transition-colors">
                      <LinkIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (Sidebar) */}
            <aside className="w-full xl:w-80 2xl:w-96 flex flex-col gap-6 shrink-0 p-6 lg:p-8 border-t xl:border-t-0 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
              <div className="sticky top-24 flex flex-col gap-6">
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
                    Information in this guide is sourced directly from official protocols.
                  </p>
                  <div className="flex flex-col gap-3 relative z-10">
                    <a href="https://www.mohfw.gov.in/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/30 hover:bg-white hover:shadow-md hover:border-slate-200 border border-transparent dark:hover:bg-slate-700 transition-all duration-200 group">
                      <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-600 shadow-sm flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold text-[10px] border border-slate-100 dark:border-slate-500">MOHFW</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">MoHFW Guidelines</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">National Immunization</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                    </a>
                    <a href="https://www.who.int/india" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/30 hover:bg-white hover:shadow-md hover:border-slate-200 border border-transparent dark:hover:bg-slate-700 transition-all duration-200 group">
                      <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-600 shadow-sm flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold text-[10px] border border-slate-100 dark:border-slate-500">WHO</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">WHO Position Papers</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Global Standards</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                    </a>
                  </div>
                </div>

                {/* Related Topics */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Related Topics</h3>
                  <div className="flex flex-col gap-3">
                    <Link to="#" className="flex gap-4 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-primary/30 hover:shadow-md transition-all group">
                      <div className="w-16 h-16 rounded-lg bg-orange-100 dark:bg-orange-900/20 shrink-0 overflow-hidden relative">
                        <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&w=200&q=80" alt="Side effects" />
                      </div>
                      <div className="flex flex-col justify-center">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2">Understanding Side Effects</h4>
                        <p className="text-xs text-slate-500 mt-1">What to expect post-vaccination.</p>
                      </div>
                    </Link>
                    <Link to="#" className="flex gap-4 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-primary/30 hover:shadow-md transition-all group">
                      <div className="w-16 h-16 rounded-lg bg-purple-100 dark:bg-purple-900/20 shrink-0 overflow-hidden relative">
                        <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=200&q=80" alt="Adult vaccination" />
                      </div>
                      <div className="flex flex-col justify-center">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2">Adult Vaccination</h4>
                        <p className="text-xs text-slate-500 mt-1">Flu shots, Hep B, and boosters.</p>
                      </div>
                    </Link>
                    <Link to="#" className="flex gap-4 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-primary/30 hover:shadow-md transition-all group">
                      <div className="w-16 h-16 rounded-lg bg-blue-100 dark:bg-blue-900/20 shrink-0 overflow-hidden relative">
                        <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=200&q=80" alt="Travel vaccines" />
                      </div>
                      <div className="flex flex-col justify-center">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2">Travel Vaccines</h4>
                        <p className="text-xs text-slate-500 mt-1">Requirements for international travel.</p>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* Stay Updated */}
                <div className="bg-primary rounded-xl p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                  <div className="relative z-10">
                    <Mail className="w-8 h-8 mb-3" />
                    <h3 className="font-bold text-lg mb-2">Stay Updated</h3>
                    <p className="text-white/80 text-sm mb-4">Get the latest health guidelines directly to your inbox.</p>
                    <button className="w-full py-2.5 bg-white text-primary rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors shadow-lg shadow-black/10">
                      Subscribe
                    </button>
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

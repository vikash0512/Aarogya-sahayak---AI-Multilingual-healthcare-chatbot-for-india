import React from 'react';
import { Link } from 'react-router-dom';
import {
  Hospital,
  Menu,
  BadgeCheck,
  MessageCircle,
  PlayCircle,
  Bot,
  MoreVertical,
  CheckCircle2,
  Send,
  ShieldCheck,
  Signal,
  Languages,
  Globe,
  Mic,
  BriefcaseMedical,
  AtSign
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased overflow-x-hidden transition-colors duration-300">
      <div className="relative flex min-h-screen w-full flex-col">
        {/* Navigation */}
        <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 dark:bg-background-dark/80 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 md:h-20">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                  <Hospital className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Arogya Sahayak
                </h2>
              </div>
              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-8">
                <a className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors" href="#">Home</a>
                <a className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors" href="#">About</a>
                <a className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors" href="#">Features</a>
                <Link to="/login" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors">Admin</Link>
              </nav>
              {/* CTA */}
              <div className="flex items-center gap-4">
                <Link to="/login" className="hidden md:flex items-center justify-center px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-primary transition-colors cursor-pointer">
                  Log in
                </Link>
                <Link to="/signup" className="hidden md:flex items-center justify-center px-6 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-full transition-all duration-200 shadow-lg shadow-primary/20 cursor-pointer">
                  Sign Up
                </Link>
                {/* Mobile Menu Button */}
                <button className="md:hidden p-2 text-slate-600 dark:text-slate-300 cursor-pointer">
                  <Menu className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-grow">
          <section className="relative pt-12 pb-20 lg:pt-24 lg:pb-32 overflow-hidden">
            {/* Decorative Background Gradients */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-teal-50/50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-background-dark -z-10"></div>
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent blur-3xl -z-10"></div>
            <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-t from-emerald-100/40 dark:from-emerald-900/10 to-transparent blur-3xl -z-10"></div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                {/* Hero Content */}
                <div className="flex flex-col gap-6 text-center lg:text-left z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold w-fit mx-auto lg:mx-0">
                    <BadgeCheck className="w-4 h-4" />
                    <span>Government Verified Data</span>
                  </div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white leading-[1.15] tracking-tight">
                    AI-Powered Multilingual <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-teal-500">Health Assistant</span> for India
                  </h1>
                  <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                    Reliable medical guidance in your native language, verified by government standards. Accessible to every citizen, everywhere.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
                    <Link to="/login" className="flex items-center justify-center gap-2 px-8 py-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-full shadow-xl shadow-primary/25 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
                      <MessageCircle className="w-5 h-5" />
                      Start Chat
                    </Link>
                    <button className="flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                      <PlayCircle className="w-5 h-5" />
                      Watch Demo
                    </button>
                  </div>
                  <div className="pt-6 flex items-center justify-center lg:justify-start gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white dark:border-slate-800 bg-cover" style={{backgroundImage: "url('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64')"}}></div>
                      <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white dark:border-slate-800 bg-cover" style={{backgroundImage: "url('https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64')"}}></div>
                      <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white dark:border-slate-800 bg-cover" style={{backgroundImage: "url('https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&h=64')"}}></div>
                    </div>
                    <p>Trusted by <span className="font-bold text-slate-700 dark:text-slate-200">100+ users</span> across India</p>
                  </div>
                </div>
                
                {/* Hero Visual */}
                <div className="relative w-full aspect-square lg:aspect-[4/3] flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-teal-100/50 dark:from-primary/20 dark:to-teal-900/20 rounded-full blur-3xl transform scale-90"></div>
                  
                  {/* Floating UI Card Mockup */}
                  <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700 animate-fade-in-up">
                    {/* Fake Chat Header */}
                    <div className="bg-primary px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white">
                          <Bot className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-sm">Arogya Assistant</h3>
                          <p className="text-white/80 text-xs">Always active</p>
                        </div>
                      </div>
                      <MoreVertical className="w-5 h-5 text-white/80" />
                    </div>
                    
                    {/* Fake Chat Body */}
                    <div className="p-6 space-y-4 bg-slate-50 dark:bg-slate-900/50 min-h-[320px]">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center text-primary text-xs font-bold">AI</div>
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-slate-700 dark:text-slate-200 max-w-[85%] border border-slate-100 dark:border-slate-700">
                          Namaste! I am your health assistant. How are you feeling today?
                          <div className="mt-2 flex gap-2">
                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs text-slate-500">Hindi</span>
                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs text-slate-500">English</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 flex-row-reverse">
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex-shrink-0 flex items-center justify-center text-purple-600 dark:text-purple-400 text-xs font-bold">Me</div>
                        <div className="bg-primary text-white p-3 rounded-2xl rounded-tr-none shadow-md text-sm max-w-[85%]">
                          I have a mild fever and headache since morning.
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center text-primary text-xs font-bold">AI</div>
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-slate-700 dark:text-slate-200 max-w-[85%] border border-slate-100 dark:border-slate-700">
                          <p>I understand. Based on government health protocols, please monitor your temperature. Stay hydrated.</p>
                          <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-100 dark:border-green-900/30 flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5" />
                            <span className="text-xs text-green-800 dark:text-green-200 font-medium">Verified Response</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Fake Input Area */}
                    <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex items-center gap-3">
                      <div className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-full h-10 px-4 flex items-center text-sm text-slate-400">Type your symptoms...</div>
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/30 cursor-pointer">
                        <Send className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Stats/Languages Section */}
          <section className="py-10 border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-6">
                <span className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Available in 6+ Indian Languages</span>
              </div>
              <div className="flex flex-wrap justify-center gap-3 md:gap-6">
                <div className="px-5 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm flex items-center gap-2 hover:border-primary/50 transition-colors cursor-default">
                  <span className="text-primary font-bold">अ</span> Hindi
                </div>
                <div className="px-5 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm flex items-center gap-2 hover:border-primary/50 transition-colors cursor-default">
                  <span className="text-primary font-bold">Aa</span> English
                </div>
                <div className="px-5 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm flex items-center gap-2 hover:border-primary/50 transition-colors cursor-default">
                  <span className="text-primary font-bold">আ</span> Bengali
                </div>
                <div className="px-5 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm flex items-center gap-2 hover:border-primary/50 transition-colors cursor-default">
                  <span className="text-primary font-bold">அ</span> Tamil
                </div>
                <div className="px-5 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm flex items-center gap-2 hover:border-primary/50 transition-colors cursor-default">
                  <span className="text-primary font-bold">అ</span> Telugu
                </div>
                <div className="px-5 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm flex items-center gap-2 hover:border-primary/50 transition-colors cursor-default">
                  <span className="text-primary font-bold">म</span> Marathi
                </div>
              </div>
            </div>
          </section>

          {/* Features Grid */}
          <section className="py-20 bg-slate-50 dark:bg-background-dark">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Why Choose Arogya Sahayak?</h2>
                <p className="text-slate-600 dark:text-slate-400 text-lg">Designed for every Indian citizen, ensuring accessibility, trust, and ease of use regardless of location or connectivity.</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                {/* Card 1 */}
                <div className="group p-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Government-Validated</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Responses are cross-referenced with official health protocols and databases to ensure medical accuracy and safety.
                  </p>
                </div>
                
                {/* Card 2 */}
                <div className="group p-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="w-14 h-14 bg-teal-50 dark:bg-teal-900/30 rounded-xl flex items-center justify-center text-teal-600 dark:text-teal-400 mb-6 group-hover:scale-110 transition-transform">
                    <Signal className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Low Bandwidth Ready</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Optimized to function smoothly even on 3G/4G networks in remote rural areas, ensuring help is always available.
                  </p>
                </div>
                
                {/* Card 3 */}
                <div className="group p-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                    <Languages className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Multilingual Support</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Communicate naturally in your mother tongue. Our AI understands regional nuances and local dialects seamlessly.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="py-20 bg-white dark:bg-background-dark border-t border-slate-100 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center md:text-left">How It Works</h2>
              </div>
              
              <div className="relative">
                {/* Connecting Line (Desktop) */}
                <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-0.5 bg-slate-200 dark:bg-slate-700 -z-10"></div>
                
                <div className="grid md:grid-cols-3 gap-12">
                  {/* Step 1 */}
                  <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    <div className="w-16 h-16 bg-white dark:bg-slate-800 border-2 border-primary text-primary rounded-full flex items-center justify-center mb-6 shadow-sm z-10">
                      <Globe className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">1. Select Language</h3>
                    <p className="text-slate-600 dark:text-slate-400">Choose from Hindi, English, Bengali, or other regional languages to start.</p>
                  </div>
                  
                  {/* Step 2 */}
                  <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    <div className="w-16 h-16 bg-white dark:bg-slate-800 border-2 border-primary text-primary rounded-full flex items-center justify-center mb-6 shadow-sm z-10">
                      <Mic className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">2. Describe Symptoms</h3>
                    <p className="text-slate-600 dark:text-slate-400">Type or speak your health concerns naturally, just like talking to a doctor.</p>
                  </div>
                  
                  {/* Step 3 */}
                  <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    <div className="w-16 h-16 bg-white dark:bg-slate-800 border-2 border-primary text-primary rounded-full flex items-center justify-center mb-6 shadow-sm z-10">
                      <BriefcaseMedical className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">3. Get Verified Advice</h3>
                    <p className="text-slate-600 dark:text-slate-400">Receive instant, government-backed guidance and next steps for care.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 px-4">
            <div className="max-w-5xl mx-auto bg-primary rounded-3xl overflow-hidden shadow-2xl relative">
              {/* Abstract Patterns */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
              
              <div className="relative z-10 px-6 py-16 md:px-16 md:py-20 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to prioritize your health?</h2>
                <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">Get instant, reliable medical assistance anytime, anywhere. No appointments needed.</p>
                <Link to="/login" className="inline-block px-8 py-4 bg-white text-primary font-bold rounded-full shadow-lg hover:bg-slate-100 transition-all transform hover:-translate-y-1 text-lg cursor-pointer">
                  Start Free Consultation
                </Link>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                  <Hospital className="w-6 h-6 text-primary" />
                  <span className="font-bold text-lg text-slate-900 dark:text-white">Arogya Sahayak</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Empowering India with accessible, AI-driven healthcare guidance.
                </p>
              </div>
              
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li><a className="hover:text-primary transition-colors" href="#">Features</a></li>
                  <li><a className="hover:text-primary transition-colors" href="#">Security</a></li>
                  <li><a className="hover:text-primary transition-colors" href="#">For Doctors</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li><a className="hover:text-primary transition-colors" href="#">About Us</a></li>
                  <li><a className="hover:text-primary transition-colors" href="#">Careers</a></li>
                  <li><a className="hover:text-primary transition-colors" href="#">Contact</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li><a className="hover:text-primary transition-colors" href="#">Privacy Policy</a></li>
                  <li><a className="hover:text-primary transition-colors" href="#">Terms of Service</a></li>
                  <li><a className="hover:text-primary transition-colors" href="#">Disclaimer</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-slate-100 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-slate-500 dark:text-slate-500 text-sm">© 2026 Arogya Sahayak. All rights reserved.</p>
              <div className="flex gap-4">
                <a className="text-slate-400 hover:text-primary transition-colors" href="#"><Globe className="w-5 h-5" /></a>
                <a className="text-slate-400 hover:text-primary transition-colors" href="#"><AtSign className="w-5 h-5" /></a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

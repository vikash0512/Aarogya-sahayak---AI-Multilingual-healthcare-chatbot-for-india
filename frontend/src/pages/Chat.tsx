import React, { useState, useRef, useEffect } from 'react';
import { useOutletContext, useLocation } from 'react-router-dom';
import {
  Bot, ShieldCheck, AlertTriangle,
  ChevronDown, Paperclip, Mic, Send, Droplets, Thermometer, Hospital, Lock,
  Menu, Loader2, Volume2, VolumeX, Bell, CheckCircle2, ExternalLink,
  HeartPulse, Stethoscope, Pill, BadgeCheck, RotateCcw, Plus
} from 'lucide-react';
import { LayoutContextType } from '../components/Layout';
import { sendMessage, getChatSessionMessages } from '../api';

interface StructuredContent {
  type: 'text' | 'heading' | 'point' | 'warning' | 'disclaimer';
  value?: string;
  icon?: string;
  title?: string;
  detail?: string;
}

interface StructuredResponse {
  message_type: 'diagnostic_question' | 'assessment' | 'general_info';
  greeting?: string;
  content: StructuredContent[];
  follow_up?: {
    question: string;
    options: string[];
  } | null;
  sources_note?: string;
}

interface Message {
  id: number;
  sender: 'user' | 'ai';
  text: string;
  time: string;
  verified?: boolean;
  warning?: string;
  structured?: StructuredResponse;
  sources?: { source: string; similarity: number }[];
  confidence?: number;
}

const initialMessages: Message[] = [
  {
    id: 1,
    sender: 'ai',
    text: '',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    verified: true,
    structured: {
      message_type: 'general_info',
      greeting: 'Namaste! 🙏',
      content: [
        { type: 'text', value: "I am your Arogya Sahayak AI Health Assistant. I can help you understand symptoms, suggest home remedies, and guide you to the right care." },
        { type: 'heading', value: 'How can I help you today?' },
        { type: 'point', icon: '🤒', title: 'Check Symptoms', detail: 'Describe what you\'re feeling and I\'ll help assess' },
        { type: 'point', icon: '💊', title: 'Health Information', detail: 'Ask about diseases, treatments, and prevention' },
        { type: 'point', icon: '🏥', title: 'When to See a Doctor', detail: 'I\'ll tell you when professional care is needed' },
      ],
      follow_up: {
        question: 'What would you like help with?',
        options: ['I have a fever', 'I have a headache', 'Stomach problems', 'Skin issues', 'General health advice']
      },
      sources_note: ''
    }
  }
];

/* ========================================
   RICH AI MESSAGE RENDERER
   ======================================== */
function RenderStructured({ data, verified, sources, confidence, onOptionClick }: {
  data: StructuredResponse;
  verified?: boolean;
  sources?: { source: string; similarity: number }[];
  confidence?: number;
  onOptionClick: (option: string) => void;
}) {
  return (
    <div className="space-y-3">
      {/* Greeting */}
      {data.greeting && (
        <p className="text-base font-semibold text-slate-800 dark:text-white">{data.greeting}</p>
      )}

      {/* Content blocks */}
      {data.content?.map((block, i) => {
        switch (block.type) {
          case 'heading':
            return (
              <h4 key={i} className="text-sm font-bold text-slate-900 dark:text-white mt-3 mb-1 flex items-center gap-2">
                <div className="w-1 h-4 bg-primary rounded-full"></div>
                {block.value}
              </h4>
            );

          case 'point':
            return (
              <div key={i} className="flex items-start gap-3 p-2.5 bg-white/60 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700/50 hover:border-primary/30 transition-colors">
                <span className="text-lg shrink-0 mt-0.5">{block.icon || '•'}</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{block.title}</p>
                  {block.detail && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{block.detail}</p>}
                </div>
              </div>
            );

          case 'warning':
            return (
              <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800/50">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider mb-0.5">Important</p>
                  <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">{block.value}</p>
                </div>
              </div>
            );

          case 'disclaimer':
            return (
              <div key={i} className="mt-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50">
                <p className="text-[11px] text-slate-400 dark:text-slate-500 italic leading-relaxed">{block.value}</p>
              </div>
            );

          case 'text':
          default:
            return (
              <p key={i} className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{block.value}</p>
            );
        }
      })}

      {/* Follow-up question with clickable options */}
      {data.follow_up && data.follow_up.question && (
        <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-primary" />
            {data.follow_up.question}
          </p>
          <div className="flex flex-wrap gap-2">
            {data.follow_up.options?.map((option, i) => (
              <button
                key={i}
                onClick={() => onOptionClick(option)}
                className="px-3.5 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-primary hover:text-white hover:border-primary dark:hover:bg-primary transition-all shadow-sm hover:shadow-md active:scale-95"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Verified Badge */}
      {(verified || data.sources_note) && (
        <div className="mt-4 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              Verified Information
            </span>
            {confidence != null && confidence > 0 && (
              <span className="ml-auto text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full">
                {confidence}% match
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400">
            <BadgeCheck className="w-3.5 h-3.5" />
            <span>
              {data.sources_note || 'Verified from Government Health Sources'}
              {sources && sources.length > 0 && (
                <> — Source: {sources.map(s => s.source).join(', ')}</>
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ========================================
   PLAIN TEXT FALLBACK RENDERER
   ======================================== */
function RenderPlainText({ text }: { text: string }) {
  // Basic markdown-like rendering
  const lines = text.split('\n');
  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return null;

        // Bold text
        if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
          return <p key={i} className="text-sm font-bold text-slate-800 dark:text-white">{trimmed.slice(2, -2)}</p>;
        }

        // Bullet points
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          const content = trimmed.slice(2);
          // Handle **bold** within
          const parts = content.split(/(\*\*.*?\*\*)/g);
          return (
            <div key={i} className="flex items-start gap-2 ml-1">
              <span className="text-primary mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0"></span>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {parts.map((part, j) =>
                  part.startsWith('**') && part.endsWith('**')
                    ? <strong key={j} className="text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>
                    : <span key={j}>{part}</span>
                )}
              </p>
            </div>
          );
        }

        // Disclaimer (italic)
        if (trimmed.startsWith('_') && trimmed.endsWith('_')) {
          return (
            <p key={i} className="text-[11px] text-slate-400 italic mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/50">
              {trimmed.slice(1, -1)}
            </p>
          );
        }

        return <p key={i} className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{trimmed}</p>;
      })}
    </div>
  );
}

/* ========================================
   MAIN CHAT COMPONENT
   ======================================== */
export default function Chat() {
  const { toggleSidebar } = useOutletContext<LayoutContextType>();
  const location = useLocation();
  const stateSessionId = location.state?.sessionId;

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState('EN');
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<number | undefined>(stateSessionId);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load old session if navigated from History
  useEffect(() => {
    if (stateSessionId) {
      loadSessionMessages(stateSessionId);
    }
  }, [stateSessionId]);

  const loadSessionMessages = async (id: number) => {
    try {
      setIsLoading(true);
      const data = await getChatSessionMessages(id);
      if (data && data.messages && data.messages.length > 0) {
        const loadedMessages = data.messages.map((m: any) => ({
          id: m.id,
          sender: m.sender,
          text: m.text,
          time: m.time,
          verified: m.verified,
          warning: m.warning,
          structured: m.structured,
          sources: m.sources,
          confidence: m.confidence_score,
        }));
        setMessages(loadedMessages);
      }
    } catch (err) {
      console.error("Failed to load chat history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[_*#\[\]{}]/g, '').replace(/\n/g, '. ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const langMap: Record<string, string> = {
      'HI': 'hi-IN', 'EN': 'en-US', 'BN': 'bn-IN',
      'TA': 'ta-IN', 'TE': 'te-IN', 'MR': 'mr-IN'
    };
    utterance.lang = langMap[language] || 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const toggleSpeaking = () => {
    const newState = !isSpeaking;
    setIsSpeaking(newState);
    if (!newState && window.speechSynthesis) window.speechSynthesis.cancel();
  };

  const startNewChat = () => {
    setMessages(initialMessages);
    setSessionId(undefined);
    setInputValue('');
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  };

  const handleSend = async (text?: string) => {
    const userText = (text || inputValue).trim();
    if (!userText || isLoading) return;

    const newMessage: Message = {
      id: Date.now(),
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const result = await sendMessage(userText, language, sessionId);

      if (result.session_id) setSessionId(result.session_id);

      const aiMsg: Message = {
        id: result.message.id || Date.now() + 1,
        sender: 'ai',
        text: result.message.text,
        time: result.message.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        verified: result.message.verified,
        warning: result.message.warning,
        structured: result.message.structured,
        sources: result.message.sources,
        confidence: result.message.confidence,
      };

      setMessages(prev => [...prev, aiMsg]);

      // Speak the greeting/first content
      if (isSpeaking && aiMsg.structured) {
        const toSpeak = [
          aiMsg.structured.greeting,
          ...aiMsg.structured.content
            .filter((c: StructuredContent) => c.type === 'text')
            .map((c: StructuredContent) => c.value)
        ].filter(Boolean).join('. ');
        speak(toSpeak);
      }
    } catch (err: any) {
      const errorMsg: Message = {
        id: Date.now() + 1,
        sender: 'ai',
        text: '',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        structured: {
          message_type: 'general_info',
          greeting: '',
          content: [{ type: 'warning', value: `Error: ${err.message || 'Unknown error'}. Please try again.` }],
          follow_up: null,
          sources_note: '',
        }
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionClick = (option: string) => {
    handleSend(option);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMicClick = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("Speech recognition is not supported in your browser."); return; }
    if (isListening) { setIsListening(false); return; }

    setIsListening(true);
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    const langMap: Record<string, string> = {
      'HI': 'hi-IN', 'EN': 'en-US', 'BN': 'bn-IN',
      'TA': 'ta-IN', 'TE': 'te-IN', 'MR': 'mr-IN'
    };
    recognition.lang = langMap[language] || 'en-US';
    recognition.onresult = (event: any) => {
      setInputValue(prev => prev + (prev ? " " : "") + event.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const languages = [
    { code: 'HI', name: 'Hindi' }, { code: 'EN', name: 'English' },
    { code: 'BN', name: 'Bengali' }, { code: 'TA', name: 'Tamil' },
    { code: 'TE', name: 'Telugu' }, { code: 'MR', name: 'Marathi' }
  ];

  return (
    <div className="flex h-full w-full overflow-hidden">
      <main className="flex-1 flex flex-col bg-white dark:bg-slate-950 relative min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-4 md:px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-slate-600 dark:text-slate-300 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" onClick={toggleSidebar}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-sm shadow-primary/30">
                <HeartPulse className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-white leading-tight">Health Assistant</h2>
                <span className="flex items-center gap-1 text-[10px] font-medium text-green-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  AI Powered • RAG Active
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={startNewChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors">
              <Plus className="w-3.5 h-3.5" /> New Chat
            </button>
            <button onClick={toggleSpeaking}
              className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${isSpeaking ? 'bg-blue-100 dark:bg-blue-900/50 text-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
              {isSpeaking ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 scroll-smooth">
          <div className="flex items-center justify-center py-2">
            <span className="text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">Today</span>
          </div>

          {messages.map(msg => (
            msg.sender === 'ai' ? (
              <div key={msg.id} className="flex items-start gap-3 max-w-3xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-blue-100 dark:from-primary/30 dark:to-blue-900/30 flex items-center justify-center shrink-0 border border-primary/20 shadow-sm">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-semibold text-slate-400 ml-1 uppercase tracking-wider">Arogya Sahayak AI</span>
                  <div className="mt-1 bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl rounded-tl-sm shadow-sm border border-slate-100 dark:border-slate-700/50">
                    {msg.structured ? (
                      <RenderStructured
                        data={msg.structured}
                        verified={msg.verified}
                        sources={msg.sources}
                        confidence={msg.confidence}
                        onOptionClick={handleOptionClick}
                      />
                    ) : msg.text ? (
                      <RenderPlainText text={msg.text} />
                    ) : null}

                    {/* Warning override */}
                    {msg.warning && !msg.structured && (
                      <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800/50 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700 dark:text-amber-400">{msg.warning}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div key={msg.id} className="flex items-end justify-end gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="flex flex-col items-end max-w-2xl">
                  <span className="text-[10px] font-semibold text-slate-400 mr-1 mb-1 uppercase tracking-wider">You</span>
                  <div className="bg-gradient-to-br from-primary to-blue-600 text-white p-3.5 rounded-2xl rounded-tr-sm shadow-sm shadow-primary/20">
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                  <span className="text-[9px] text-slate-400 mr-1 mt-1">{msg.time}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30 text-primary font-bold text-xs">U</div>
              </div>
            )
          ))}

          {/* Loading */}
          {isLoading && (
            <div className="flex items-start gap-3 max-w-3xl animate-in fade-in duration-200">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-blue-100 dark:from-primary/30 dark:to-blue-900/30 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div className="mt-1 bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl rounded-tl-sm shadow-sm border border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                  <span className="text-xs text-slate-500">Analyzing symptoms & medical knowledge...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} className="h-24"></div>
        </div>

        {/* Input */}
        <div className="absolute bottom-4 left-0 right-0 px-4 md:px-6 flex justify-center z-20">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-2 pl-4 flex items-center gap-2 transition-all focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary">
            {/* Language Selector */}
            <div className="relative">
              <button onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors shrink-0">
                <span>{language}</span><ChevronDown className="w-3 h-3" />
              </button>
              {showLangDropdown && (
                <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden w-36 z-50">
                  {languages.map(lang => (
                    <button key={lang.code} onClick={() => { setLanguage(lang.code); setShowLangDropdown(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${language === lang.code ? 'text-primary font-bold bg-blue-50 dark:bg-blue-900/20' : 'text-slate-700 dark:text-slate-200'}`}>
                      {lang.name} ({lang.code})
                    </button>
                  ))}
                </div>
              )}
            </div>

            <input
              className="flex-1 bg-transparent border-none text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none px-2 py-2.5"
              placeholder="Describe your symptoms or ask a health question..."
              type="text" value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />

            <input type="file" ref={fileInputRef} className="hidden" onChange={() => {}} />

            <div className="flex items-center gap-1 pr-1">
              <button onClick={() => fileInputRef.current?.click()}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <Paperclip className="w-4 h-4" />
              </button>
              <button onClick={handleMicClick}
                className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${isListening ? 'bg-red-100 dark:bg-red-900/50 text-red-500 animate-pulse' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                <Mic className="w-4 h-4" />
              </button>
              <button onClick={() => handleSend()} disabled={isLoading || !inputValue.trim()}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-primary text-white hover:bg-primary-dark shadow-md shadow-primary/30 transition-all active:scale-95 disabled:opacity-50">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex-col shrink-0 overflow-y-auto hidden xl:flex">
        <div className="p-6 space-y-8">
          {/* Safety Analysis */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Safety Analysis</h3>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-800/30 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">RAG Status</span>
                <span className="text-sm font-bold text-green-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>Active
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 w-[85%] rounded-full"></div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Responses are generated using your medical knowledge base with source verification.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { icon: '🤒', label: 'Fever Check', query: 'I have a fever' },
                { icon: '🤕', label: 'Headache', query: 'I have a headache' },
                { icon: '🤢', label: 'Nausea', query: 'I feel nauseous' },
                { icon: '😮‍💨', label: 'Breathing Issues', query: 'I have difficulty breathing' },
                { icon: '🦠', label: 'Cold & Cough', query: 'I have a cold and cough' },
              ].map((item, i) => (
                <button key={i} onClick={() => handleSend(item.query)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all text-left group">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-auto p-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-center gap-2 opacity-60">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">End-to-End Encrypted • RAG Verified</span>
          </div>
        </div>
      </aside>
    </div>
  );
}

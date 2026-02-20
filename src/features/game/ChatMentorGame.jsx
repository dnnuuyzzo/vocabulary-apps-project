import { useState, useEffect, useRef } from 'react';
import { Send, Bot, Sparkles, ChevronLeft, RefreshCw, Mic, MicOff, AlertCircle, MessageSquare, Briefcase, ShoppingBag, Stethoscope, Coffee } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { initAI, generateAIResponse, analyzeGrammar } from '../../utils/ai';

/**
 * ChatMentorGame.jsx
 * 
 * The Crown Jewel Feature: AI Roleplay Companion.
 * Uses Groq Cloud (Llama 3) to simulate realistic conversations.
 * 
 * Capabilities:
 * 1. Role Selection: Switch between Free Chat, Interview, Market, etc.
 * 2. Mission Words: Selects 3 words from "Learning" status to practice.
 * 3. Real-time Grammar Check: Analyzes user input for errors.
 * 4. Persistence: Saves chat history so conversations aren't lost on refresh.
 * 5. Voice Input: Speech-to-Text integration.
 */

const ROLES = {
    free: { name: 'Free Chat', icon: MessageSquare, prompt: "You are a helpful, friendly English language mentor. Correct mistakes gently and encourage conversation." },
    interview: { name: 'Job Interview', icon: Briefcase, prompt: "You are a professional HR manager conducting a job interview. Ask typical interview questions, one by one. Be professional but encouraging." },
    market: { name: 'Bargaining', icon: ShoppingBag, prompt: "You are a seller at a traditional market. You are selling fruits and vegetables. You expect the customer to haggle prices. Be lively and persuasive." },
    doctor: { name: 'Doctor Visit', icon: Stethoscope, prompt: "You are a helpful doctor. The user is a patient describing symptoms. Ask clarifying questions and give medical advice (roleplay only)." },
    cafe: { name: 'Ordering Coffee', icon: Coffee, prompt: "You are a barista at a busy coffee shop. Take the customer's order, ask about size/milk, and be friendly." }
};

export default function ChatMentorGame() {
    const { vocab, addPoints, logActivity, settings } = useApp();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [targetWords, setTargetWords] = useState([]);
    const [completedWords, setCompletedWords] = useState([]);
    const [mode, setMode] = useState('free'); // free, interview, market, doctor, cafe
    const [isTyping, setIsTyping] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [aiReady, setAiReady] = useState(false);
    const [grammarFeedback, setGrammarFeedback] = useState(null);
    const [showMobileMenu, setShowMobileMenu] = useState(false); // Mobile view toggle

    const chatEndRef = useRef(null);
    const recognitionRef = useRef(null);

    // Initialize AI
    useEffect(() => {
        const userKey = settings?.geminiApiKey;
        const success = initAI(userKey);
        setAiReady(success);
    }, [settings?.geminiApiKey]);

    // Initial Setup
    useEffect(() => {
        startSession();
    }, [mode]); // Load session when mode changes

    // Auto-scroll
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping, grammarFeedback]);

    // Save persistence
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem(`chat_history_${mode}`, JSON.stringify({
                messages,
                targetWords,
                completedWords,
                grammarFeedback
            }));
        }
    }, [messages, targetWords, completedWords, grammarFeedback, mode]);

    const startSession = (forceRefresh = false) => {
        const savedData = localStorage.getItem(`chat_history_${mode}`);

        // Select target words from library
        const learningWords = vocab.filter(v => v.status === 'learning');
        const pool = learningWords.length >= 3 ? learningWords : vocab;
        const availableWords = pool.length >= 3 ? pool : [
            { word: 'ephemeral', meaning: 'lasting a very short time' },
            { word: 'serendipity', meaning: 'finding something good without looking for it' },
            { word: 'resilient', meaning: 'able to withstand or recover quickly' }
        ];
        const shuffled = [...availableWords].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3);

        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);

                // Check if we are stuck on the hardcoded defaults
                const currentTargetWords = parsed.targetWords || [];
                const isDefaultSet = currentTargetWords.length === 3 &&
                    currentTargetWords.some(w => w.word === 'ephemeral') &&
                    currentTargetWords.some(w => w.word === 'serendipity') &&
                    currentTargetWords.some(w => w.word === 'resilient');

                // If we are on defaults, BUT we have enough real words now, force a refresh
                const hasRealWords = vocab.filter(v => v.status === 'learning').length >= 3 || vocab.length >= 3;

                if (!forceRefresh) {
                    if (isDefaultSet && hasRealWords) {
                        // Auto-refresh seamlessly
                        startSession(true);
                        return;
                    }

                    setMessages(parsed.messages || []);
                    setTargetWords(parsed.targetWords || selected);
                    setCompletedWords(parsed.completedWords || []);
                    setGrammarFeedback(parsed.grammarFeedback || {});
                    return;
                }
            } catch (e) {
                console.error("Failed to load chat history", e);
            }
        }

        // Start Fresh
        setTargetWords(selected);
        setCompletedWords([]);
        setGrammarFeedback({});
        setMessages([
            {
                id: 1,
                sender: 'bot',
                text: getIntroMessage(mode, selected)
            }
        ]);

        // Clear local storage for this mode if refreshing
        if (forceRefresh) {
            localStorage.removeItem(`chat_history_${mode}`);
        }
    };

    const handleRefresh = () => {
        if (confirm('Start a new session with new words? Your current chat for this mode will be cleared.')) {
            startSession(true);
        }
    };

    const getIntroMessage = (currentMode, words) => {
        const wordList = words.map(w => `• **${w.word}** (${w.meaning})`).join('\n');

        switch (currentMode) {
            case 'interview':
                return `**Mock Interview** 👔\n\nHello! Thanks for coming in today. I've reviewed your CV.\n\nCould you please start by telling me a little about yourself?\n\n(Try to use: ${words.map(w => w.word).join(', ')})`;
            case 'market':
                return `**Traditional Market** 🍎\n\n"Fresh fruits! Fresh vegetables! Come buy, very cheap for you!"\n\n(The seller is looking at you expectantly. Try to negotiate using: ${words.map(w => w.word).join(', ')})`;
            case 'doctor':
                return `**Doctor's Clinic** 🩺\n\nGood morning. I'm Dr. AI. What seems to be the problem today?\n\n(Describe your symptoms. Target vocabulary: ${words.map(w => w.word).join(', ')})`;
            case 'cafe':
                return `**Starbeans Coffee** ☕\n\nHi there! Welcome to Starbeans. What can I get started for you today?\n\n(Order a drink. Challenge words: ${words.map(w => w.word).join(', ')})`;
            case 'free':
            default:
                return `Hi! I'm your English Mentor. 👋\n\nToday's mission words:\n${wordList}\n\nWhat would you like to talk about directly?`;
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userText = input.trim();
        const msgId = Date.now();
        const newMessage = { id: msgId, sender: 'user', text: userText };

        setMessages(prev => [...prev, newMessage]);
        setInput('');
        setIsTyping(true);

        // Track Vocab Usage
        const usedWords = targetWords.filter(w =>
            userText.toLowerCase().includes(w.word.toLowerCase()) &&
            !completedWords.includes(w.word)
        );

        if (usedWords.length > 0) {
            setCompletedWords(prev => [...prev, ...usedWords.map(w => w.word)]);
            usedWords.forEach(() => {
                addPoints(20);
                logActivity('game', 1);
            });
        }

        // AI Response Logic
        try {
            if (aiReady) {
                // 1. Grammar Check (Parallel)
                analyzeGrammar(userText).then(analysis => {
                    if (analysis && analysis.hasErrors) {
                        setGrammarFeedback(prev => ({
                            ...prev,
                            [msgId]: analysis
                        }));
                    }
                });

                // 2. Generate Reply
                const history = messages.map(m => ({
                    role: m.sender === 'user' ? 'user' : 'model',
                    content: m.text
                }));

                const systemPrompt = `
                    ${ROLES[mode].prompt}
                    Current target vocabulary: ${targetWords.map(w => w.word).join(', ')}.
                    If the user uses a target word correctly, praise them briefly.
                    Keep responses concise (max 2-3 sentences) to keep conversation flowing.
                `;

                const responseText = await generateAIResponse(userText, systemPrompt, history);
                setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: responseText }]);
            } else {
                setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: "AI is still connecting. Please wait a moment or check your API Key in Settings." }]);
            }
        } catch (error) {
            console.error("Chat Error", error);
            let errorMsg = "Sorry, I had trouble thinking of a response.";

            if (error.message === "INVALID_API_KEY") {
                errorMsg += " Your API Key seems invalid. Please double-check it (should start with AIza).";
            } else if (error.message === "AI_NOT_READY") {
                errorMsg += " AI is not initialized. Please set your API Key in Settings.";
            } else {
                errorMsg += ` Detail: ${error.message || "Unknown error. Check console."}`;
            }

            setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: errorMsg }]);
        } finally {
            setIsTyping(false);
        }
    };

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                alert("Voice input is not supported in this browser. Try Chrome!");
                return;
            }
            const recognition = new SpeechRecognition();
            recognition.lang = 'en-US';
            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
            };

            recognition.start();
            recognitionRef.current = recognition;
        }
    };

    return (
        <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6 animate-in fade-in duration-500 relative">
            {/* Sidebar Controls - Hidden on mobile unless showMobileMenu is true */}
            <div className={`w-full md:w-80 space-y-4 flex flex-col shrink-0 ${showMobileMenu ? 'absolute inset-0 z-20 bg-[var(--bg-app)] md:relative md:bg-transparent md:z-auto p-4 md:p-0 h-full' : 'hidden md:flex'}`}>
                {/* Mobile specific close button */}
                <div className="md:hidden flex justify-end mb-2">
                    <button onClick={() => setShowMobileMenu(false)} className="p-2 bg-[var(--input-bg)] rounded-full text-[var(--text-main)]">
                        <ChevronLeft size={24} />
                    </button>
                </div>
                {/* Mode Selector */}
                <div className="bg-[var(--bg-card)] border border-[var(--border-light)] rounded-3xl p-6 shadow-sm">
                    <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4">Select Mode</h3>
                    <div className="grid grid-cols-1 gap-2">
                        {Object.entries(ROLES).map(([key, role]) => {
                            const Icon = role.icon;
                            return (
                                <button
                                    key={key}
                                    onClick={() => {
                                        setMode(key);
                                        setShowMobileMenu(false); // Close menu on mobile selection
                                    }}
                                    className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left ${mode === key
                                        ? 'bg-[var(--primary)] text-white shadow-lg shadow-primary/20'
                                        : 'hover:bg-[var(--bg-hover)] text-[var(--text-main)]'}`}
                                >
                                    <div className={`p-2 rounded-lg ${mode === key ? 'bg-white/20' : 'bg-[var(--input-bg)] text-[var(--text-muted)]'}`}>
                                        <Icon size={18} />
                                    </div>
                                    <span className="font-bold text-sm">{role.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Target Words */}
                <div className="bg-[var(--bg-card)] border border-[var(--border-light)] rounded-[32px] p-6 shadow-sm flex-1 overflow-y-auto custom-scrollbar min-h-[500px]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-[0.2em] flex items-center gap-2">
                            <Sparkles size={14} className="text-[var(--primary)]" />
                            Mission Words
                        </h3>
                        <button
                            onClick={handleRefresh}
                            className="p-2 hover:bg-[var(--bg-hover)] rounded-xl text-[var(--text-muted)] hover:text-[var(--primary)] transition-all group"
                            title="New Mission Words"
                        >
                            <RefreshCw size={14} className="group-active:rotate-180 transition-transform duration-500" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {targetWords.map((w, i) => {
                            const isCompleted = completedWords.includes(w.word);
                            return (
                                <motion.div
                                    key={i}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`p-3 rounded-2xl border transition-all shadow-sm ${isCompleted
                                        ? 'bg-green-500/10 border-green-500/50 text-green-600 shadow-green-500/10 ring-1 ring-green-500/20'
                                        : 'bg-[var(--bg-app)]/50 border-[var(--border-light)] text-[var(--text-main)] hover:border-[var(--primary)]/30'
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-black text-base tracking-tight leading-none mb-1">{w.word}</div>
                                            <div className="text-xs font-medium opacity-80 leading-relaxed italic">
                                                {w.meaning}
                                            </div>
                                        </div>
                                        {isCompleted && (
                                            <div className="bg-green-500 text-white p-1 rounded-full shadow-lg shadow-green-500/30">
                                                <Check size={14} strokeWidth={4} />
                                            </div>
                                        )}
                                    </div>

                                    {!isCompleted && (
                                        <div className="mt-3 flex items-center gap-2">
                                            <div className="h-1 flex-1 bg-[var(--border-light)] rounded-full overflow-hidden">
                                                <div className="h-full w-0 bg-[var(--primary)] rounded-full group-hover:w-full transition-all duration-1000"></div>
                                            </div>
                                            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest whitespace-nowrap">Target</span>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

            </div>

            {/* Chat Area - Full screen on mobile unless menu is open */}
            <div className={`flex-1 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-[32px] overflow-hidden flex flex-col shadow-xl relative ${showMobileMenu ? 'hidden md:flex' : 'flex'}`}>
                {/* Header */}
                <div className="p-4 border-b border-[var(--border-light)] bg-[var(--bg-card)]/80 backdrop-blur-md absolute top-0 w-full z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Mobile Box Menu Toggle */}
                        <button onClick={() => setShowMobileMenu(true)} className="md:hidden p-2 hover:bg-[var(--input-bg)] rounded-xl transition-colors text-[var(--primary)] bg-[var(--primary)]/10 font-bold">
                            <Briefcase size={20} />
                        </button>

                        {/* Desktop Back Button */}
                        <button onClick={() => navigate('/dashboard')} className="hidden md:block p-2 hover:bg-[var(--input-bg)] rounded-xl transition-colors text-[var(--text-muted)]">
                            <ChevronLeft size={24} />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-black text-[var(--text-main)]">{ROLES[mode].name}</span>
                                {!aiReady && <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-600 text-[10px] font-bold rounded-full">Offline</span>}
                            </div>
                            <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
                                {aiReady ? 'Online' : 'Setup API Key in Settings'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 pt-24 pb-4 space-y-6 scrollbar-thin">
                    <AnimatePresence>
                        {messages.map((msg) => (
                            <div key={msg.id} className="space-y-2">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${msg.sender === 'user'
                                        ? 'bg-[var(--primary)] text-white rounded-tr-none'
                                        : 'bg-[var(--input-bg)] text-[var(--text-main)] border border-[var(--border-light)] rounded-tl-none'
                                        }`}>
                                        <div className="whitespace-pre-line leading-relaxed text-sm">
                                            {msg.text.split('**').map((part, i) =>
                                                i % 2 === 1 ? <strong key={i} className={msg.sender === 'user' ? 'text-yellow-300' : 'text-[var(--primary)]'}>{part}</strong> : part
                                            )}
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Grammar Feedback */}
                                {msg.sender === 'user' && grammarFeedback && grammarFeedback[msg.id] && grammarFeedback[msg.id].hasErrors && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="flex justify-end"
                                    >
                                        <div className="max-w-[85%] bg-red-500/5 border border-red-500/20 rounded-xl p-3 text-xs space-y-1">
                                            <div className="flex items-center gap-2 text-red-500 font-bold uppercase tracking-wider">
                                                <AlertCircle size={12} /> Grammar Check
                                            </div>
                                            <div className="text-[var(--text-main)] font-medium">
                                                <span className="line-through opacity-50 mr-2">{msg.text}</span>
                                                <span className="text-green-600 font-bold">{grammarFeedback[msg.id].correction}</span>
                                            </div>
                                            <div className="text-[var(--text-muted)] italic">{grammarFeedback[msg.id].explanation}</div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        ))}
                    </AnimatePresence>

                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-[var(--input-bg)] p-4 rounded-2xl rounded-tl-none border border-[var(--border-light)] flex gap-1">
                                <span className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                <span className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-[var(--bg-card)] border-t border-[var(--border-light)]">
                    <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
                        <button
                            type="button"
                            onClick={toggleListening}
                            className={`p-4 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-[var(--input-bg)] text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                            title="Voice Input"
                        >
                            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                        </button>

                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={isListening ? "Listening..." : "Type your message..."}
                            disabled={isTyping}
                            className="flex-1 bg-[var(--input-bg)] text-[var(--text-main)] px-5 py-4 rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none font-medium border border-[var(--border-light)] transition-all disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isTyping}
                            className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:bg-[var(--text-muted)] text-white p-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 disabled:hover:translate-y-0 disabled:shadow-none"
                        >
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

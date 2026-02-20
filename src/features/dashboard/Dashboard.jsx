import { useApp } from '../../context/AppContext';
import { MoreVertical, Smartphone, Book, ChevronRight, Zap, Sparkles, Headphones, Plus, Eye, EyeOff, HelpCircle, Flame, Clock, Check, ChevronLeft, X, Gamepad2, Trophy, Folder, BarChart2, Calendar, Activity, PieChart, ChevronDown, Layout, RotateCw, Volume2, MessageSquare } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { formatDistanceToNow, parseISO, startOfWeek, addDays, isSameDay, format, differenceInCalendarDays, isSameMonth, endOfMonth, startOfMonth, endOfWeek } from 'date-fns';

import StreakChart from './StreakChart';

/**
 * Dashboard.jsx
 * 
 * The Home Screen of the application.
 * Displays a summary of the user's progress and quick access to features.
 * 
 * Sections:
 * 1. Greeting & Motivation (Typewriter effect)
 * 2. Quick Review Cards (Flashcard, Learn, etc.)
 * 3. Statistics (Weekly Streak Chart & Calendar)
 * 4. Latest Words (Horizontal scroll list)
 */
export default function Dashboard({ onNavigate }) {
    const { progress, vocab, theme } = useApp();
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [isFading, setIsFading] = useState(false);
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [displayText, setDisplayText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [typingSpeed, setTypingSpeed] = useState(100);
    const [revealedWordIds, setRevealedWordIds] = useState({});
    const [viewMode, setViewMode] = useState('day'); // 'day', 'month', 'year'
    const [activeDate, setActiveDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [chartType, setChartType] = useState('bar');
    const [showChartMenu, setShowChartMenu] = useState(false);
    const [weekOffset, setWeekOffset] = useState(0);
    const scrollRef = useRef(null);

    // Auto-scroll Latest Words
    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer) return;

        const interval = setInterval(() => {
            if (scrollContainer.scrollLeft + scrollContainer.clientWidth >= scrollContainer.scrollWidth) {
                scrollContainer.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                scrollContainer.scrollBy({ left: 300, behavior: 'smooth' });
            }
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (vocab && vocab.length > 1) {
            const interval = setInterval(() => {
                setIsFading(true);
                setTimeout(() => {
                    setCurrentWordIndex(prev => (prev + 1) % vocab.length);
                    setIsFading(false);
                }, 500);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [vocab]);

    const activeWord = vocab && vocab.length > 0 ? vocab[currentWordIndex] : null;

    const phrases = [
        "Let's master a new word today.",
        "Ready to expand your vocabulary?",
        "Consistency is the key to mastery.",
        "What exciting words will you learn today?",
        "Your journey to fluency continues here.",
        "Every new word is a step forward.",
        "Let's turn curiosity into knowledge."
    ];

    useEffect(() => {
        let timer;
        const currentPhrase = phrases[phraseIndex];
        const handleTyping = () => {
            if (!isDeleting) {
                setDisplayText(currentPhrase.substring(0, displayText.length + 1));
                setTypingSpeed(50);
                if (displayText === currentPhrase) {
                    timer = setTimeout(() => setIsDeleting(true), 10000);
                    return;
                }
            } else {
                setDisplayText(currentPhrase.substring(0, displayText.length - 1));
                setTypingSpeed(30);
                if (displayText === '') {
                    setIsDeleting(false);
                    setPhraseIndex((prev) => (prev + 1) % phrases.length);
                    return;
                }
            }
            timer = setTimeout(handleTyping, typingSpeed);
        };
        timer = setTimeout(handleTyping, typingSpeed);
        return () => clearTimeout(timer);
    }, [displayText, isDeleting, phraseIndex]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'Good morning';
        if (hour >= 12 && hour < 17) return 'Good afternoon';
        if (hour >= 17 && hour < 21) return 'Good evening';
        return 'Good night';
    };

    const getPinColorClass = (id) => {
        const colors = ['pin-purple', 'pin-red', 'pin-yellow', 'pin-green', 'pin-blue', 'pin-teal'];
        const index = String(id).charCodeAt(0) || 0;
        return colors[index % colors.length];
    };

    const toggleReveal = (id, e) => {
        e.stopPropagation();
        setRevealedWordIds(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const [currentMonth, setCurrentMonth] = useState(new Date());

    const getActivityColor = (dateStr) => {
        const log = progress?.activityLog?.[dateStr];
        const typesOrder = ['vocab', 'learn', 'game', 'listening'];
        let types = [];
        if (Array.isArray(log)) types = typesOrder.filter(t => log.includes(t));
        else if (log && typeof log === 'object') types = typesOrder.filter(t => log[t] > 0);

        if (types.length === 0) return { className: '', isActive: false, types: [] };

        const colorMap = { 'vocab': '#3b82f6', 'learn': '#f97316', 'game': '#10b981', 'listening': '#a855f7' };
        return { isActive: true, types };
    };

    const getDayActivities = (dateStr) => {
        const vocabAdded = vocab?.filter(v => v.createdDate && v.createdDate.startsWith(dateStr)) || [];
        const log = progress?.activityLog?.[dateStr] || {};

        // Normalize stats
        let stats = { vocab: 0, learn: 0, game: 0, listening: 0, mastered: 0 };
        if (Array.isArray(log)) {
            log.forEach(t => { if (stats.hasOwnProperty(t)) stats[t] = 1; });
        } else {
            stats = { ...stats, ...log };
        }

        return { vocab: vocabAdded, stats };
    };

    const nextMonth = () => setCurrentMonth(addDays(endOfMonth(currentMonth), 1));
    const prevMonth = () => setCurrentMonth(addDays(startOfMonth(currentMonth), -1));

    const getCalendarGrid = () => {
        const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
        const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
        const days = [];
        let curr = start;
        while (curr <= end) { days.push(curr); curr = addDays(curr, 1); }
        return days;
    };

    const getStreakStatus = (dateInStreak) => {
        const dateStr = format(dateInStreak, 'yyyy-MM-dd');
        const log = progress?.activityLog?.[dateStr];
        let isActive = Array.isArray(log) ? log.length > 0 : (log && Object.values(log).some(v => v > 0));
        const isYesterday = isSameDay(dateInStreak, addDays(new Date(), -1));
        const isGraceCandidate = !isActive && isYesterday && progress?.currentStreak > 0;
        return { isActive, isGraceCandidate };
    };

    const [expandedSections, setExpandedSections] = useState({ added: true, other: true });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const getWeeklyStats = () => {
        const today = addDays(new Date(), weekOffset * 7);
        const start = startOfWeek(today, { weekStartsOn: 0 });
        const end = endOfWeek(today, { weekStartsOn: 0 });
        const stats = [];
        let maxCount = 0;
        for (let i = 0; i <= 6; i++) {
            const day = addDays(start, i);
            const dateStr = format(day, 'yyyy-MM-dd');
            const log = progress?.activityLog?.[dateStr] || { vocab: 0, learn: 0, listening: 0, game: 0, mastered: 0 };
            let data = log;
            if (Array.isArray(log)) {
                data = { vocab: 0, learn: 0, listening: 0, game: 0, mastered: 0 };
                log.forEach(t => { if (data.hasOwnProperty(t)) data[t] = 1; });
            }
            const total = (data.vocab || 0) + (data.learn || 0) + (data.listening || 0) + (data.game || 0) + (data.mastered || 0);
            maxCount = Math.max(maxCount, total, data.vocab || 0, data.learn || 0, data.listening || 0, data.game || 0, data.mastered || 0);
            stats.push({
                day: format(day, 'EEE'),
                fullDate: dateStr,
                vocab: data.vocab || 0,
                learn: data.learn || 0,
                listening: data.listening || 0,
                game: data.game || 0,
                mastered: data.mastered || 0,
                total
            });
        }
        const weekLabel = `${format(start, 'd MMM')} - ${format(end, 'd MMM yyyy')}`;
        return { stats, maxCount: Math.max(maxCount, 5), weekLabel };
    };

    const recentWords = vocab ? [...vocab].sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate)) : [];

    if (!progress) return (
        <div className="flex items-center justify-center p-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col gap-6 items-center text-center py-10">
                <h1 className="text-4xl md:text-6xl font-black text-[var(--text-main)] tracking-tight">
                    {getGreeting()}, <span className="text-[var(--primary)]">{progress.name || 'Learner'}!</span>
                </h1>
                <p className="text-[var(--text-muted)] font-black text-xl md:text-2xl mt-2 min-h-[2rem]">
                    {displayText}
                </p>
            </div>

            {/* Quick Review */}
            <section className="space-y-8">
                <h2 className="text-2xl font-black text-[var(--text-main)]">Quick Review</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Word of the Day Pin - Matching Premium Static Design */}
                    <div className="premium-card p-8 bg-gradient-to-br from-[var(--pin-purple)] to-purple-700 text-white border-none shadow-2xl relative overflow-hidden group min-h-[300px] h-full flex flex-col">
                        <div className="absolute -right-6 -top-6 opacity-10 rotate-12 pointer-events-none group-hover:rotate-45 transition-transform duration-700"><Book size={140} /></div>

                        <div className="relative z-10 flex flex-col h-full">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 block opacity-60">Word of the Day</span>

                            {activeWord ? (
                                <div className={`transition-all duration-500 flex-1 flex flex-col ${isFading ? 'opacity-0 -translate-y-4' : 'opacity-100'}`}>
                                    <div className="mb-6">
                                        <h3 className="text-4xl md:text-5xl font-black mb-1 leading-tight tracking-tighter">{activeWord.word}</h3>
                                        <p className="text-white/60 font-bold text-lg md:text-xl leading-tight">{activeWord.meaning.toLowerCase()}</p>
                                    </div>

                                    <div className="mt-auto">
                                        {activeWord.example && (
                                            <div className="bg-black/20 backdrop-blur-md p-5 rounded-3xl border border-white/10 shadow-inner group-hover:bg-black/30 transition-all">
                                                {(() => {
                                                    const ex = activeWord.example.split('|||')[0];
                                                    const match = ex.match(/(.*)\s\((.*)\)/);
                                                    if (match) {
                                                        return (
                                                            <>
                                                                <p className="text-[13px] font-black italic leading-tight text-white mb-2">"{match[1]}"</p>
                                                                <p className="text-[11px] font-bold text-white/50 leading-tight">({match[2]})</p>
                                                            </>
                                                        );
                                                    }
                                                    return <p className="text-[13px] italic opacity-95 leading-relaxed">"{ex}"</p>;
                                                })()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                                    <Plus size={40} className="mb-2" />
                                    <p className="font-black text-sm uppercase tracking-widest">Add words to start</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Modes */}
                    <div onClick={() => onNavigate('learn')} className="premium-card p-8 bg-[var(--pin-yellow)] text-white border-none shadow-xl cursor-pointer group flex flex-col justify-between min-h-[300px] h-full">
                        <div className="flex justify-between items-start">
                            <Zap size={40} className="fill-white transition-all duration-500 group-hover:scale-125 group-hover:rotate-12 group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                            <ChevronRight size={24} className="transition-transform duration-300 group-hover:translate-x-1" />
                        </div>
                        <div><h4 className="text-3xl font-black mb-1">Learn</h4><p className="font-bold opacity-80 text-xs">Interactive flip cards.</p></div>
                    </div>
                    <div onClick={() => onNavigate('listen')} className="premium-card p-8 bg-[var(--pin-red)] text-white border-none shadow-xl cursor-pointer group flex flex-col justify-between min-h-[300px] h-full">
                        <div className="flex justify-between items-start">
                            <Headphones size={40} className="transition-all duration-500 group-hover:scale-110 group-hover:-rotate-12 group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                            <ChevronRight size={24} className="transition-transform duration-300 group-hover:translate-x-1" />
                        </div>
                        <div><h4 className="text-3xl font-black mb-1">Listen</h4><p className="font-bold opacity-80 text-xs">Audio pronunciation.</p></div>
                    </div>
                    <div onClick={() => onNavigate('game')} className="premium-card p-8 bg-[var(--pin-green)] text-white border-none shadow-xl cursor-pointer group flex flex-col justify-between min-h-[300px] h-full">
                        <div className="flex justify-between items-start">
                            <Gamepad2 size={40} className="transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                            <ChevronRight size={24} className="transition-transform duration-300 group-hover:translate-x-1" />
                        </div>
                        <div><h4 className="text-3xl font-black mb-1">Games</h4><p className="font-bold opacity-80 text-xs">Play to remember.</p></div>
                    </div>
                    <div onClick={() => onNavigate('achievements')} className="premium-card p-8 bg-[var(--pin-blue)] text-white border-none shadow-xl cursor-pointer group flex flex-col justify-between min-h-[300px] h-full">
                        <div className="flex justify-between items-start">
                            <Trophy size={40} className="transition-all duration-500 group-hover:scale-125 group-hover:-rotate-12 group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                            <ChevronRight size={24} className="transition-transform duration-300 group-hover:translate-x-1" />
                        </div>
                        <div><h4 className="text-3xl font-black mb-1">Awards</h4><p className="font-bold opacity-80 text-xs">Track milestones.</p></div>
                    </div>
                    <div onClick={() => onNavigate('ai-mentor')} className="premium-card p-8 bg-indigo-600 text-white border-none shadow-xl cursor-pointer group flex flex-col justify-between min-h-[300px] h-full">
                        <div className="flex justify-between items-start">
                            <MessageSquare size={40} className="fill-white transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-2 group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                            <ChevronRight size={24} className="transition-transform duration-300 group-hover:translate-x-1" />
                        </div>
                        <div><h4 className="text-3xl font-black mb-1">Chat</h4><p className="font-bold opacity-80 text-xs">AI Mentor conversation.</p></div>
                    </div>
                </div>
            </section>

            {/* Streak & Calendar */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Weekly Streak */}
                <div className="lg:col-span-1 static-card p-5 bg-[var(--bg-card)] border border-[var(--border-light)] flex flex-col">
                    {/* Header Row */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <h3 className="text-base font-black text-[var(--text-main)]">Weekly Streak</h3>
                            <div className="flex items-center gap-1 text-xs text-[var(--primary)] font-black bg-[var(--primary)]/10 px-2 py-0.5 rounded-full">
                                <Flame size={12} className="fill-current" /> {progress?.currentStreak || 0}
                            </div>
                        </div>
                        {/* Chart Type Toggle - Icon Only */}
                        <div className="flex gap-1">
                            {[
                                { type: 'bar', icon: BarChart2 },
                                { type: 'line', icon: Activity },
                                { type: 'pie', icon: PieChart },
                            ].map(opt => (
                                <button
                                    key={opt.type}
                                    onClick={() => setChartType(opt.type)}
                                    className={`p-1.5 rounded-lg transition-all ${chartType === opt.type ? 'bg-[var(--primary)] text-white' : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'}`}
                                >
                                    <opt.icon size={14} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Week Navigation - Minimal */}
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <button
                            onClick={() => setWeekOffset(prev => prev - 1)}
                            className="p-1 hover:bg-[var(--bg-hover)] rounded-lg transition-colors text-[var(--text-muted)]"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-[11px] font-bold text-[var(--text-muted)]">{getWeeklyStats().weekLabel}</span>
                        <button
                            onClick={() => setWeekOffset(prev => Math.min(prev + 1, 0))}
                            disabled={weekOffset >= 0}
                            className={`p-1 hover:bg-[var(--bg-hover)] rounded-lg transition-colors ${weekOffset >= 0 ? 'opacity-20 cursor-not-allowed' : 'text-[var(--text-muted)]'}`}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    {/* Chart */}
                    <div className="flex-1 min-h-[180px]">
                        <StreakChart data={getWeeklyStats().stats} type={chartType} />
                    </div>

                    {/* Streak Indicators - Compact Row */}
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-[var(--border-light)]">
                        {getWeeklyStats().stats.map((d, i) => {
                            const realDate = parseISO(d.fullDate);
                            const { isActive } = getStreakStatus(realDate);
                            const isToday = isSameDay(realDate, new Date());
                            return (
                                <div key={i} className="flex flex-col items-center gap-1">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-[var(--primary)] text-white' : 'bg-[var(--input-bg)] text-[var(--text-muted)] opacity-40'} ${isToday && !isActive ? 'ring-2 ring-[var(--primary)]/50' : ''}`}>
                                        {isActive ? <Check size={10} strokeWidth={3} /> : <span className="text-[8px] font-black">{d.day.charAt(0)}</span>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Calendar */}
                <div className="lg:col-span-2 static-card p-0 bg-[var(--bg-card)] border border-[var(--border-light)] flex flex-col md:flex-row overflow-hidden h-[550px]">
                    <div className="flex-1 p-6 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-[var(--text-main)]">{format(currentMonth, 'MMMM yyyy')}</h3>
                            <div className="flex gap-2">
                                <button onClick={prevMonth} className="p-2 hover:bg-[var(--bg-hover)] rounded-full"><ChevronLeft size={20} /></button>
                                <button onClick={nextMonth} className="p-2 hover:bg-[var(--bg-hover)] rounded-full"><ChevronRight size={20} /></button>
                            </div>
                        </div>
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => <div key={d} className="text-center text-[10px] font-black text-[var(--text-muted)] opacity-50">{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-1 flex-1">
                            {getCalendarGrid().map((day, i) => {
                                const dateStr = format(day, 'yyyy-MM-dd');
                                const isCurrentMonth = isSameMonth(day, currentMonth);
                                const activityInfo = getActivityColor(dateStr);
                                const isSelected = activeDate === dateStr;
                                const isToday = isSameDay(day, new Date());
                                const dotColors = { 'vocab': 'bg-blue-500', 'learn': 'bg-orange-500', 'game': 'bg-emerald-500', 'listening': 'bg-purple-500' };
                                return (
                                    <button key={i} onClick={() => setActiveDate(dateStr)} className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-bold transition-all ${!isCurrentMonth ? 'opacity-10' : 'opacity-100'} ${isSelected ? 'ring-2 ring-[var(--primary)] bg-[var(--bg-hover)]' : 'hover:bg-[var(--bg-hover)]'} ${isToday ? 'text-[var(--primary)]' : ''}`}>
                                        {format(day, 'd')}
                                        <div className="flex gap-0.5 mt-1 h-1">
                                            {activityInfo.types.map(t => <div key={t} className={`w-1 h-1 rounded-full ${dotColors[t]}`} />)}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    {/* History Panel */}
                    <div className="w-full md:w-72 bg-[var(--input-bg)] border-l border-[var(--border-light)] p-6 overflow-y-auto custom-scrollbar">
                        <h4 className="font-black text-xl mb-1">History</h4>
                        <div className="h-1 w-12 bg-[var(--primary)] rounded-full mb-6"></div>
                        {activeDate ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-bold text-[var(--text-muted)]">
                                        {isSameDay(parseISO(activeDate), new Date()) ? 'Today' : format(parseISO(activeDate), 'EEEE, d MMM')}
                                    </p>
                                </div>

                                {/* Added Words Section */}
                                {getDayActivities(activeDate).vocab.length > 0 && (
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => toggleSection('added')}
                                            className="w-full flex items-center justify-between group py-2"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full bg-blue-500 transition-all ${expandedSections.added ? 'scale-110' : 'opacity-50'}`}></div>
                                                <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors">
                                                    Added ({getDayActivities(activeDate).vocab.length})
                                                </h5>
                                            </div>
                                            <ChevronDown size={14} className={`text-[var(--text-muted)] transition-all duration-300 ${expandedSections.added ? 'rotate-180' : ''}`} />
                                        </button>

                                        <div className={`space-y-1 transition-all duration-300 ease-in-out overflow-hidden ${expandedSections.added ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                            {getDayActivities(activeDate).vocab.map(v => (
                                                <div
                                                    key={v.id}
                                                    onClick={() => onNavigate('review', v.id)}
                                                    className="group flex items-center justify-between p-2.5 rounded-lg hover:bg-[var(--bg-card)] border border-transparent hover:border-[var(--border-light)] hover:shadow-sm transition-all cursor-pointer"
                                                >
                                                    <span className="text-sm font-bold text-[var(--text-main)] group-hover:pl-1 transition-all">{v.word}</span>
                                                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] group-hover:translate-x-1 transition-all" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Other Activities Section */}
                                {(() => {
                                    const { stats } = getDayActivities(activeDate);
                                    const otherActivities = [
                                        { key: 'learn', label: 'Study Sessions', count: stats.learn, color: 'bg-amber-500' },
                                        { key: 'game', label: 'Games Played', count: stats.game, color: 'bg-emerald-500' },
                                        { key: 'listening', label: 'Listening', count: stats.listening, color: 'bg-purple-500' },
                                        { key: 'mastered', label: 'Mastered', count: stats.mastered, color: 'bg-orange-500' }
                                    ].filter(a => a.count > 0);

                                    if (otherActivities.length === 0) return null;

                                    return (
                                        <div className="space-y-2">
                                            <button
                                                onClick={() => toggleSection('other')}
                                                className="w-full flex items-center justify-between group py-2"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] transition-all ${expandedSections.other ? 'scale-110' : 'opacity-50'}`}></div>
                                                    <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors">
                                                        Activity
                                                    </h5>
                                                </div>
                                                <ChevronDown size={14} className={`text-[var(--text-muted)] transition-all duration-300 ${expandedSections.other ? 'rotate-180' : ''}`} />
                                            </button>

                                            <div className={`space-y-1 transition-all duration-300 ease-in-out overflow-hidden ${expandedSections.other ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                                {otherActivities.map(activity => (
                                                    <div key={activity.key} className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--bg-card)]/50 border border-[var(--border-light)]/50">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-2 h-2 rounded-full ${activity.color}`}></div>
                                                            <span className="text-xs font-bold text-[var(--text-main)]">{activity.label}</span>
                                                        </div>
                                                        <span className="text-xs font-black text-[var(--text-muted)] bg-[var(--input-bg)] px-2 py-0.5 rounded-md">
                                                            {activity.count}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}

                                {getDayActivities(activeDate).vocab.length === 0 && Object.values(getDayActivities(activeDate).stats).every(v => v === 0) && (
                                    <div className="flex flex-col items-center justify-center py-10 opacity-40">
                                        <Calendar size={32} className="mb-2" />
                                        <p className="text-xs font-bold uppercase tracking-widest text-center">No Activity</p>
                                    </div>
                                )}
                            </div>
                        ) : <p className="text-sm opacity-50">Select a date.</p>}
                    </div>
                </div>
            </section>

            {/* Latest Words */}
            <section className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-black text-[var(--text-main)]">Latest Words</h2>
                    <button onClick={() => onNavigate('vocab')} className="text-[var(--primary)] font-black text-sm hover:underline">View All</button>
                </div>
                <div ref={scrollRef} className="horizontal-scroll scrollbar-hide">
                    {recentWords.slice(0, 8).map(word => {
                        const pinColorClass = getPinColorClass(word.id);
                        return (
                            <div
                                key={word.id}
                                onClick={() => onNavigate('review', word.id)}
                                className={`horizontal-scroll-item static-card p-5 flex flex-col justify-between group cursor-zoom-in pin-colorful-border bg-[var(--bg-card)] h-[180px] border border-[var(--border-light)] ${pinColorClass}`}
                            >
                                <div className="space-y-2">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-black text-xl pin-text-vibrant leading-tight">{word.word}</h4>
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow-sm ${word.status === 'mastered'
                                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                            : word.status === 'learning'
                                                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                                                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                            }`}>
                                            {word.status}
                                        </span>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between gap-3 bg-[var(--input-bg)] p-3 rounded-xl border border-[var(--border-light)] text-sm">
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-bold transition-all ${revealedWordIds[word.id] ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)] tracking-[0.2em]'}`}>
                                                {revealedWordIds[word.id] ? word.meaning.toLowerCase() : '••••••••'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={(e) => toggleReveal(word.id, e)}
                                            className="p-1.5 rounded-lg text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors"
                                        >
                                            {revealedWordIds[word.id] ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-[var(--border-light)] flex items-center justify-between">
                                    <span className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest">
                                        {word.createdDate ? formatDistanceToNow(parseISO(word.createdDate)) : 'Recently'}
                                    </span>
                                    <div className="w-7 h-7 rounded-full bg-[var(--bg-app)] flex items-center justify-center pin-text-vibrant shadow-sm group-hover:bg-[var(--primary)] group-hover:text-white transition-all">
                                        <ChevronRight size={14} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}

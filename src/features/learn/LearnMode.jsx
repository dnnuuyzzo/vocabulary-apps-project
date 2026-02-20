import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { RotateCw, Check, X, ArrowRight, Volume2, Play, Zap, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

export default function LearnMode({ onBack }) {
    const { vocab, setVocab, updateVocabStatus, recordPractice, theme, speak, setIsSessionActive } = useApp();

    // State
    const [queue, setQueue] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [sessionComplete, setSessionComplete] = useState(false);
    const [showSettings, setShowSettings] = useState(true);
    const [cardCount, setCardCount] = useState(5);
    const [customValue, setCustomValue] = useState('');
    const [isCustom, setIsCustom] = useState(false);
    const [exampleIndex, setExampleIndex] = useState(0);

    // Reset example index on word change
    useEffect(() => {
        setExampleIndex(0);
    }, [currentIndex]);

    // Keyboard Navigation - Top level hook
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (showSettings || sessionComplete || vocab.length === 0) return;

            if (e.key === 'ArrowLeft') {
                handleResponse(false);
            } else if (e.key === 'ArrowRight') {
                handleResponse(true);
            } else if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                setIsFlipped(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showSettings, sessionComplete, currentIndex, isFlipped, vocab.length, queue]);

    // Manage FAB visibility
    useEffect(() => {
        if (!showSettings && !sessionComplete) {
            setIsSessionActive(true);
        } else {
            setIsSessionActive(false);
        }
        return () => setIsSessionActive(false);
    }, [showSettings, sessionComplete, setIsSessionActive]);

    const startSession = (count) => {
        if (vocab.length === 0) return;

        let finalCount = parseInt(count);
        if (isNaN(finalCount) || finalCount <= 0) finalCount = 5;

        const learningQueue = [];
        while (learningQueue.length < finalCount) {
            const needed = finalCount - learningQueue.length;
            const shuffled = [...vocab].sort(() => 0.5 - Math.random());
            learningQueue.push(...shuffled.slice(0, needed));
        }

        setQueue(learningQueue);
        setCardCount(finalCount);
        setShowSettings(false);
        setCurrentIndex(0);
        setIsFlipped(false);
        setSessionComplete(false);
    };

    const handleResponse = (known) => {
        const currentWord = queue[currentIndex];
        if (!currentWord) return;

        if (known) {
            const nextCount = (currentWord.practiceCount || 0) + 1;
            let nextStatus = currentWord.status;
            if (nextCount >= 10) nextStatus = 'mastered';
            else if (nextStatus === 'new') nextStatus = 'learning';

            setVocab(prev => prev.map(v =>
                v.id === currentWord.id ? { ...v, status: nextStatus, practiceCount: nextCount } : v
            ));
            if (nextStatus === 'mastered' && currentWord.status !== 'mastered') {
                updateVocabStatus(currentWord.id, 'mastered');
            }
        }
        recordPractice();

        if (currentIndex < queue.length - 1) {
            setIsFlipped(false);
            setTimeout(() => setCurrentIndex(prev => prev + 1), 250);
        } else {
            setSessionComplete(true);
        }
    };

    if (vocab.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <div className="p-6 bg-[var(--input-bg)] rounded-full mb-4 border border-[var(--border-light)] shadow-sm">
                    <RotateCw size={40} className="text-[var(--primary)]" />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-main)]">No words yet!</h3>
                <button onClick={onBack} className="mt-6 bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text-main)] px-8 py-3 rounded-xl font-bold border border-[var(--border-light)]">Back to Home</button>
            </div>
        );
    }

    if (showSettings) {
        return (
            <div className="max-w-xl mx-auto flex flex-col items-center justify-center min-h-[70vh] py-12 animate-in fade-in zoom-in-95 duration-500">
                <h3 className="text-3xl font-black text-[var(--text-main)] mb-2">Time to Practice</h3>
                <p className="text-[var(--text-muted)] font-bold mb-1 text-center">How many words do you want to master today?</p>
                <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.2em] mb-10 bg-[var(--input-bg)] px-4 py-1.5 rounded-full border border-[var(--border-light)]">{vocab.length} words in your collection</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full mb-10">
                    {[5, 7, 10, 15].map(count => (
                        <button
                            key={count}
                            onClick={() => { setCardCount(count); setIsCustom(false); }}
                            className={`p-6 rounded-[28px] border-2 transition-all flex flex-col items-center gap-2 group ${!isCustom && cardCount === count
                                ? 'bg-[var(--primary)] border-[var(--primary)] text-white shadow-xl shadow-primary/20 scale-105'
                                : 'bg-[var(--bg-card)] border-[var(--border-light)] text-[var(--text-muted)] hover:border-[var(--primary)]/50'}`}
                        >
                            <span className="text-2xl font-black">{count}</span>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${!isCustom && cardCount === count ? 'opacity-100' : 'opacity-50'}`}>Cards</span>
                        </button>
                    ))}
                    <div
                        className={`p-4 rounded-[28px] border-2 transition-all flex flex-col items-center justify-center gap-2 relative col-span-2 sm:col-span-1 min-h-[105px] ${isCustom
                            ? 'bg-[var(--primary)] border-[var(--primary)] text-white shadow-xl shadow-primary/20 scale-105'
                            : 'bg-[var(--bg-card)] border-[var(--border-light)] text-[var(--text-muted)] hover:border-[var(--primary)]/50'}`}
                        onClick={() => setIsCustom(true)}
                    >
                        {isCustom ? (
                            <input
                                autoFocus
                                type="number"
                                value={customValue}
                                onChange={(e) => setCustomValue(e.target.value)}
                                placeholder="0"
                                className="w-full bg-transparent text-center text-2xl font-black placeholder-white/50 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                        ) : null}
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isCustom ? 'opacity-100' : 'opacity-50'}`}>Custom</span>
                    </div>
                </div>

                <div className="flex flex-col gap-4 w-full">
                    <button
                        onClick={() => startSession(isCustom ? customValue : cardCount)}
                        className="w-full py-5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-3xl font-black flex items-center justify-center gap-3 shadow-xl shadow-primary/20 transition-all active:scale-95 group uppercase tracking-widest text-sm"
                    >
                        <Play size={20} className="fill-current" /> Begin
                    </button>
                </div>
            </div>
        );
    }

    if (sessionComplete) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-in zoom-in duration-300">
                <div className="w-24 h-24 bg-yellow-400/10 rounded-full flex items-center justify-center mb-6 border border-yellow-400/20 shadow-xl"><span className="text-5xl">🏆</span></div>
                <h3 className="text-3xl font-bold text-[var(--text-main)] mb-2">Session Complete!</h3>
                <p className="text-[var(--text-muted)] mb-8 font-bold">Great job practicing {queue.length} words today.</p>
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                    <button onClick={() => setShowSettings(true)} className="flex-1 bg-[var(--primary)] text-white p-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95">
                        <RotateCw size={18} /> New Session
                    </button>
                    <button onClick={onBack} className="flex-1 bg-[var(--input-bg)] p-4 rounded-2xl font-black border border-[var(--border-light)] transition-all">Finish</button>
                </div>
            </div>
        );
    }

    const currentWord = queue[currentIndex];
    if (!currentWord) return null;

    return (
        <div className="max-w-4xl mx-auto flex flex-col items-center min-h-[calc(100vh-140px)] justify-center py-6">
            {/* Header / Progress bar */}
            <div className="w-full max-w-xl mb-10 overflow-hidden">
                <div className="flex justify-between items-center mb-4 px-2">
                    <div className="flex flex-col">
                        <span className="text-2xl font-black text-[var(--text-main)] tracking-tighter">
                            {currentIndex + 1} <span className="text-[var(--text-muted)] opacity-40 text-lg">/ {queue.length}</span>
                        </span>
                        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1">Practice Session</span>
                    </div>
                    <div className="text-right">
                        <div className="text-xl font-black text-[var(--primary)]">{Math.round(((currentIndex) / queue.length) * 100)}%</div>
                        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1">Accuracy Goal</span>
                    </div>
                </div>
                <div className="w-full bg-[var(--input-bg)] h-3 rounded-full overflow-hidden border border-[var(--border-light)] p-0.5 shadow-inner">
                    <div
                        className="bg-gradient-to-r from-[var(--primary)] to-indigo-500 h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"
                        style={{ width: `${((currentIndex + 1) / queue.length) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Main Area: Vertical Stack (Card + Example) */}
            <div className="flex flex-col items-center gap-6 w-full max-w-xl">
                {/* Flashcard Container */}
                <div
                    className="relative perspective-1000 h-[340px] w-full cursor-pointer group"
                    onClick={() => setIsFlipped(!isFlipped)}
                >
                    <div className={`relative w-full h-full text-center transition-transform duration-700 transform-style-3d shadow-2xl rounded-[40px] ${isFlipped ? 'rotate-y-180' : ''}`}>
                        {/* Front Side: English Word */}
                        <div className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-8 bg-white dark:bg-[var(--bg-card)] text-[var(--text-main)] rounded-[40px] border border-[var(--border-light)] shadow-xl overflow-hidden">
                            <div className="absolute -right-4 -top-4 opacity-5 rotate-12 text-[var(--primary)]"><Zap size={160} /></div>
                            <span className="absolute top-10 text-[10px] font-black text-[var(--primary)] uppercase tracking-[0.3em]">English Word</span>

                            <button
                                onClick={(e) => { e.stopPropagation(); speak(currentWord.word); }}
                                className="absolute top-6 right-6 p-4 bg-[var(--primary)]/10 text-[var(--primary)] rounded-2xl hover:bg-[var(--primary)]/20 transition-all z-20 group/btn"
                            >
                                <Volume2 size={20} className="group-hover/btn:scale-110 transition-transform" />
                            </button>

                            <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-4 text-[var(--text-main)]">{currentWord.word}</h2>

                            <div className="absolute bottom-10 flex flex-col items-center gap-2 opacity-50 bg-[var(--input-bg)] px-6 py-2 rounded-full">
                                <RotateCw size={14} className="animate-spin-slow text-[var(--primary)]" />
                                <p className="text-[10px] font-black tracking-[0.2em] uppercase text-[var(--text-muted)]">Press Space to flip</p>
                            </div>
                        </div>

                        {/* Back Side: Indonesian Meaning */}
                        <div className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center p-8 bg-white dark:bg-[var(--bg-card)] border-4 border-[var(--primary)]/20 text-[var(--text-main)] rounded-[40px] shadow-xl">
                            <span className="absolute top-10 text-[10px] font-black text-[var(--primary)] uppercase tracking-[0.2em]">Indonesian</span>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-2 text-center leading-tight">
                                {currentWord.meaning.toLowerCase()}
                            </h2>
                            <p className="absolute bottom-10 text-[var(--text-muted)] text-[10px] font-black tracking-widest uppercase opacity-30">Press Space to flip back</p>
                        </div>
                    </div>
                </div>

                {/* Example Box (Collapsible BELOW) */}
                <div className={`w-full transition-all duration-500 ease-in-out overflow-hidden ${isFlipped ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0 pointer-events-none'}`}>
                    {currentWord.example && (
                        <div className="bg-white dark:bg-[var(--bg-card)] p-6 rounded-[32px] shadow-2xl relative overflow-hidden group/ex">
                            {/* Decorative line */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-red-500 opacity-40"></div>

                            {(() => {
                                const examples = currentWord.example.split('|||').filter(ex => ex.trim());
                                const currentEx = examples[exampleIndex] || examples[0];
                                const match = currentEx.match(/(.*)\s\((.*)\)/);

                                return (
                                    <div className="relative">
                                        <div className="transition-all duration-300">
                                            {match ? (
                                                <div className="space-y-3">
                                                    <p className="text-lg font-black italic text-[var(--text-main)] leading-tight">
                                                        "{match[1]}"
                                                    </p>
                                                    <p className="text-[13px] font-bold text-[var(--text-muted)] opacity-60 leading-relaxed bg-[var(--bg-app)]/50 p-3 rounded-xl border-l-4 border-orange-500/30">
                                                        {match[2]}
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className="text-base font-bold italic text-[var(--text-main)] leading-relaxed">"{currentEx}"</p>
                                            )}
                                        </div>

                                        {examples.length > 1 && (
                                            <div className="flex items-center justify-between mt-5 pt-4 border-t border-[var(--border-light)]/40">
                                                <div className="flex gap-1">
                                                    {examples.map((_, i) => (
                                                        <div
                                                            key={i}
                                                            className={`h-1.5 rounded-full transition-all duration-300 ${i === exampleIndex ? 'w-5 bg-orange-500' : 'w-1.5 bg-[var(--border-light)]'}`}
                                                        />
                                                    ))}
                                                </div>
                                                <div className="flex gap-1.5Scale">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setExampleIndex(prev => Math.max(0, prev - 1)); }}
                                                        disabled={exampleIndex === 0}
                                                        className={`p-1.5 rounded-lg transition-all ${exampleIndex === 0 ? 'opacity-10' : 'bg-[var(--bg-app)] hover:bg-orange-500/10 text-orange-500'}`}
                                                    >
                                                        <ChevronLeft size={16} strokeWidth={3} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setExampleIndex(prev => Math.min(examples.length - 1, prev + 1)); }}
                                                        disabled={exampleIndex === examples.length - 1}
                                                        className={`p-1.5 rounded-lg transition-all ${exampleIndex === examples.length - 1 ? 'opacity-10' : 'bg-[var(--bg-app)] hover:bg-orange-500/10 text-orange-500'}`}
                                                    >
                                                        <ChevronRight size={16} strokeWidth={3} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    )}
                </div>
            </div>

            {/* Response Control Area */}
            <div className="flex flex-col items-center gap-6 mt-12 w-full max-w-xl">
                <div className="flex gap-6 w-full">
                    <button
                        onClick={(e) => { e.stopPropagation(); handleResponse(false); }}
                        className="flex-1 py-7 rounded-[32px] border-2 border-[var(--border-light)] text-[var(--text-muted)] font-black hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30 transition-all shadow-sm bg-[var(--bg-card)] flex flex-col items-center justify-center gap-2 group active:scale-95"
                    >
                        <div className="flex items-center gap-3"><X size={28} /> <span className="text-lg uppercase tracking-wider">Retry</span></div>

                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleResponse(true); }}
                        className="flex-1 py-7 rounded-[32px] bg-emerald-500 text-white font-black hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 transition-all flex flex-col items-center justify-center gap-2 group active:scale-95 border-none"
                    >
                        <div className="flex items-center gap-3"><Check size={28} /> <span className="text-lg uppercase tracking-wider">Got It</span></div>

                    </button>
                </div>


            </div>
        </div>
    );
}

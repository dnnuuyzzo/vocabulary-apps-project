import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Play, Pause, SkipBack, SkipForward, Headphones, Search, Shuffle, Repeat } from 'lucide-react';

export default function ListenMode({ onBack }) {
    const {
        vocab,
        logActivity,
        // Global Audio State
        isAudioPlaying,
        setIsAudioPlaying,
        currentAudioIndex,
        setCurrentAudioIndex,
        audioPlaybackSpeed,
        setAudioPlaybackSpeed,
        isAudioShuffle,
        setIsAudioShuffle,
        isAudioRepeat,
        setIsAudioRepeat,
        isMiniPlayerVisible,
        setIsMiniPlayerVisible
    } = useApp();

    const [searchQuery, setSearchQuery] = useState('');
    const [isSpeedOpen, setIsSpeedOpen] = useState(false);

    const displayVocab = vocab.filter(v =>
        v.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.meaning.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeWord = vocab[currentAudioIndex]; // Use global index from full vocab

    const handleTogglePlay = () => {
        if (vocab.length === 0) return;
        const nextState = !isAudioPlaying;
        setIsAudioPlaying(nextState);
        setIsMiniPlayerVisible(true); // Show mini player when playing
        if (nextState) {
            logActivity('listening');
        }
    };

    const handleNext = () => {
        if (isAudioShuffle) {
            let nextIndex;
            do {
                nextIndex = Math.floor(Math.random() * vocab.length);
            } while (nextIndex === currentAudioIndex && vocab.length > 1);
            setCurrentAudioIndex(nextIndex);
        } else if (currentAudioIndex < vocab.length - 1) {
            setCurrentAudioIndex(prev => prev + 1);
        } else if (isAudioRepeat) {
            setCurrentAudioIndex(0);
        }
    };

    const handlePrev = () => {
        if (currentAudioIndex > 0) {
            setCurrentAudioIndex(prev => prev - 1);
        } else if (isAudioRepeat) {
            setCurrentAudioIndex(vocab.length - 1);
        }
    };

    if (vocab.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <div className="p-6 bg-[var(--input-bg)] rounded-full mb-4 border border-[var(--border-light)]">
                    <Headphones size={40} className="text-[var(--text-muted)]" />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-main)]">Your library is empty</h3>
                <p className="text-[var(--text-muted)] mt-2">Add some words first to start listening.</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Listen & Learn</h2>
                <p className="text-[var(--text-muted)] font-medium">Sit back and listen to your vocabulary library.</p>
            </div>

            {/* Player View */}
            <div className="premium-card p-8 md:p-12 shadow-2xl relative overflow-hidden bg-[var(--bg-card)]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                    {/* Index Indicator */}
                    <div className="px-4 py-1.5 rounded-full bg-[var(--input-bg)] border border-[var(--border-light)] text-[var(--text-muted)] text-xs font-black uppercase tracking-widest">
                        Word {currentAudioIndex + 1} of {vocab.length}
                    </div>

                    {/* Word Display */}
                    <div className="h-56 flex flex-col justify-center items-center gap-10">
                        <h1 className="text-4xl md:text-6xl font-black text-[var(--text-main)] tracking-tight transition-all duration-300">
                            {activeWord?.word}
                        </h1>
                        <p className={`text-xl md:text-3xl font-bold text-[var(--primary)] transition-all duration-500 delay-300 ${isAudioPlaying ? 'opacity-100' : 'opacity-40'}`}>
                            {activeWord?.meaning?.toLowerCase()}
                        </p>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-4 md:gap-10">
                        {/* Speed Selector */}
                        <div className="relative">
                            <button
                                onClick={() => setIsSpeedOpen(!isSpeedOpen)}
                                className="w-12 h-12 rounded-xl bg-[var(--input-bg)] border border-[var(--border-light)] flex items-center justify-center text-xs font-black text-[var(--text-main)] hover:border-[var(--primary)] transition-all shadow-sm active:scale-95"
                            >
                                {audioPlaybackSpeed}x
                            </button>

                            {isSpeedOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsSpeedOpen(false)}></div>
                                    <div className="absolute bottom-full left-0 mb-2 w-20 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                                        {[0.5, 0.75, 1, 2].map(speed => (
                                            <button
                                                key={speed}
                                                onClick={() => { setAudioPlaybackSpeed(speed); setIsSpeedOpen(false); }}
                                                className={`w-full py-2.5 text-xs font-bold transition-all hover:bg-[var(--bg-hover)]
                                                    ${audioPlaybackSpeed === speed ? 'text-[var(--primary)] bg-[var(--primary)]/5' : 'text-[var(--text-muted)]'}
                                                `}
                                            >
                                                {speed}x
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Shuffle Button */}
                            <button
                                onClick={() => setIsAudioShuffle(!isAudioShuffle)}
                                className={`p-2 rounded-lg transition-all ${isAudioShuffle ? 'text-[var(--primary)] bg-[var(--primary)]/10' : 'text-[var(--text-muted)]'}`}
                                title="Shuffle"
                            >
                                <Shuffle size={20} />
                            </button>

                            <button
                                onClick={handlePrev}
                                className="p-3 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all active:scale-90"
                            >
                                <SkipBack size={32} fill="currentColor" />
                            </button>

                            <button
                                onClick={handleTogglePlay}
                                className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-95 ${isAudioPlaying
                                    ? 'bg-[var(--bg-card)] border-4 border-[var(--primary)] text-[var(--primary)]'
                                    : 'bg-[var(--primary)] text-white'
                                    }`}
                            >
                                {isAudioPlaying ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" className="ml-1" />}
                            </button>

                            <button
                                onClick={handleNext}
                                className="p-3 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all active:scale-90"
                            >
                                <SkipForward size={32} fill="currentColor" />
                            </button>

                            {/* Repeat Button */}
                            <button
                                onClick={() => setIsAudioRepeat(!isAudioRepeat)}
                                className={`p-2 rounded-lg transition-all ${isAudioRepeat ? 'text-[var(--primary)] bg-[var(--primary)]/10' : 'text-[var(--text-muted)]'}`}
                                title="Repeat"
                            >
                                <Repeat size={20} />
                            </button>
                        </div>

                        {/* Spacer for symmetry */}
                        <div className="w-12 h-12 hidden md:block"></div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full space-y-2">
                        <div className="w-full bg-[var(--input-bg)] h-2 rounded-full overflow-hidden border border-[var(--border-light)]">
                            <div
                                className="bg-[var(--primary)] h-full transition-all duration-300"
                                style={{ width: `${((currentAudioIndex + 1) / vocab.length) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Word Queue List */}
            <div className="premium-card p-6 space-y-4">
                <div className="flex justify-between items-center">
                    <h4 className="font-bold text-[var(--text-main)]">Coming Up Next</h4>
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentIndex(0); }}
                            className="pl-8 pr-4 py-1.5 bg-[var(--input-bg)] border border-[var(--border-light)] rounded-lg text-xs outline-none focus:border-[var(--primary)]/50 w-32 transition-all"
                        />
                    </div>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-2 pr-2 scrollbar-hide">
                    {vocab.map((v, i) => (
                        <div
                            key={v.id}
                            onClick={() => { setCurrentAudioIndex(i); setIsAudioPlaying(true); setIsMiniPlayerVisible(true); }}
                            className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${i === currentAudioIndex
                                ? 'bg-[var(--primary)]/10 border-[var(--primary)]/30 text-[var(--primary)]'
                                : 'bg-[var(--input-bg)]/50 border-[var(--border-light)] hover:bg-[var(--bg-hover)]'
                                }`}
                        >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${i === currentAudioIndex ? 'bg-[var(--primary)] text-white' : 'bg-[var(--input-bg)] text-[var(--text-muted)]'}`}>
                                {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold truncate text-sm">{v.word}</p>
                                <p className="text-[var(--text-muted)] text-[10px] truncate">{v.meaning}</p>
                            </div>
                            {i === currentAudioIndex && isAudioPlaying && (
                                <div className="flex gap-1 items-end h-4">
                                    <div className="w-1 bg-[var(--primary)] animate-bounce" style={{ animationDuration: '0.5s' }}></div>
                                    <div className="w-1 bg-[var(--primary)] animate-bounce" style={{ animationDuration: '0.8s' }}></div>
                                    <div className="w-1 bg-[var(--primary)] animate-bounce" style={{ animationDuration: '0.6s' }}></div>
                                </div>
                            )}
                        </div>
                    ))}
                    {vocab.length === 0 && (
                        <p className="text-center py-4 text-xs text-[var(--text-muted)] font-medium">No matches found.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

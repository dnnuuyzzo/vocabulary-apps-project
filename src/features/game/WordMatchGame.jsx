import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Play, RotateCcw, PartyPopper, CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function WordMatchGame() {
    const { vocab, recordPractice, recordBestScore, progress } = useApp();
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [selected, setSelected] = useState([]); // [id, type]
    const [matched, setMatched] = useState([]); // [id]
    const [isPlaying, setIsPlaying] = useState(false);
    const [timeLeft, setTimeLeft] = useState(90); // 90s for this one as it takes longer
    const [score, setScore] = useState(0);

    useEffect(() => {
        if (!isPlaying) return;
        if (timeLeft <= 0) {
            setIsPlaying(false);
            if (score > 0) recordBestScore('wordMatch', score);
            return;
        }
        const interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
        return () => clearInterval(interval);
    }, [isPlaying, timeLeft, score, recordBestScore]);

    // Check board completion
    useEffect(() => {
        if (isPlaying && items.length > 0 && matched.length === items.length / 2) {
            // Board Cleared
            setTimeout(nextBoard, 500);
        }
    }, [matched, items, isPlaying]);

    const startGame = () => {
        if (vocab.length < 4) return;
        setScore(0);
        setTimeLeft(90);
        setIsPlaying(true);
        nextBoard();
    };

    const nextBoard = () => {
        // Pick 6 random words (reduced from 8 for faster rotation/mobile friendly)
        const gameVocab = [...vocab].sort(() => 0.5 - Math.random()).slice(0, 6);

        // Create cards: English and Meaning separate
        const cards = gameVocab.flatMap(v => [
            { id: v.id, text: v.word, type: 'eng', matchId: v.id },
            { id: v.id + '_meaning', text: v.meaning, type: 'ind', matchId: v.id }
        ]);

        setItems(cards.sort(() => 0.5 - Math.random()));
        setMatched([]);
        setSelected([]);
    };

    const handleCardClick = (card) => {
        // If already matched or selected, ignore
        if (matched.includes(card.matchId) || selected.some(s => s.id === card.id)) return;

        const newSelected = [...selected, card];
        setSelected(newSelected);

        if (newSelected.length === 2) {
            const [first, second] = newSelected;
            if (first.matchId === second.matchId) {
                // Match!
                setMatched(prev => [...prev, first.matchId]);
                setSelected([]);
                setScore(s => s + 1);
                recordPractice('game');
            } else {
                // No match, clear after delay
                setTimeout(() => setSelected([]), 1000);
            }
        }
    };

    // const isComplete = isPlaying && items.length > 0 && matched.length === items.length / 2;
    // No longer needed as we auto-rotate

    if (vocab.length < 4) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <div className="w-20 h-20 bg-[var(--input-bg)] rounded-full flex items-center justify-center mb-6 border border-[var(--border-light)] shadow-sm">
                    <Play size={40} className="text-[var(--text-muted)]" />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-main)]">Not enough content</h3>
                <p className="text-[var(--text-muted)] mt-2">Add at least 4 words to your library to play.</p>
                <button onClick={() => navigate('/game')} className="mt-6 font-bold text-[var(--primary)] hover:underline">Back to Menu</button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex justify-between items-end">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/game')} className="p-2 -ml-2 rounded-full hover:bg-[var(--bg-hover)] text-[var(--text-muted)] transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h2 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Word Match</h2>
                        <p className="text-[var(--text-muted)] font-medium">Match as many pairs as possible in 90s!</p>
                    </div>
                </div>
                {isPlaying && (
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-black text-[var(--primary)] uppercase tracking-widest">Pairs: {score}</span>
                        <div className={`px-6 py-2 rounded-full border shadow-sm ${timeLeft < 10 ? 'bg-red-500/10 border-red-500 text-red-500 animate-pulse' : 'bg-[var(--input-bg)] border-[var(--border-light)]'}`}>
                            <span className="text-2xl font-mono font-black">{timeLeft}s</span>
                        </div>
                    </div>
                )}
            </div>

            {!isPlaying && timeLeft > 0 && (
                <div className="premium-card py-24 text-center shadow-xl">
                    <div className="w-24 h-24 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-[var(--primary)]/20 shadow-inner">
                        <Play size={48} className="text-[var(--primary)] ml-2" />
                    </div>
                    <h3 className="text-2xl font-extrabold text-[var(--text-main)] mb-2 tracking-tight">Test your speed!</h3>
                    <p className="text-[var(--text-muted)] mb-10 max-w-sm mx-auto">See how many pairs you can match in 90s.</p>

                    {progress?.bestRecords?.wordMatch && (
                        <div className="mb-8 flex flex-col items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Best Score</span>
                            <span className="text-xl font-black text-[var(--primary)]">{progress.bestRecords.wordMatch} pairs</span>
                        </div>
                    )}

                    <button
                        onClick={startGame}
                        className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-12 py-4 rounded-2xl font-black text-lg shadow-lg transition-all active:scale-95"
                    >
                        Start Game
                    </button>
                </div>
            )}

            {!isPlaying && timeLeft <= 0 && (
                <div className="premium-card py-20 text-center shadow-2xl animate-in zoom-in duration-300">
                    <div className="w-24 h-24 bg-[var(--success)]/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-[var(--success)]/20 shadow-xl">
                        <PartyPopper size={48} className="text-[var(--success)]" />
                    </div>
                    <h3 className="text-4xl font-black text-[var(--text-main)] mb-2 tracking-tight">Time's Up!</h3>
                    <p className="text-lg text-[var(--text-muted)] mb-10">You matched <span className="font-black text-[var(--primary)] text-2xl">{score}</span> pairs.</p>
                    <button
                        onClick={startGame}
                        className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-10 py-4 rounded-2xl font-black text-lg shadow-lg flex items-center gap-3 mx-auto transition-all active:scale-95"
                    >
                        <RotateCcw size={24} /> Play Again
                    </button>
                </div>
            )}

            {isPlaying && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {items.map(card => {
                        const isSelected = selected.some(s => s.id === card.id);
                        const isMatched = matched.includes(card.matchId);
                        const isError = isSelected && selected.length === 2 && selected[0].matchId !== selected[1].matchId;

                        if (isMatched) return (
                            <div key={card.id} className="h-32 rounded-2xl flex items-center justify-center bg-[var(--success)]/5 border-2 border-dashed border-[var(--success)]/20 transition-all scale-95 opacity-40">
                                <CheckCircle size={32} className="text-[var(--success)]" />
                            </div>
                        );

                        let stateClass = "bg-[var(--bg-card)] border-[var(--border-light)] text-[var(--text-main)] hover:border-[var(--primary)]/50 hover:shadow-md hover:-translate-y-1 shadow-sm";

                        if (isError) stateClass = "bg-[var(--error)] border-[var(--error)] text-white animate-shake shadow-lg scale-105";
                        else if (isSelected) stateClass = "bg-[var(--primary)] border-[var(--primary)] text-white scale-110 shadow-xl z-10 font-black";

                        return (
                            <div
                                key={card.id}
                                onClick={() => handleCardClick(card)}
                                className={`h-32 rounded-2xl flex items-center justify-center p-4 text-center cursor-pointer font-bold transition-all transform duration-300 select-none border-2 text-sm md:text-base ${stateClass}`}
                            >
                                {card.text}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

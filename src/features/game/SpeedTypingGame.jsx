import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, Zap, PartyPopper, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SpeedTypingGame() {
    const { vocab, recordPractice, recordBestScore, progress } = useApp();
    const navigate = useNavigate();

    const [targetWord, setTargetWord] = useState(null);
    const [input, setInput] = useState('');
    const [time, setTime] = useState(0);
    const [totalTime, setTotalTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [round, setRound] = useState(0);
    const [feedback, setFeedback] = useState(null); // 'correct', 'wrong', null

    const [timeLeft, setTimeLeft] = useState(60);

    useEffect(() => {
        if (!isPlaying) return;
        if (timeLeft <= 0) {
            setIsPlaying(false);
            if (score > 0) recordBestScore('speedTyping', score);
            return;
        }
        const interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
        return () => clearInterval(interval);
    }, [isPlaying, timeLeft, score, recordBestScore]);

    useEffect(() => {
        if (isPlaying && !targetWord && vocab.length >= 5) {
            nextRound();
        }
    }, [isPlaying, targetWord, vocab]);

    const startGame = () => {
        if (vocab.length < 5) return;
        setRound(0);
        setScore(0);
        setTimeLeft(60);
        setIsPlaying(true);
        setTargetWord(null);
        setFeedback(null);
    };

    const nextRound = () => {
        // Infinite rounds
        const randomWord = vocab[Math.floor(Math.random() * vocab.length)];
        setTargetWord(randomWord);
        setInput('');
        setFeedback(null);
        setRound(r => r + 1);
    };

    const handleSkip = () => {
        nextRound();
        // Maybe small penalty? Or just no points.
    };


    const handleInputChange = (e) => {
        const val = e.target.value;
        setInput(val);

        if (val.trim().toLowerCase() === targetWord.word.toLowerCase()) {
            // Correct!
            setScore(s => s + 1);
            setFeedback('correct');
            recordPractice('game');
            setTimeout(nextRound, 1000);
        }
    };

    if (vocab.length < 5) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <Zap size={40} className="text-[var(--text-muted)] mb-4" />
                <h3 className="text-xl font-bold text-[var(--text-main)]">Not enough content</h3>
                <p className="text-[var(--text-muted)] mt-2">Add at least 5 words to play Speed Typing.</p>
                <button onClick={() => navigate('/game')} className="mt-6 font-bold text-[var(--primary)] hover:underline">Back to Menu</button>
            </div>
        );
    }

    if (!isPlaying && score > 0 && timeLeft === 0) {
        return (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 text-center pt-20">
                <PartyPopper size={64} className="text-[var(--success)] mx-auto mb-6" />
                <h2 className="text-4xl font-black text-[var(--text-main)]">Time's Up!</h2>
                <p className="text-2xl text-[var(--text-muted)] mt-2">Total Score: <span className="text-[var(--primary)] font-black">{score}</span></p>
                <button onClick={startGame} className="mt-8 bg-[var(--primary)] text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2 mx-auto">
                    <RotateCcw size={20} /> Play Again
                </button>
                <button onClick={() => navigate('/game')} className="block mt-4 text-[var(--text-muted)] font-bold hover:text-[var(--text-main)] mx-auto">Back to Menu</button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/game')} className="p-2 -ml-2 rounded-full hover:bg-[var(--bg-hover)] text-[var(--text-muted)] transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h2 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Flash-Type Race</h2>
                    <p className="text-[var(--text-muted)] font-medium">Type the word as fast as you can.</p>
                </div>
            </div>

            {!isPlaying ? (
                <div className="premium-card py-24 text-center shadow-xl">
                    <div className="w-24 h-24 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-[var(--primary)]/20 shadow-inner">
                        <Zap size={48} className="text-[var(--primary)] ml-2" />
                    </div>
                    <h3 className="text-2xl font-extrabold text-[var(--text-main)] mb-2 tracking-tight">Need for Speed?</h3>
                    <p className="text-[var(--text-muted)] mb-10 max-w-sm mx-auto">Type as many words as you can in 60s!</p>

                    {progress?.bestRecords?.speedTyping && (
                        <div className="mb-8 flex flex-col items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Best Score</span>
                            <span className="text-xl font-black text-[var(--primary)]">{progress.bestRecords.speedTyping} words</span>
                        </div>
                    )}

                    <button onClick={startGame} className="bg-[var(--primary)] text-white px-12 py-4 rounded-2xl font-black text-lg shadow-lg hover:bg-[var(--primary-hover)] transition-all active:scale-95">Start Game</button>
                </div>
            ) : (
                <div className="max-w-xl mx-auto text-center">
                    <div className="flex justify-between items-center mb-8">
                        <span className="text-sm font-black text-[var(--text-muted)] uppercase tracking-widest">Words: {score}</span>
                        <div className="flex items-center gap-2">
                            <span className={`text-2xl font-black font-mono transition-colors ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-[var(--primary)]'}`}>
                                {timeLeft}s
                            </span>
                        </div>
                    </div>

                    <div className="min-h-[160px] flex flex-col items-center justify-center p-8 bg-[var(--bg-card)] border-2 border-[var(--border-light)] rounded-[32px] mb-8 shadow-sm">
                        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-4">Translate this</span>
                        <p className="text-3xl font-black text-[var(--text-main)] leading-tight">
                            "{targetWord?.meaning}"
                        </p>
                    </div>

                    <div className="relative">
                        <input
                            autoFocus
                            type="text"
                            value={input}
                            onChange={handleInputChange}
                            disabled={feedback !== null}
                            placeholder="Type English word..."
                            className={`w-full p-6 text-center text-3xl font-black rounded-2xl border-2 focus:outline-none transition-all placeholder-[var(--text-muted)]/20
                                ${feedback === 'correct' ? 'bg-green-500/10 border-green-500 text-green-500' :
                                    feedback === 'wrong' ? 'bg-red-500/10 border-red-500 text-red-500' :
                                        'bg-[var(--input-bg)] border-[var(--border-light)] focus:border-[var(--primary)] text-[var(--text-main)]'}
                            `}
                        />
                        {feedback === 'wrong' && (
                            <p className="mt-4 text-red-500 font-bold animate-in fade-in">Time's up! Answer: {targetWord?.word}</p>
                        )}
                        {/* Skip Button */}
                        <div className="absolute right-2 top-2">
                            <button onClick={handleSkip} className="text-[10px] font-bold text-[var(--text-muted)] hover:text-[var(--primary)] uppercase tracking-widest p-2">Skip</button>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}

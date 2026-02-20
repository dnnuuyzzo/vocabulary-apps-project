import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Play, RotateCcw, PartyPopper, CheckCircle, ArrowLeft, Shuffle, Clock, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function WordScrambleGame() {
    const { vocab, recordPractice, recordBestScore, progress } = useApp();
    const navigate = useNavigate();
    const [word, setWord] = useState(null);
    const [scrambled, setScrambled] = useState([]);
    const [userGuess, setUserGuess] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [round, setRound] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60); // 1 minute time attack
    const [gameTime, setGameTime] = useState(0);
    const [consecutiveWins, setConsecutiveWins] = useState(0);

    // Timer Logic
    useEffect(() => {
        if (!isPlaying) return;
        if (timeLeft <= 0) {
            setIsPlaying(false);
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft(t => t - 1);
            setGameTime(t => t + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [isPlaying, timeLeft]);

    // Initialize letters
    useEffect(() => {
        if (isPlaying && !word && vocab.length >= 5) {
            nextRound();
        }
    }, [isPlaying, word, vocab]);

    const startGame = () => {
        if (vocab.length < 5) return;
        setRound(0); // Used only for tracking "Words Solved" count effectively
        setScore(0);
        setTimeLeft(60);
        setGameTime(0);
        setConsecutiveWins(0);
        setIsPlaying(true);
        setWord(null); // Triggers effect to start first round
    };

    const nextRound = () => {
        // Infinite rounds until time is up

        // Pick random word
        const randomWord = vocab[Math.floor(Math.random() * vocab.length)];
        setWord(randomWord);

        // Create scrambled letters with distractors
        const wordChars = randomWord.word.toUpperCase().split('');
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

        // Generate 3-5 distractors
        const numDistractors = Math.floor(Math.random() * 3) + 3;
        const distractors = [];
        while (distractors.length < numDistractors) {
            const char = alphabet[Math.floor(Math.random() * alphabet.length)];
            if (!wordChars.includes(char) && !distractors.includes(char)) {
                distractors.push(char);
            }
        }

        const allChars = [...wordChars, ...distractors];
        const letters = allChars
            .map((char, index) => ({ id: `${index}-${char}-${Date.now()}`, char }))
            .sort(() => 0.5 - Math.random());

        setScrambled(letters);
        setUserGuess([]);
        setRound(r => r + 1);
    };

    const handleLetterClick = (letter) => {
        // Move from scrambled to guess
        setScrambled(prev => prev.filter(l => l.id !== letter.id));
        setUserGuess(prev => [...prev, letter]);
    };

    const handleGuessClick = (letter) => {
        // Move back from guess to scrambled
        setUserGuess(prev => prev.filter(l => l.id !== letter.id));
        setScrambled(prev => [...prev, letter]);
    };

    const checkAnswer = () => {
        const currentGuess = userGuess.map(l => l.char).join('');
        if (currentGuess === word.word.toUpperCase()) {
            setScore(s => s + 1);
            recordPractice('game');

            // Streak Logic
            setConsecutiveWins(prev => {
                const newStreak = prev + 1;
                if (newStreak % 5 === 0) {
                    setTimeLeft(t => t + 10); // Bonus time
                }
                return newStreak;
            });

            // Small delay before next round to show success
            setTimeout(nextRound, 1000);
        } else {
            // Shake effect or feedback (simplified: reset and break streak)
            const allLetters = [...userGuess, ...scrambled];
            setScrambled(allLetters.sort(() => 0.5 - Math.random()));
            setUserGuess([]);
            setConsecutiveWins(0);
        }
    };

    // Check if guess is correct automatically when all letters are used
    useEffect(() => {
        if (word && userGuess.length === word.word.length) {
            const currentGuess = userGuess.map(l => l.char).join('');
            if (currentGuess === word.word.toUpperCase()) {
                setScore(s => s + 1);
                recordPractice('game');

                // Streak Logic
                setConsecutiveWins(prev => {
                    const newStreak = prev + 1;
                    if (newStreak % 5 === 0) {
                        setTimeLeft(t => t + 10); // Bonus time
                    }
                    return newStreak;
                });

                setTimeout(() => {
                    nextRound();
                }, 500);
            }
        }
    }, [userGuess, word]);

    if (vocab.length < 5) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <Shuffle size={40} className="text-[var(--text-muted)] mb-4" />
                <h3 className="text-xl font-bold text-[var(--text-main)]">Not enough words</h3>
                <p className="text-[var(--text-muted)] mt-2">Add at least 5 words to play Word Scramble.</p>
                <button onClick={() => navigate('/game')} className="mt-6 font-bold text-[var(--primary)] hover:underline">Back to Menu</button>
            </div>
        );
    }

    // Game Over Screen
    if (!isPlaying && score > 0 && timeLeft === 0) {
        // Record best score only when game ends naturally
        recordBestScore('wordScramble', score);

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
                    <h2 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Word Scramble</h2>
                    <p className="text-[var(--text-muted)] font-medium">Unscramble the letters to find the word.</p>
                </div>
            </div>

            {!isPlaying ? (
                <div className="premium-card py-24 text-center shadow-xl">
                    <div className="w-24 h-24 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-[var(--primary)]/20 shadow-inner">
                        <Shuffle size={48} className="text-[var(--primary)] ml-2" />
                    </div>
                    <h3 className="text-2xl font-extrabold text-[var(--text-main)] mb-2 tracking-tight">Time Attack Mode</h3>
                    <p className="text-[var(--text-muted)] mb-10 max-w-sm mx-auto">Unscramble as many words as you can in 60s!</p>

                    {progress?.bestRecords?.wordScramble && (
                        <div className="mb-8 flex flex-col items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Best Score</span>
                            <span className="text-xl font-black text-[var(--primary)]">{progress.bestRecords.wordScramble} words</span>
                        </div>
                    )}

                    <button onClick={startGame} className="bg-[var(--primary)] text-white px-12 py-4 rounded-2xl font-black text-lg shadow-lg hover:bg-[var(--primary-hover)] transition-all active:scale-95">Start Game</button>
                </div>
            ) : (
                <div className="text-center max-w-2xl mx-auto">
                    <div className="flex justify-between items-center mb-12">
                        <span className="text-sm font-black text-[var(--text-muted)] uppercase tracking-widest">Words: {score}</span>
                        <div className="flex items-center gap-4">
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${timeLeft < 20 ? 'bg-red-500/10 text-red-500 animate-pulse' : 'bg-[var(--input-bg)] text-[var(--text-muted)]'}`}>
                                <Clock size={16} />
                                <span className="font-black font-mono">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                            </div>
                            <span className="text-sm font-black text-[var(--primary)] uppercase tracking-widest">Score: {score}</span>
                        </div>
                    </div>

                    {/* Answer Slots - Shows how many letters are needed */}
                    <div className="mb-12 flex justify-center gap-2 flex-wrap min-h-[80px] items-center">
                        {word && Array.from({ length: word.word.length }).map((_, index) => {
                            const letter = userGuess[index];
                            return (
                                <button
                                    key={index}
                                    onClick={() => letter && handleGuessClick(letter)}
                                    className={`w-12 h-14 md:w-14 md:h-16 rounded-xl flex items-center justify-center font-black text-2xl shadow-lg transition-all duration-300 transform
                                        ${letter
                                            ? 'bg-[var(--primary)] text-white border-b-4 border-blue-700 active:translate-y-1 active:border-b-0 scale-100 rotate-0'
                                            : 'bg-[var(--bg-card)]/50 border-2 border-dashed border-[var(--border-light)] text-transparent scale-90'
                                        }
                                    `}
                                >
                                    {letter ? letter.char : ''}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex justify-center gap-3 flex-wrap">
                        {scrambled.map((l) => (
                            <button
                                key={l.id}
                                onClick={() => handleLetterClick(l)}
                                className="w-12 h-14 md:w-14 md:h-16 bg-[var(--bg-card)] text-[var(--text-main)] rounded-xl flex items-center justify-center font-black text-2xl border-2 border-[var(--border-light)] shadow-sm hover:border-[var(--primary)] hover:-translate-y-1 transition-all"
                            >
                                {l.char}
                            </button>
                        ))}
                    </div>

                    <div className="mt-16 p-6 bg-[var(--input-bg)] rounded-2xl border border-[var(--border-light)] inline-block relative">
                        {consecutiveWins >= 5 && (
                            <div className="absolute -top-3 -right-3 bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg animate-bounce">
                                <Flame size={10} fill="currentColor" /> {consecutiveWins} Streak
                            </div>
                        )}
                        <p className="text-[var(--text-main)] font-medium italic">"{word?.meaning}"</p>
                    </div>
                </div>
            )}
        </div>
    );
}

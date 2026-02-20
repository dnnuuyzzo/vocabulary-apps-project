import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, Skull, PartyPopper, RotateCcw, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HangmanGame() {
    const { vocab, recordBestScore, progress } = useApp();
    const navigate = useNavigate();

    const [word, setWord] = useState(null);
    const [guessedLetters, setGuessedLetters] = useState(new Set());
    const [lives, setLives] = useState(6);
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [round, setRound] = useState(0);
    const [time, setTime] = useState(0);

    const TOTAL_ROUNDS = 5;
    const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    useEffect(() => {
        let interval;
        if (isPlaying && round < TOTAL_ROUNDS) {
            interval = setInterval(() => setTime(t => t + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, round]);

    useEffect(() => {
        if (isPlaying && !word && vocab.length >= 5) {
            nextRound();
        }
    }, [isPlaying, word, vocab]);

    const startGame = () => {
        if (vocab.length < 5) return;
        setRound(0);
        setScore(0);
        setTime(0);
        setIsPlaying(true);
        setWord(null);
    };

    const nextRound = () => {
        if (round >= TOTAL_ROUNDS) {
            setIsPlaying(false);
            if (score >= TOTAL_ROUNDS) {
                recordBestScore('hangman', time);
            }
            return;
        }

        const randomWord = vocab[Math.floor(Math.random() * vocab.length)];
        setWord(randomWord);
        setGuessedLetters(new Set());
        setLives(6);
        setRound(r => r + 1);
    };

    const handleGuess = (letter) => {
        if (guessedLetters.has(letter) || lives === 0) return;

        const newGuessed = new Set(guessedLetters);
        newGuessed.add(letter);
        setGuessedLetters(newGuessed);

        if (!word.word.toUpperCase().includes(letter)) {
            setLives(l => l - 1);
        }
    };

    // Check win/loss conditions
    useEffect(() => {
        if (!word) return;

        const isWin = word.word.toUpperCase().split('').every(char =>
            !/[A-Z]/.test(char) || guessedLetters.has(char)
        );

        if (isWin) {
            setScore(s => s + 1);
            recordPractice('game');
            setTimeout(nextRound, 1500);
        } else if (lives === 0) {
            setTimeout(nextRound, 1500);
        }
    }, [guessedLetters, lives, word]);


    if (vocab.length < 5) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <Skull size={40} className="text-[var(--text-muted)] mb-4" />
                <h3 className="text-xl font-bold text-[var(--text-main)]">Not enough content</h3>
                <p className="text-[var(--text-muted)] mt-2">Add at least 5 words to play Hangman.</p>
                <button onClick={() => navigate('/game')} className="mt-6 font-bold text-[var(--primary)] hover:underline">Back to Menu</button>
            </div>
        );
    }

    if (!isPlaying && round === TOTAL_ROUNDS && round > 0) {
        return (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 text-center pt-20">
                <PartyPopper size={64} className="text-[var(--success)] mx-auto mb-6" />
                <h2 className="text-4xl font-black text-[var(--text-main)]">Game Over!</h2>
                <p className="text-2xl text-[var(--text-muted)] mt-2">Score: <span className="text-[var(--primary)] font-black">{score}/{TOTAL_ROUNDS}</span></p>
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
                    <h2 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Hangman</h2>
                    <p className="text-[var(--text-muted)] font-medium">Guess the word before you run out of lives.</p>
                </div>
            </div>

            {!isPlaying ? (
                <div className="premium-card py-24 text-center shadow-xl">
                    <div className="w-24 h-24 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-[var(--primary)]/20 shadow-inner">
                        <Skull size={48} className="text-[var(--primary)] ml-2" />
                    </div>
                    <h3 className="text-2xl font-extrabold text-[var(--text-main)] mb-2 tracking-tight">Feeling Lucky?</h3>
                    <p className="text-[var(--text-muted)] mb-10 max-w-sm mx-auto">Save the stickman in {TOTAL_ROUNDS} rounds.</p>

                    {progress?.bestRecords?.hangman && (
                        <div className="mb-8 flex flex-col items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Fastest Record</span>
                            <span className="text-xl font-black text-[var(--primary)]">{progress.bestRecords.hangman}s</span>
                        </div>
                    )}

                    <button onClick={startGame} className="bg-[var(--primary)] text-white px-12 py-4 rounded-2xl font-black text-lg shadow-lg hover:bg-[var(--primary-hover)] transition-all active:scale-95">Start Game</button>
                </div>
            ) : (
                <div className="max-w-3xl mx-auto flex flex-col items-center">
                    <div className="w-full flex justify-between items-center mb-8 px-4">
                        <span className="text-sm font-black text-[var(--text-muted)] uppercase tracking-widest">Round {round}/{TOTAL_ROUNDS}</span>
                        <div className="flex items-center gap-4">
                            <span className="text-2xl font-mono font-black text-[var(--primary)]">{time}s</span>
                            <div className="flex gap-1">
                                {[...Array(6)].map((_, i) => (
                                    <Heart key={i} size={20} className={`transition-colors ${i < lives ? 'text-red-500 fill-red-500' : 'text-[var(--border-light)]'}`} />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="min-h-[160px] flex flex-col items-center justify-center p-8 w-full mb-8">
                        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-4">Hint: Meaning</span>
                        <p className="text-xl md:text-2xl font-bold text-[var(--text-main)] text-center mb-8 opacity-80">
                            "{word?.meaning}"
                        </p>

                        <div className="flex flex-wrap justify-center gap-2">
                            {word?.word.toUpperCase().split('').map((char, i) => (
                                <div key={i} className={`w-10 h-12 md:w-12 md:h-14 flex items-center justify-center text-2xl font-black border-b-4 ${guessedLetters.has(char) || !/[A-Z]/.test(char) ? 'border-[var(--primary)] text-[var(--text-main)]' : 'border-[var(--text-muted)]/20 text-transparent'}`}>
                                    {/[A-Z]/.test(char) ? (guessedLetters.has(char) || lives === 0 ? char : '') : char}
                                </div>
                            ))}
                        </div>
                        {lives === 0 && <p className="text-red-500 font-bold mt-4 animate-in fade-in">Answer: {word?.word}</p>}
                    </div>

                    <div className="grid grid-cols-7 gap-2 md:gap-3">
                        {ALPHABET.map((letter) => {
                            const isGuessed = guessedLetters.has(letter);
                            const isCorrect = isGuessed && word?.word.toUpperCase().includes(letter);
                            const isWrong = isGuessed && !word?.word.toUpperCase().includes(letter);

                            let btnClass = "bg-[var(--bg-card)] text-[var(--text-main)] border-2 border-[var(--border-light)] hover:border-[var(--primary)]";
                            if (isCorrect) btnClass = "bg-green-500 text-white border-green-500 opacity-50";
                            if (isWrong) btnClass = "bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-light)] opacity-20";

                            return (
                                <button
                                    key={letter}
                                    onClick={() => handleGuess(letter)}
                                    disabled={isGuessed || lives === 0}
                                    className={`w-9 h-10 md:w-12 md:h-12 rounded-xl font-black text-lg transition-all ${btnClass}`}
                                >
                                    {letter}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, BookOpen, PartyPopper, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DefinitionQuizGame() {
    const { vocab, recordBestScore, progress } = useApp();
    const navigate = useNavigate();
    const [time, setTime] = useState(0);

    const [question, setQuestion] = useState(null);
    const [options, setOptions] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [round, setRound] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);

    const [timeLeft, setTimeLeft] = useState(60);

    useEffect(() => {
        if (!isPlaying) return;
        if (timeLeft <= 0) {
            setIsPlaying(false);
            if (score > 0) recordBestScore('definition', score); // Score is now the record, not time
            return;
        }
        const interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
        return () => clearInterval(interval);
    }, [isPlaying, timeLeft, score, recordBestScore]);

    useEffect(() => {
        if (isPlaying && !question && vocab.length >= 4) {
            nextRound();
        }
    }, [isPlaying, question, vocab]);

    const startGame = () => {
        if (vocab.length < 4) return;
        setRound(0);
        setScore(0);
        setTimeLeft(60);
        setIsPlaying(true);
        setQuestion(null);
        setSelectedOption(null);
        setIsCorrect(null);
    };

    const nextRound = () => {
        // Infinite rounds

        const targetWord = vocab[Math.floor(Math.random() * vocab.length)];

        // Generate options (1 correct + 3 distractors)
        const distractors = vocab
            .filter(v => v.id !== targetWord.id)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);

        const allOptions = [targetWord, ...distractors].sort(() => 0.5 - Math.random());

        setQuestion(targetWord);
        setOptions(allOptions);
        setSelectedOption(null);
        setIsCorrect(null);
        setRound(r => r + 1);
    };

    const handleOptionClick = (option) => {
        if (selectedOption) return;

        setSelectedOption(option);
        const correct = option.id === question.id;
        setIsCorrect(correct);

        if (correct) {
            setScore(s => s + 1);
            recordPractice('game');
        }

        setTimeout(nextRound, 1500);
    };

    if (vocab.length < 4) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <BookOpen size={40} className="text-[var(--text-muted)] mb-4" />
                <h3 className="text-xl font-bold text-[var(--text-main)]">Not enough content</h3>
                <p className="text-[var(--text-muted)] mt-2">Add at least 4 words to play Definition Master.</p>
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
                    <h2 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Definition Master</h2>
                    <p className="text-[var(--text-muted)] font-medium">Choose the word that matches the definition.</p>
                </div>
            </div>

            {!isPlaying ? (
                <div className="premium-card py-24 text-center shadow-xl">
                    <div className="w-24 h-24 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-[var(--primary)]/20 shadow-inner">
                        <BookOpen size={48} className="text-[var(--primary)] ml-2" />
                    </div>
                    <h3 className="text-2xl font-extrabold text-[var(--text-main)] mb-2 tracking-tight">Speed Definition Challenge</h3>
                    <p className="text-[var(--text-muted)] mb-10 max-w-sm mx-auto">How many words can you identify in 60 seconds?</p>

                    {progress?.bestRecords?.definition && (
                        <div className="mb-8 flex flex-col items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Best Score</span>
                            <span className="text-xl font-black text-[var(--primary)]">{progress.bestRecords.definition} words</span>
                        </div>
                    )}

                    <button onClick={startGame} className="bg-[var(--primary)] text-white px-12 py-4 rounded-2xl font-black text-lg shadow-lg hover:bg-[var(--primary-hover)] transition-all active:scale-95">Start Game</button>
                </div>
            ) : (
                <div className="max-w-2xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <span className="text-sm font-black text-[var(--text-muted)] uppercase tracking-widest">Words: {score}</span>
                        <div className="flex items-center gap-4">
                            <span className={`text-2xl font-mono font-black ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-[var(--primary)]'}`}>{timeLeft}s</span>
                            <span className="text-sm font-black text-[var(--primary)] uppercase tracking-widest">Score: {score}</span>
                        </div>
                    </div>

                    <div className="min-h-[220px] flex items-center justify-center p-8 bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-hover)] border border-[var(--border-light)] rounded-[32px] mb-10 shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]"></div>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[var(--primary)]/5 rounded-full blur-3xl group-hover:bg-[var(--primary)]/10 transition-colors duration-500"></div>
                        <p className="text-2xl md:text-4xl font-black text-[var(--text-main)] leading-tight relative z-10 italic">
                            "{question?.meaning}"
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {options.map((opt) => {
                            let optionClass = "bg-[var(--bg-card)] border-[var(--border-light)] text-[var(--text-main)] hover:border-[var(--primary)]/50 hover:shadow-md";

                            if (selectedOption) {
                                if (opt.id === question.id) {
                                    optionClass = "bg-[var(--success)] border-[var(--success)] text-white shadow-lg";
                                } else if (opt.id === selectedOption.id) {
                                    optionClass = "bg-[var(--error)] border-[var(--error)] text-white shadow-lg";
                                } else {
                                    optionClass = "opacity-50 border-[var(--border-light)]";
                                }
                            }

                            return (
                                <button
                                    key={opt.id}
                                    onClick={() => handleOptionClick(opt)}
                                    disabled={selectedOption !== null}
                                    className={`p-6 rounded-2xl border font-bold text-lg md:text-xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95 flex items-center justify-center min-h-[80px] ${optionClass}`}
                                >
                                    {opt.word}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

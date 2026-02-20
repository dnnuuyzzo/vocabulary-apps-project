import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle, XCircle, Trophy, ArrowRight } from 'lucide-react';

export default function QuizMode() {
    const { vocab, recordPractice } = useApp();
    const [questions, setQuestions] = useState([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);

    useEffect(() => {
        if (vocab.length < 4) return;

        // Prioritize learning/new words for questions, but use any for distractors
        const candidates = vocab.filter(v => v.status !== 'mastered');
        const questionPool = candidates.length >= 5 ? candidates : vocab;

        // Generate 5 random questions
        const history = [];
        const newQuestions = Array.from({ length: 5 }).map(() => {
            // Pick random correct word from weighted pool
            let correct;
            let attempts = 0;
            do {
                // If we have enough learning words, pick from there, otherwise fallback to all
                const pool = (candidates.length > 0 && Math.random() > 0.3) ? candidates : vocab;
                correct = pool[Math.floor(Math.random() * pool.length)];
                attempts++;
            } while (history.includes(correct.id) && attempts < 20);

            history.push(correct.id);

            // Pick 3 distractors
            const distractors = vocab
                .filter(v => v.id !== correct.id)
                .sort(() => 0.5 - Math.random())
                .slice(0, 3);

            const options = [correct, ...distractors].sort(() => 0.5 - Math.random());

            return {
                word: correct.word,
                correctAnswer: correct.meaning,
                options: options.map(o => o.meaning)
            };
        });

        setQuestions(newQuestions);
    }, [vocab]);

    const handleAnswer = (answer) => {
        if (selectedAnswer) return; // Prevent double click

        setSelectedAnswer(answer);
        const correct = answer === questions[currentQ].correctAnswer;

        if (correct) setScore(prev => prev + 1);

        setTimeout(() => {
            if (currentQ < questions.length - 1) {
                setCurrentQ(prev => prev + 1);
                setSelectedAnswer(null);
            } else {
                setShowResult(true);
                recordPractice();
            }
        }, 1500);
    };

    if (vocab.length < 4) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <div className="w-20 h-20 bg-[var(--input-bg)] rounded-full flex items-center justify-center mb-6 border border-[var(--border-light)] shadow-sm">
                    <CheckCircle size={40} className="text-[var(--text-muted)]" />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-main)]">Not enough words</h3>
                <p className="text-[var(--text-muted)] mt-2">You need at least 4 words in your library to start a quiz.</p>
            </div>
        );
    }

    if (showResult) {
        return (
            <div className="max-w-md mx-auto text-center pt-12 animate-in zoom-in duration-300">
                <div className="w-24 h-24 bg-[var(--input-bg)] rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-[var(--primary)] shadow-xl">
                    <Trophy size={48} className="text-[var(--accent)]" />
                </div>
                <h2 className="text-3xl font-bold text-[var(--text-main)] mb-2">Quiz Complete!</h2>
                <p className="text-[var(--text-muted)] mb-8">You scored <span className="font-extrabold text-[var(--primary)] text-xl">{score}</span> out of <span className="font-bold">{questions.length}</span></p>

                <button
                    onClick={() => window.location.reload()}
                    className="bg-[var(--primary)] text-white px-8 py-3 rounded-xl font-bold hover:bg-[var(--primary-hover)] transition-all shadow-lg w-full"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    if (questions.length === 0) return <div className="text-[var(--text-main)] text-center pt-20">Loading quiz...</div>;

    const currentQuestion = questions[currentQ];

    return (
        <div className="max-w-2xl mx-auto pt-8">
            <div className="flex justify-between items-center mb-8">
                <span className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest">Question {currentQ + 1} / {questions.length}</span>
                <span className="px-4 py-1.5 rounded-full bg-[var(--input-bg)] text-[var(--primary)] text-sm font-bold border border-[var(--border-light)]">Score: {score}</span>
            </div>

            <div className="premium-card p-12 text-center mb-8 bg-[var(--bg-card)]">
                <h2 className="text-5xl font-black text-[var(--text-main)] mb-4 tracking-tight">{currentQuestion.word}</h2>
                <p className="text-[var(--text-muted)] font-medium">Select the correct Indonesian meaning</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.options.map((option, idx) => {
                    let stateClass = 'bg-[var(--bg-card)] border-[var(--border-light)] text-[var(--text-main)] hover:bg-[var(--bg-hover)] hover:border-[var(--primary)]/30';
                    if (selectedAnswer) {
                        if (option === currentQuestion.correctAnswer) stateClass = 'bg-[var(--success)] border-[var(--success)] text-white font-bold shadow-lg scale-105 z-10';
                        else if (option === selectedAnswer) stateClass = 'bg-[var(--error)] border-[var(--error)] text-white font-bold shadow-lg scale-105 z-10';
                        else stateClass = 'opacity-40 grayscale-[0.5]';
                    }

                    return (
                        <button
                            key={idx}
                            disabled={!!selectedAnswer}
                            onClick={() => handleAnswer(option)}
                            className={`p-6 rounded-2xl border-2 text-lg font-bold transition-all duration-300 shadow-sm ${stateClass}`}
                        >
                            {option}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

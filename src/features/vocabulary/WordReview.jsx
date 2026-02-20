import { useApp } from '../../context/AppContext';
import { ArrowLeft, Volume2, Award, Clock } from 'lucide-react';


export default function WordReview({ wordId, onBack }) {
    const { vocab, speak } = useApp();
    const word = vocab.find(v => v.id === wordId);


    if (!word) return <div className="p-8 text-[var(--text-main)]">Word not found.</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Nav */}
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors font-bold"
            >
                <ArrowLeft size={20} /> Back
            </button>

            {/* Main Word Card */}
            <div className="premium-card p-8 md:p-12 shadow-2xl relative overflow-hidden bg-[var(--bg-card)]">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                {/* Listen Button - Top Right */}
                <button
                    onClick={() => speak(word.word)}
                    className="absolute top-6 right-6 w-12 h-12 rounded-full bg-[var(--input-bg)] hover:bg-[var(--primary)] text-[var(--text-muted)] hover:text-white transition-all border border-[var(--border-light)] hover:border-[var(--primary)] shadow-sm flex items-center justify-center group z-20"
                    title="Listen"
                >
                    <Volume2 size={20} className="group-hover:scale-110 transition-transform" />
                </button>

                <div className="relative z-10 flex flex-col items-center text-center">
                    {/* Level Badge */}
                    <span className="px-4 py-1.5 rounded-full bg-[var(--input-bg)] border border-[var(--border-light)] text-[var(--primary)] text-sm font-extrabold uppercase tracking-widest shadow-sm mb-8">
                        Level {word.level || 'B1'}
                    </span>
                    {/* Word */}
                    <h1 className="text-5xl md:text-7xl font-black text-[var(--text-main)] tracking-tight mb-8">
                        {word.word}
                    </h1>

                    {/* Synonyms */}
                    {word.synonyms && (
                        <div className="flex flex-wrap justify-center gap-2 mb-8">
                            {word.synonyms.split(', ').map((syn, i) => (
                                <span key={i} className="text-[10px] font-bold px-3 py-1 bg-[var(--primary)]/5 text-[var(--primary)] rounded-full border border-[var(--primary)]/10 uppercase tracking-[0.2em]">
                                    {syn}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Meanings */}
                    <div className="mb-8 space-y-2">
                        {word.meaning.split(', ').map((m, i) => (
                            <h2 key={i} className="text-2xl md:text-3xl font-semibold text-[var(--text-muted)] italic last:mb-0">
                                {m.toLowerCase()}
                            </h2>
                        ))}
                    </div>

                    {/* Examples Section */}
                    {word.example && (
                        <div className="w-full max-w-2xl text-left space-y-4 pt-12 border-t border-[var(--border-light)]/20">
                            <div className="space-y-4">
                                {word.example.split('|||').filter(ex => ex.trim() !== '').map((ex, i) => (
                                    <div key={i} className="relative pl-6">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--primary)]/30 rounded-full"></div>
                                        {(() => {
                                            const match = ex.match(/(.*)\s\((.*)\)/);
                                            if (match) {
                                                return (
                                                    <>
                                                        <p className="text-[var(--text-main)] font-medium text-lg italic leading-relaxed">
                                                            "{match[1]}"
                                                        </p>
                                                        <p className="text-[var(--text-muted)] text-sm font-bold mt-1">
                                                            {match[2]}
                                                        </p>
                                                    </>
                                                );
                                            }
                                            return (
                                                <p className="text-[var(--text-main)] font-medium text-lg italic leading-relaxed">
                                                    "{ex}"
                                                </p>
                                            );
                                        })()}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats / Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="premium-card p-6 flex items-center gap-4 hover:border-[var(--primary)]/30 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
                        <Award size={24} />
                    </div>
                    <div>
                        <p className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-wider">Status</p>
                        <p className="text-[var(--text-main)] font-bold text-lg capitalize">{word.status}</p>
                    </div>
                </div>

                <div className="premium-card p-6 flex items-center gap-4 hover:border-[var(--primary)]/30 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-wider">Added On</p>
                        <p className="text-[var(--text-main)] font-bold text-lg">
                            {new Date(word.createdDate).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

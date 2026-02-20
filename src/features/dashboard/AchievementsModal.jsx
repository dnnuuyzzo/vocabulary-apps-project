import { X, Trophy, Lock } from 'lucide-react';
import { ACHIEVEMENTS } from '../../utils/achievements';
import { useApp } from '../../context/AppContext';

export default function AchievementsModal({ onClose }) {
    const { progress } = useApp();
    const unlockedIds = progress?.unlockedAchievements || [];

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[var(--bg-app)] w-full max-w-4xl max-h-[80vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-[var(--border-light)]">
                {/* Header */}
                <div className="p-6 border-b border-[var(--border-light)] flex justify-between items-center bg-[var(--bg-card)]">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 text-yellow-600 flex items-center justify-center">
                            <Trophy size={24} className="fill-yellow-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-[var(--text-main)]">Achievements</h2>
                            <p className="text-[var(--text-muted)] font-bold text-sm">
                                {unlockedIds.length} / {ACHIEVEMENTS.length} Unlocked
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[var(--bg-hover)] rounded-full text-[var(--text-muted)] transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-[var(--bg-app)] custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {ACHIEVEMENTS.map(achievement => {
                            const isUnlocked = unlockedIds.includes(achievement.id);
                            return (
                                <div
                                    key={achievement.id}
                                    className={`
                                        p-4 rounded-2xl border flex items-center gap-4 transition-all relative overflow-hidden group
                                        ${isUnlocked
                                            ? 'bg-[var(--bg-card)] border-[var(--border-light)] shadow-sm'
                                            : 'bg-[var(--input-bg)]/50 border-transparent opacity-70 grayscale hover:grayscale-0 hover:opacity-100'
                                        }
                                    `}
                                >
                                    <div className={`
                                        w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-inner
                                        ${isUnlocked ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-orange-500/20' : 'bg-[var(--border-light)] text-[var(--text-muted)]'}
                                    `}>
                                        {isUnlocked ? <achievement.icon size={32} /> : <Lock size={24} />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className={`font-black text-lg ${isUnlocked ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'}`}>
                                            {achievement.title}
                                        </h3>
                                        <p className="text-sm font-bold text-[var(--text-muted)] leading-tight">
                                            {achievement.description}
                                        </p>
                                        {isUnlocked && (
                                            <div className="mt-2 text-[10px] font-black uppercase text-green-500 tracking-widest flex items-center gap-1">
                                                Unlocked
                                            </div>
                                        )}
                                    </div>

                                    {/* Shine effect for unlocked */}
                                    {isUnlocked && (
                                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-5 rotate-45 blur-xl group-hover:opacity-10 transition-opacity"></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

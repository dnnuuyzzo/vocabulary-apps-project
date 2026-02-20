import { Trophy, Lock, RotateCcw, AlertTriangle, X, Book, Zap, Flame, Crown, Gamepad2, Music, Heart, Star, Sun, Moon, Calendar, Target, Medal, Sparkles, CheckCircle, PenTool, Clock } from 'lucide-react';
import { ACHIEVEMENTS } from '../../utils/achievements';
import { useApp } from '../../context/AppContext';
import { useState } from 'react';

// Maps achievement ID prefixes to their display logic
const SERIES_DEFINITIONS = [
    {
        prefix: 'vocab_collector_',
        title: 'Word Collector',
        icon: Book,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
        barColor: 'from-blue-400 to-indigo-500',
        getValue: (p) => p.totalVocab || 0,
        getUnit: () => 'words'
    },
    {
        prefix: 'scholar_',
        title: 'Scholar',
        icon: Zap,
        color: 'text-yellow-500',
        bg: 'bg-yellow-500/10',
        barColor: 'from-yellow-400 to-amber-500',
        getValue: (p) => p.totalActivityCounts?.learn || 0,
        getUnit: () => 'sessions'
    },
    {
        prefix: 'streak_master_',
        title: 'Streak Master',
        icon: Flame,
        color: 'text-orange-500',
        bg: 'bg-orange-500/10',
        barColor: 'from-orange-400 to-red-500',
        getValue: (p) => p.longestStreak || 0,
        getUnit: () => 'days'
    },
    {
        prefix: 'mastermind_',
        title: 'Mastermind',
        icon: Crown,
        color: 'text-purple-500',
        bg: 'bg-purple-500/10',
        barColor: 'from-purple-400 to-pink-500',
        getValue: (p) => p.masteredVocab || 0,
        getUnit: () => 'mastered'
    },
    {
        prefix: 'gamer_',
        title: 'Gamer',
        icon: Gamepad2,
        color: 'text-green-500',
        bg: 'bg-green-500/10',
        barColor: 'from-green-400 to-emerald-500',
        getValue: (p) => p.totalActivityCounts?.game || 0,
        getUnit: () => 'games'
    },
    {
        prefix: 'listener_',
        title: 'Audio Learner',
        icon: Music,
        color: 'text-rose-500',
        bg: 'bg-rose-500/10',
        barColor: 'from-rose-400 to-pink-500',
        getValue: (p) => p.totalActivityCounts?.listening || 0,
        getUnit: () => 'mins'
    },
    {
        prefix: 'dedicated_',
        title: 'Dedication',
        icon: Heart,
        color: 'text-red-500',
        bg: 'bg-red-500/10',
        barColor: 'from-red-400 to-rose-600',
        getValue: (p) => Object.keys(p.activityLog || {}).length, // Calculate unique active days
        getUnit: () => 'days'
    },
    {
        prefix: 'meta_unlock_',
        title: 'Trophy Hunter',
        icon: Trophy,
        color: 'text-amber-500',
        bg: 'bg-amber-500/10',
        barColor: 'from-amber-300 to-yellow-600',
        getValue: (p) => p.unlockedAchievements?.length || 0,
        getUnit: () => 'trophies'
    }
];

export default function Achievements() {
    const { progress, setProgress } = useApp();
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [selectedSeries, setSelectedSeries] = useState(null);
    const unlockedIds = progress?.unlockedAchievements || [];

    const handleReset = () => {
        setProgress(prev => ({
            ...prev,
            unlockedAchievements: [],
            currentStreak: 0,
            longestStreak: 0,
            highScore: 0,
            totalActivityCounts: {},
            lastPracticeDate: null,
            activityLog: {},
            timeFlags: {},
            bestRecords: {}
        }));
        setShowResetConfirm(false);
    };

    // Helper to extract target from ID
    const getTargetFromId = (id) => {
        const parts = id.split('_');
        const val = parseInt(parts[parts.length - 1]);
        return isNaN(val) ? 0 : val;
    };

    // 1. Process Series
    const seriesData = SERIES_DEFINITIONS.map(def => {
        const items = ACHIEVEMENTS.filter(a => a.id.startsWith(def.prefix));

        let unlockedCount = 0;
        items.forEach(item => {
            if (unlockedIds.includes(item.id)) unlockedCount++;
        });

        const isMaxed = unlockedCount >= items.length;
        const nextItem = isMaxed ? items[items.length - 1] : items[unlockedCount];
        const currentValue = def.getValue(progress);
        const target = getTargetFromId(nextItem.id);
        const percentage = Math.min(100, Math.max(0, (currentValue / target) * 100));

        return {
            ...def,
            items: items.map(item => ({
                ...item,
                isUnlocked: unlockedIds.includes(item.id),
                target: getTargetFromId(item.id)
            })),
            unlockedCount,
            isMaxed,
            currentValue,
            target,
            percentage,
            nextItem
        };
    });

    // ... (specialAchievements logic remains same)
    const specialAchievements = ACHIEVEMENTS.filter(a => {
        return !SERIES_DEFINITIONS.some(def => a.id.startsWith(def.prefix));
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 px-2">
                <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center shadow-sm border border-yellow-500/20">
                    <Trophy size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-[var(--text-main)] tracking-tight">Achievements</h1>
                    <p className="text-xs font-bold text-[var(--text-muted)] mt-1">
                        {unlockedIds.length} / {ACHIEVEMENTS.length} Unlocked
                    </p>
                </div>
            </div>

            {/* Series Cards (Grouped Achievements) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {seriesData.map((series) => (
                    <div
                        key={series.prefix}
                        onClick={() => setSelectedSeries(series)}
                        className="premium-card p-5 bg-[var(--bg-card)] border border-[var(--border-light)] shadow-sm hover:shadow-md transition-all group relative overflow-hidden cursor-pointer active:scale-[0.98]"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-xl ${series.bg} ${series.color} flex items-center justify-center shadow-inner`}>
                                    <series.icon size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black text-[var(--text-main)] text-lg">{series.title}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ${series.bg} ${series.color}`}>
                                            {series.isMaxed ? 'MAX LEVEL' : `Level ${series.unlockedCount + 1}`}
                                        </span>
                                        {series.isMaxed && <Sparkles size={12} className="text-yellow-500" />}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar Area */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold text-[var(--text-muted)]">
                                <span>{series.currentValue} {series.getUnit()}</span>
                                <span>{series.target} {series.getUnit()}</span>
                            </div>
                            <div className="h-3 w-full bg-[var(--input-bg)] rounded-full overflow-hidden border border-[var(--border-light)]/50">
                                <div
                                    className={`h-full rounded-full bg-gradient-to-r ${series.barColor} transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.1)]`}
                                    style={{ width: `${series.isMaxed ? 100 : series.percentage}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Special Badges Section */}
            {specialAchievements.length > 0 && (
                <div className="pt-8">
                    <h3 className="text-sm font-black text-[var(--text-muted)] uppercase tracking-widest mb-4 px-2">Special Badges</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {specialAchievements.map(badge => {
                            const isUnlocked = unlockedIds.includes(badge.id);
                            return (
                                <div
                                    key={badge.id}
                                    className={`
                                        relative group p-4 rounded-2xl border transition-all flex flex-col items-center text-center gap-3
                                        ${isUnlocked
                                            ? 'bg-[var(--bg-card)] border-[var(--border-light)] shadow-sm hover:shadow-md hover:-translate-y-1'
                                            : 'bg-[var(--input-bg)]/30 border border-dashed border-[var(--border-light)] opacity-60 grayscale hover:opacity-100 hover:grayscale-0'
                                        }
                                    `}
                                >
                                    <div className={`
                                        w-14 h-14 rounded-full flex items-center justify-center p-3 shadow-sm transition-transform group-hover:scale-110
                                        ${isUnlocked ? 'bg-gradient-to-br from-yellow-100 to-orange-100 text-orange-500' : 'bg-[var(--input-bg)] text-[var(--text-muted)]'}
                                    `}>
                                        {isUnlocked ? <badge.icon size={28} /> : <Lock size={24} />}
                                    </div>
                                    <div>
                                        <h4 className={`text-xs font-black leading-tight mb-1 ${isUnlocked ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'}`}>
                                            {badge.title}
                                        </h4>
                                        <p className="text-[9px] font-bold text-[var(--text-muted)] opacity-70 leading-tight hidden group-hover:block animate-in fade-in">
                                            {badge.description}
                                        </p>
                                    </div>
                                    {isUnlocked && (
                                        <div className="absolute top-2 right-2 text-yellow-500">
                                            <Star size={10} fill="currentColor" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Reset Section */}
            <div className="flex justify-center pt-8 border-t border-[var(--border-light)] mt-12 opacity-50 hover:opacity-100 transition-opacity">
                <button
                    onClick={() => setShowResetConfirm(true)}
                    className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase tracking-widest hover:underline"
                >
                    <RotateCcw size={14} />
                    Reset Progress
                </button>
            </div>

            {/* SERIES DETAIL MODAL */}
            {selectedSeries && (
                <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-[var(--bg-card)] border border-[var(--border-light)] rounded-[40px] shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className={`p-8 pb-6 border-b border-[var(--border-light)] bg-gradient-to-br ${selectedSeries.barColor} text-white relative`}>
                            <button
                                onClick={() => setSelectedSeries(null)}
                                className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg border border-white/20">
                                    <selectedSeries.icon size={36} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black">{selectedSeries.title}</h2>
                                    <p className="text-sm font-bold opacity-80 uppercase tracking-widest mt-1">Level Progress Overview</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Content - Scrollable List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-[var(--bg-app)]/50 custom-scrollbar">
                            {selectedSeries.items.map((item, idx) => (
                                <div
                                    key={item.id}
                                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${item.isUnlocked
                                        ? 'bg-[var(--bg-card)] border-[var(--border-light)] shadow-sm'
                                        : 'bg-[var(--input-bg)]/20 border-dashed border-[var(--border-light)]/40 opacity-60'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.isUnlocked
                                        ? `bg-gradient-to-br ${selectedSeries.barColor} text-white shadow-md`
                                        : 'bg-[var(--border-light)] text-[var(--text-muted)]'
                                        }`}>
                                        {item.isUnlocked ? <CheckCircle size={18} /> : <Lock size={16} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <h4 className={`text-sm font-black truncate ${item.isUnlocked ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'}`}>
                                                {item.title}
                                            </h4>
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${item.isUnlocked ? 'bg-emerald-500/10 text-emerald-500' : 'bg-[var(--input-bg)] text-[var(--text-muted)]'
                                                }`}>
                                                {item.isUnlocked ? 'Unlocked' : `Required: ${item.target}`}
                                            </span>
                                        </div>
                                        <p className="text-[11px] font-medium text-[var(--text-muted)] mt-0.5">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 bg-[var(--bg-card)] border-t border-[var(--border-light)] flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Your Current Progress</span>
                                <span className="text-lg font-black text-[var(--text-main)]">{selectedSeries.currentValue} / {selectedSeries.isMaxed ? selectedSeries.target : selectedSeries.target}</span>
                            </div>
                            <button
                                onClick={() => setSelectedSeries(null)}
                                className="px-8 py-3 bg-[var(--primary)] text-white rounded-xl font-bold hover:bg-[var(--primary-hover)] transition-all shadow-lg shadow-primary/20 active:scale-95 text-xs uppercase tracking-widest"
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Dialog */}
            {showResetConfirm && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[var(--bg-card)] border border-[var(--border-light)] rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden">
                        <div className="relative">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-red-500/20 shadow-lg mx-auto">
                                <AlertTriangle size={36} />
                            </div>

                            <h3 className="text-xl font-black text-[var(--text-main)] mb-2 text-center">Reset Everything?</h3>
                            <p className="text-[var(--text-muted)] text-sm font-medium mb-8 leading-relaxed text-center">
                                This will wipe all your badges, streaks, and gamification stats. Your vocabulary words will remain safu.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowResetConfirm(false)}
                                    className="flex-1 px-4 py-3 rounded-xl font-bold bg-[var(--input-bg)] text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors text-xs uppercase tracking-wider"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="flex-1 px-4 py-3 rounded-xl font-black bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all active:scale-95 text-xs uppercase tracking-wider"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

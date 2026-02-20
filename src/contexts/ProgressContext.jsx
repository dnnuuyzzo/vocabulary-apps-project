import { createContext, useContext, useState, useEffect } from 'react';
import { DB } from '../utils/db';
import { differenceInCalendarDays, isSameDay, parseISO } from 'date-fns';
import { ACHIEVEMENTS } from '../utils/achievements';

const ProgressContext = createContext();

const INITIAL_PROGRESS = {
    name: 'Learner',
    totalVocab: 0,
    masteredVocab: 0,
    dailyPracticeCount: 0,
    lastPracticeDate: null,
    currentStreak: 0,
    longestStreak: 0,
    level: 1,
    points: 0,
    bestRecords: {},
    activityLog: {},
    totalActivityCounts: {},
    timeFlags: {},
    unlockedAchievements: []
};

export const ProgressProvider = ({ children, totalVocab, masteredVocab }) => {
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newUnlocked, setNewUnlocked] = useState(null);

    // Load progress from IndexedDB
    useEffect(() => {
        const loadProgress = async () => {
            try {
                const savedProgress = await DB.get('progress', 'data');
                const mergedProgress = { ...INITIAL_PROGRESS, ...savedProgress };

                setProgress(mergedProgress);

                // Check streak on load
                if (mergedProgress.lastPracticeDate) {
                    checkStreak(mergedProgress);
                }

                // Check for retrospective achievements
                const updatedWithAchievements = checkAchievements(mergedProgress);
                if (updatedWithAchievements !== mergedProgress) {
                    setProgress(updatedWithAchievements);
                }
            } catch (error) {
                console.error('Error loading progress:', error);
                setProgress(INITIAL_PROGRESS);
            } finally {
                setLoading(false);
            }
        };

        loadProgress();
    }, []);

    // Save progress to IndexedDB whenever it changes
    useEffect(() => {
        if (!loading && progress) {
            DB.set('progress', 'data', progress);
        }
    }, [progress, loading]);

    // Update vocab counts from parent
    useEffect(() => {
        if (!loading && progress) {
            setProgress(prev => ({
                ...prev,
                totalVocab,
                masteredVocab
            }));
        }
    }, [totalVocab, masteredVocab, loading]);

    // Check and update streak
    const checkStreak = (currentProgress) => {
        if (!currentProgress.lastPracticeDate) return;

        const today = new Date();
        const lastDate = parseISO(currentProgress.lastPracticeDate);
        const diff = differenceInCalendarDays(today, lastDate);

        if (diff > 2) {
            // Streak broken (missed more than 1 day)
            setProgress(prev => ({ ...prev, currentStreak: 0 }));
        }
    };

    // Achievement checking logic
    const checkAchievements = (currentProgress) => {
        const unlockedIds = currentProgress.unlockedAchievements || [];

        // Calculate generic high score (ignoring time-based games like hangman for this metric)
        const bestRecords = currentProgress.bestRecords || {};
        const scoreBasedGames = ['definition', 'wordScramble', 'wordMatch', 'speedTyping', 'sentenceBuilder'];
        const scores = scoreBasedGames.map(g => bestRecords[g] || 0);
        const maxScore = Math.max(0, ...scores);

        const stats = {
            totalVocab: currentProgress.totalVocab,
            masteredVocab: currentProgress.masteredVocab,
            currentStreak: currentProgress.currentStreak,
            longestStreak: currentProgress.longestStreak,
            activityCounts: { ...currentProgress.totalActivityCounts },
            highScore: maxScore,
            bestRecords: bestRecords,
            timeFlags: currentProgress.timeFlags || {},
            totalDaysActive: Object.keys(currentProgress.activityLog || {}).length,
            unlockedCount: unlockedIds.length
        };

        const newlyUnlocked = [];
        const updatedUnlockedIds = [...unlockedIds];

        ACHIEVEMENTS.forEach(achievement => {
            if (!unlockedIds.includes(achievement.id)) {
                if (achievement.condition(stats)) {
                    newlyUnlocked.push(achievement);
                    updatedUnlockedIds.push(achievement.id);
                }
            }
        });

        if (newlyUnlocked.length > 0) {
            setNewUnlocked(newlyUnlocked[0]);
            setTimeout(() => setNewUnlocked(null), 5000);

            return {
                ...currentProgress,
                unlockedAchievements: updatedUnlockedIds
            };
        }

        return currentProgress;
    };

    // ... (logActivity remains same)

    // Log activity
    const logActivity = (type, count = 1) => {
        const today = new Date().toLocaleDateString('en-CA');

        setProgress(prev => {
            const currentLog = prev.activityLog || {};
            let dayData = currentLog[today] || { vocab: 0, learn: 0, game: 0, listening: 0, mastered: 0 };

            // Handle legacy array format
            if (Array.isArray(dayData)) {
                const legacyData = { vocab: 0, learn: 0, game: 0, listening: 0, mastered: 0 };
                dayData.forEach(t => {
                    if (legacyData.hasOwnProperty(t)) legacyData[t] = 1;
                });
                dayData = legacyData;
            }

            // Increment the specific activity count
            const updatedDayData = {
                ...dayData,
                [type]: (dayData[type] || 0) + count
            };

            // Streak Logic
            const lastDate = prev.lastPracticeDate ? parseISO(prev.lastPracticeDate) : null;
            const todayDate = new Date();
            let newStreak = prev.currentStreak;

            if (lastDate) {
                const diff = differenceInCalendarDays(todayDate, lastDate);
                if (diff === 1 || diff === 2) {
                    newStreak = isSameDay(todayDate, lastDate) ? prev.currentStreak : prev.currentStreak + 1;
                } else if (diff > 2) {
                    newStreak = 1;
                }
            } else {
                newStreak = 1;
            }

            // Track Time Flags
            const hour = new Date().getHours();
            const timeFlags = prev.timeFlags || {};
            if (hour >= 5 && hour < 8) timeFlags.earlyBird = true;
            if (hour >= 22 || hour < 2) timeFlags.nightOwl = true;

            const dayOfWeek = new Date().getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                timeFlags.weekendWarrior = true;
            }

            // Track Total Counts
            const totalActivityCounts = prev.totalActivityCounts || {};
            totalActivityCounts[type] = (totalActivityCounts[type] || 0) + count;

            const updatedProgress = {
                ...prev,
                activityLog: {
                    ...currentLog,
                    [today]: updatedDayData
                },
                totalActivityCounts,
                timeFlags,
                lastPracticeDate: new Date().toISOString(),
                currentStreak: newStreak,
                longestStreak: Math.max(prev.longestStreak || 0, newStreak)
            };

            return checkAchievements(updatedProgress);
        });
    };

    // Record best score for games
    const recordBestScore = (gameName, score) => {
        setProgress(prev => {
            const currentRecords = prev.bestRecords || {};
            const currentBest = currentRecords[gameName];

            // Determine if higher or lower is better
            // Hangman stores time (lower is better), others store score (higher is better)
            const isTimeBased = gameName === 'hangman';

            let isNewBest = false;

            if (currentBest === undefined) {
                isNewBest = true;
            } else if (isTimeBased) {
                if (score < currentBest) isNewBest = true;
            } else {
                if (score > currentBest) isNewBest = true; // Higher is better
            }

            if (isNewBest) {
                const updatedProgress = {
                    ...prev,
                    bestRecords: {
                        ...currentRecords,
                        [gameName]: score
                    }
                };
                return checkAchievements(updatedProgress);
            }
            return prev;
        });
    };

    // Record practice session
    const recordPractice = (type = 'learn') => {
        logActivity(type);
    };

    // Add points
    const addPoints = (amount) => {
        setProgress(prev => {
            const newPoints = (prev.points || 0) + amount;
            return {
                ...prev,
                points: newPoints
            };
        });
    };

    const value = {
        progress,
        setProgress,
        loading,
        newUnlocked,
        logActivity,
        recordBestScore,
        recordPractice,
        addPoints
    };

    return (
        <ProgressContext.Provider value={value}>
            {children}
        </ProgressContext.Provider>
    );
};

export const useProgress = () => {
    const context = useContext(ProgressContext);
    if (!context) {
        throw new Error('useProgress must be used within ProgressProvider');
    }
    return context;
};

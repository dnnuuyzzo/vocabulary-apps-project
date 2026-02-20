/**
 * achievements.js
 * 
 * Gamification System Configuration.
 * Defines all badges, trophies, and milestones the user can unlock.
 * 
 * Categories:
 * - Vocabulary (Book)
 * - Streaks (Flame)
 * - Mastery (Star)
 * - Games (Gamepad)
 */
import { Book, Zap, Trophy, Flame, Clock, Gamepad2, Star, Sun, Moon, Calendar, Award, Target, Hash, CheckCircle, BarChart, Music, Smile, Heart, ThumbsUp, Crown, Sparkles, TrendingUp, Medal, GraduationCap, PenTool } from 'lucide-react';

const generateAchievements = () => {
    const list = [];

    // 1. Vocabulary Collection (Book) - 40 Levels
    const vocabLevels = [1, 5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 120, 140, 160, 180, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000, 1200, 1400, 1600, 1800, 2000, 2500, 3000, 3500, 4000, 5000];
    vocabLevels.forEach((count, i) => {
        list.push({
            id: `vocab_collector_${count}`,
            title: `Word Collector ${i + 1}`,
            description: `Add ${count} words to your collection.`,
            icon: Book,
            condition: (stats) => stats.totalVocab >= count
        });
    });

    // 2. Learning Sessions (Zap) - 30 Levels
    const learnLevels = [1, 5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200, 250, 300, 350, 400, 500, 600, 700, 800, 900, 1000, 1250, 1500, 1750, 2000, 2500];
    learnLevels.forEach((count, i) => {
        list.push({
            id: `scholar_${count}`,
            title: `Scholar Level ${i + 1}`,
            description: `Complete ${count} learning sessions.`,
            icon: Zap,
            condition: (stats) => (stats.activityCounts?.learn || 0) >= count
        });
    });

    // 3. Current Streak (Flame) - 30 Levels
    const streakLevels = [3, 5, 7, 10, 14, 21, 30, 40, 45, 50, 60, 75, 90, 100, 120, 150, 180, 200, 250, 300, 365, 400, 450, 500, 600, 700, 800, 900, 1000, 1500];
    streakLevels.forEach((days, i) => {
        list.push({
            id: `streak_master_${days}`,
            title: `Streak Master ${i + 1}`,
            description: `Reach a ${days}-day learning streak.`,
            icon: Flame,
            condition: (stats) => stats.longestStreak >= days
        });
    });

    // 4. Mastery (Star/Crown) - 30 Levels
    const masteryLevels = [1, 5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200, 250, 300, 350, 400, 500, 600, 700, 800, 900, 1000, 1200, 1500, 2000, 2500, 3000];
    masteryLevels.forEach((count, i) => {
        list.push({
            id: `mastermind_${count}`,
            title: `Mastermind ${i + 1}`,
            description: `Master ${count} words.`,
            icon: i > 20 ? Crown : Star,
            condition: (stats) => stats.masteredVocab >= count
        });
    });

    // 5. Gamer (Gamepad2) - 20 Levels
    const gameLevels = [1, 5, 10, 20, 30, 40, 50, 75, 100, 150, 200, 250, 300, 400, 500, 600, 700, 800, 900, 1000];
    gameLevels.forEach((count, i) => {
        list.push({
            id: `gamer_${count}`,
            title: `Player ${i + 1}`,
            description: `Play ${count} learning games.`,
            icon: Gamepad2,
            condition: (stats) => (stats.activityCounts?.game || 0) >= count
        });
    });

    // 6. Listener (Music/Headphones) - 20 Levels
    const listenLevels = [10, 30, 60, 100, 150, 200, 300, 400, 500, 600, 800, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 7500, 10000];
    listenLevels.forEach((mins, i) => {
        list.push({
            id: `listener_${mins}`,
            title: `Listener ${i + 1}`,
            description: `Listen for ${mins} minutes total.`,
            icon: Music,
            condition: (stats) => (stats.activityCounts?.listening || 0) >= mins
        });
    });

    // 7. Dedication (Heart) - Days Active - 20 Levels
    const activeLevels = [3, 7, 14, 21, 30, 45, 60, 90, 100, 120, 150, 180, 200, 250, 300, 365, 400, 500, 600, 730];
    activeLevels.forEach((days, i) => {
        list.push({
            id: `dedicated_${days}`,
            title: `Loyal User ${i + 1}`,
            description: `Log in on ${days} different days.`,
            icon: Heart,
            condition: (stats) => stats.totalDaysActive >= days
        });
    });

    // 8. Achievements Unlocked (Trophy) - 15 Levels
    const unlockLevels = [5, 10, 20, 30, 40, 50, 75, 100, 125, 150, 160, 170, 180, 190, 200];
    unlockLevels.forEach((count, i) => {
        list.push({
            id: `meta_unlock_${count}`,
            title: `Trophy Hunter ${i + 1}`,
            description: `Unlock ${count} other achievements.`,
            icon: Trophy,
            condition: (stats) => stats.unlockedCount >= count
        });
    });

    // Special Misc Achievements
    const specials = [
        {
            id: 'early_bird',
            title: 'Early Bird',
            description: 'Complete a session between 5 AM and 8 AM.',
            icon: Sun,
            condition: (stats) => stats.timeFlags?.earlyBird
        },
        {
            id: 'night_owl',
            title: 'Night Owl',
            description: 'Complete a session between 10 PM and 2 AM.',
            icon: Moon,
            condition: (stats) => stats.timeFlags?.nightOwl
        },
        {
            id: 'weekend_warrior',
            title: 'Weekend Warrior',
            description: 'Practice on Saturday or Sunday.',
            icon: Calendar,
            condition: (stats) => stats.timeFlags?.weekendWarrior
        },
        {
            id: 'high_scorer_20',
            title: 'High Scorer',
            description: 'Score over 20 points in any game.',
            icon: Target,
            condition: (stats) => stats.highScore && stats.highScore >= 20
        },
        {
            id: 'high_scorer_40',
            title: 'Elite Gamer',
            description: 'Score over 40 points in a game.',
            icon: Medal,
            condition: (stats) => stats.highScore && stats.highScore >= 40
        },
        {
            id: 'membara_beginner',
            title: 'Spark of Ambition',
            description: 'reach a 7 day streak to ignite the flame.',
            icon: Flame,
            condition: (stats) => stats.longestStreak >= 7
        },
        {
            id: 'membara_intermediate',
            title: 'Blazing Dedication',
            description: 'Keep the fire alive with a 30 day streak.',
            icon: Zap,
            condition: (stats) => stats.longestStreak >= 30
        },
        {
            id: 'membara_advanced',
            title: 'Inferno Master',
            description: 'A scorching 100 day streak! You are on fire!',
            icon: Trophy,
            condition: (stats) => stats.longestStreak >= 100
        },
        {
            id: 'vocab_glutton',
            title: 'Word Eater',
            description: 'Devour 500 words into your collection.',
            icon: Book,
            condition: (stats) => stats.totalVocab >= 500
        },
        {
            id: 'game_addict',
            title: 'Game Addict',
            description: 'Complete 50 game sessions. Can\'t stop, won\'t stop!',
            icon: Gamepad2,
            condition: (stats) => (stats.activityCounts?.game || 0) >= 50
        },
        {
            id: 'game_explorer',
            title: 'Game Explorer',
            description: 'Play at least 3 different types of games.',
            icon: Gamepad2,
            condition: (stats) => Object.keys(stats.bestRecords || {}).length >= 3
        },
        {
            id: 'speed_demon',
            title: 'Speed Demon',
            description: 'Type 25+ words in Speed Typing.',
            icon: Zap,
            condition: (stats) => (stats.bestRecords?.speedTyping || 0) >= 25
        },
        {
            id: 'word_wizard',
            title: 'Word Wizard',
            description: 'Unscramble 20+ words in 60s.',
            icon: Sparkles,
            condition: (stats) => (stats.bestRecords?.wordScramble || 0) >= 20
        },
        {
            id: 'match_maker',
            title: 'Match Maker',
            description: 'Match 20+ pairs in Word Match.',
            icon: CheckCircle,
            condition: (stats) => (stats.bestRecords?.wordMatch || 0) >= 20
        },
        {
            id: 'context_king',
            title: 'Context King',
            description: 'Build 15+ sentences in Sentence Builder.',
            icon: PenTool,
            condition: (stats) => (stats.bestRecords?.sentenceBuilder || 0) >= 15
        },
        {
            id: 'quick_saver',
            title: 'Quick Saver',
            description: 'Win a Hangman game in under 45 seconds.',
            icon: Clock,
            condition: (stats) => stats.bestRecords?.hangman && stats.bestRecords.hangman <= 45
        }
    ];

    return [...list, ...specials];
};

export const ACHIEVEMENTS = generateAchievements();

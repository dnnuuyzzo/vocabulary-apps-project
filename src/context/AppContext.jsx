/**
 * Combined Context Provider
 * Wraps all context providers in the correct order
 */
import { VocabularyProvider } from '../contexts/VocabularyContext';
import { ProgressProvider } from '../contexts/ProgressContext';
import { AudioProvider } from '../contexts/AudioContext';
import { SettingsProvider } from '../contexts/SettingsContext';
import { useVocabulary } from '../contexts/VocabularyContext';
import { useProgress } from '../contexts/ProgressContext';
import { useAudio } from '../contexts/AudioContext';
import { useSettings } from '../contexts/SettingsContext';
import { useEffect, useState } from 'react';
import { migrateFromLocalStorage } from '../utils/db';

export const AppProvider = ({ children }) => {
    // Run migration (if any) on first load
    // This ensures data format is up-to-date before the app starts
    useEffect(() => {
        const migrate = async () => {
            await migrateFromLocalStorage();
        };
        migrate();
    }, []);

    return (
        <SettingsProvider>
            <VocabularyProvider>
                <VocabularyConsumer>
                    {children}
                </VocabularyConsumer>
            </VocabularyProvider>
        </SettingsProvider>
    );
};

// Helper Component:
// Passes "vocab" data down to other providers (Progress & Audio)
// This solves the dependency problem (Progress needs to know how many words exist)
const VocabularyConsumer = ({ children }) => {
    const { vocab } = useVocabulary();

    return (
        <ProgressProvider
            totalVocab={vocab.length}
            masteredVocab={vocab.filter(v => v.status === 'mastered').length}
        >
            <AudioProvider vocab={vocab}>
                {children}
            </AudioProvider>
        </ProgressProvider>
    );
};

/**
 * useApp Hook
 * 
 * This is the "Super Hook" for the application.
 * Instead of importing multiple hooks (useVocabulary, useSettings, etc.),
 * components can just import THIS one hook to get access to EVERYTHING.
 * 
 * Usage: const { vocab, addPoints, theme } = useApp();
 */
export const useApp = () => {
    const vocabulary = useVocabulary();
    const progress = useProgress();
    const audio = useAudio();
    const settings = useSettings();

    return {
        // Vocabulary
        vocab: vocabulary.vocab,
        setVocab: vocabulary.setVocab,
        trash: vocabulary.trash,
        addVocab: vocabulary.addVocab,
        deleteVocab: vocabulary.deleteVocab,
        updateVocabStatus: vocabulary.updateVocabStatus,
        updateVocabDetails: vocabulary.updateVocabDetails,
        restoreVocab: vocabulary.restoreVocab,
        permanentDeleteVocab: vocabulary.permanentDeleteVocab,
        emptyTrash: vocabulary.emptyTrash,
        undoDelete: vocabulary.undoDelete,
        lastAction: vocabulary.lastAction,
        setLastAction: vocabulary.setLastAction,

        // Progress
        progress: progress.progress,
        setProgress: progress.setProgress,
        newUnlocked: progress.newUnlocked,
        logActivity: progress.logActivity,
        recordBestScore: progress.recordBestScore,
        recordPractice: progress.recordPractice,
        addPoints: progress.addPoints,

        // Audio
        isAudioPlaying: audio.isAudioPlaying,
        setIsAudioPlaying: audio.setIsAudioPlaying,
        currentAudioIndex: audio.currentAudioIndex,
        setCurrentAudioIndex: audio.setCurrentAudioIndex,
        audioPlaybackSpeed: audio.audioPlaybackSpeed,
        setAudioPlaybackSpeed: audio.setAudioPlaybackSpeed,
        isAudioShuffle: audio.isAudioShuffle,
        setIsAudioShuffle: audio.setIsAudioShuffle,
        isAudioRepeat: audio.isAudioRepeat,
        setIsAudioRepeat: audio.setIsAudioRepeat,
        isMiniPlayerVisible: audio.isMiniPlayerVisible,
        setIsMiniPlayerVisible: audio.setIsMiniPlayerVisible,
        isSessionActive: audio.isSessionActive,
        setIsSessionActive: audio.setIsSessionActive,
        speak: audio.speak,
        speakIndo: audio.speakIndo,
        stopAudio: audio.stopAudio,

        // Settings
        settings: settings.settings,
        setSettings: settings.setSettings,
        theme: settings.theme,
        voiceType: settings.voiceType,
        toggleTheme: settings.toggleTheme,
        setVoiceType: settings.setVoiceType,

        // Loading states
        loading: vocabulary.loading || progress.loading || settings.loading,

        // Modal state - Using React state for proper functionality
        showAddModal: vocabulary.showAddModal,
        setShowAddModal: vocabulary.setShowAddModal
    };
};

// Export individual hooks for granular access
export { useVocabulary, useProgress, useAudio, useSettings };

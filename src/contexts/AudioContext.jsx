import { createContext, useContext, useState, useEffect } from 'react';

const AudioContext = createContext();

export const AudioProvider = ({ children, vocab }) => {
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
    const [audioPlaybackSpeed, setAudioPlaybackSpeed] = useState(1);
    const [isAudioShuffle, setIsAudioShuffle] = useState(false);
    const [isAudioRepeat, setIsAudioRepeat] = useState(true);
    const [isMiniPlayerVisible, setIsMiniPlayerVisible] = useState(false);
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [preferredSpeechEnabled, setPreferredSpeechEnabled] = useState(true);

    // Audio Playback Logic
    useEffect(() => {
        let timer;
        const activeWord = vocab[currentAudioIndex];

        if (isAudioPlaying && activeWord && vocab.length > 0) {
            const playSequence = async () => {
                const baseDelay = 1500 / audioPlaybackSpeed;
                const nextWordDelay = 2000 / audioPlaybackSpeed;

                // 1. Speak English
                speak(activeWord.word, audioPlaybackSpeed);

                // 2. Wait then speak Indonesian
                timer = setTimeout(() => {
                    speakIndo(activeWord.meaning, audioPlaybackSpeed);

                    // 3. Move to next word
                    timer = setTimeout(() => {
                        if (currentAudioIndex < vocab.length - 1) {
                            if (isAudioShuffle) {
                                let nextIndex;
                                do {
                                    nextIndex = Math.floor(Math.random() * vocab.length);
                                } while (nextIndex === currentAudioIndex && vocab.length > 1);
                                setCurrentAudioIndex(nextIndex);
                            } else {
                                setCurrentAudioIndex(prev => prev + 1);
                            }
                        } else {
                            // End of playlist
                            if (isAudioRepeat) {
                                setCurrentAudioIndex(0);
                            } else {
                                setIsAudioPlaying(false);
                            }
                        }
                    }, nextWordDelay);
                }, baseDelay);
            };

            playSequence();
        } else {
            // Ensure silence if not playing
            window.speechSynthesis.cancel();
        }
        return () => {
            clearTimeout(timer);
            // Note: We don't cancel speech on unmount/dep change unless explicitly stopped
            // because that cuts off speech when just changing volume/speed or moving to next word.
            // The logic below handles the "Stop" case.
        };
    }, [isAudioPlaying, currentAudioIndex, vocab, audioPlaybackSpeed, isAudioShuffle, isAudioRepeat]);

    const stopAudio = () => {
        setIsAudioPlaying(false);
        window.speechSynthesis.cancel();
    };

    // Text-to-Speech functions
    const speak = (text, rate = 1, forceGender = null, voiceType = 'female') => {
        if (!preferredSpeechEnabled) return;
        if (!window.speechSynthesis) return;

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = rate;

        const currentGender = forceGender || (voiceType === 'mixed' ? 'female' : voiceType);

        const voices = window.speechSynthesis.getVoices();

        let preferredVoice = null;
        if (currentGender === 'female') {
            preferredVoice = voices.find(v =>
                v.lang.startsWith('en') &&
                (v.name.toLowerCase().includes('female') ||
                    v.name.toLowerCase().includes('samantha') ||
                    v.name.toLowerCase().includes('victoria') ||
                    v.name.toLowerCase().includes('helena') ||
                    v.name.toLowerCase().includes('zira') ||
                    v.name.toLowerCase().includes('hazel') ||
                    v.name.toLowerCase().includes('google us english'))
            );
        } else {
            preferredVoice = voices.find(v =>
                v.lang.startsWith('en') &&
                (v.name.toLowerCase().includes('male') ||
                    v.name.toLowerCase().includes('daniel') ||
                    v.name.toLowerCase().includes('alex') ||
                    v.name.toLowerCase().includes('david') ||
                    v.name.toLowerCase().includes('mark') ||
                    v.name.toLowerCase().includes('google uk english male'))
            );
        }

        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.pitch = currentGender === 'female' ? 1.3 : 0.7;

        window.speechSynthesis.speak(utterance);
    };

    const speakIndo = (text, rate = 1, forceGender = null, voiceType = 'female') => {
        if (!preferredSpeechEnabled) return;
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.rate = rate;

        const currentGender = forceGender || (voiceType === 'mixed' ? 'male' : voiceType);

        const voices = window.speechSynthesis.getVoices();
        let idVoice = voices.find(v => v.lang.startsWith('id'));

        if (idVoice) {
            utterance.voice = idVoice;
        }

        utterance.pitch = currentGender === 'female' ? 1.3 : 0.7;

        window.speechSynthesis.speak(utterance);
    };

    const value = {
        isAudioPlaying,
        setIsAudioPlaying,
        currentAudioIndex,
        setCurrentAudioIndex,
        audioPlaybackSpeed,
        setAudioPlaybackSpeed,
        isAudioShuffle,
        setIsAudioShuffle,
        isAudioRepeat,
        setIsAudioRepeat,
        isMiniPlayerVisible,
        setIsMiniPlayerVisible,
        isSessionActive,
        setIsSessionActive,
        preferredSpeechEnabled,
        setPreferredSpeechEnabled,
        speak,
        PREFERRED_SPEECH_ENABLED: preferredSpeechEnabled, // alias
        speakIndo,
        stopAudio
    };

    return (
        <AudioContext.Provider value={value}>
            {children}
        </AudioContext.Provider>
    );
};

export const useAudio = () => {
    const context = useContext(AudioContext);
    if (!context) {
        throw new Error('useAudio must be used within AudioProvider');
    }
    return context;
};

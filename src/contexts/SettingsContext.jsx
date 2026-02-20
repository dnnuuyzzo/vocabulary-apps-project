import { createContext, useContext, useState, useEffect } from 'react';
import { DB } from '../utils/db';

const SettingsContext = createContext();

const INITIAL_SETTINGS = {
    reminderTime: '09:00',
    notifications: true,
    theme: 'light',
    voiceType: 'female',
    dailyGoal: 10,
    fontSize: 'M',
    autoPlayAudio: false
};

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(INITIAL_SETTINGS);
    const [loading, setLoading] = useState(true);

    // Load settings from IndexedDB
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const savedSettings = await DB.get('settings', 'data');
                setSettings(savedSettings || INITIAL_SETTINGS);
            } catch (error) {
                console.error('Error loading settings:', error);
                setSettings(INITIAL_SETTINGS);
            } finally {
                setLoading(false);
            }
        };

        loadSettings();
    }, []);

    // Save settings to IndexedDB whenever they change
    useEffect(() => {
        if (!loading) {
            DB.set('settings', 'data', settings);
        }
    }, [settings, loading]);

    // Apply theme to document
    useEffect(() => {
        const theme = settings.theme || 'light';
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(theme);
        document.documentElement.setAttribute('data-theme', theme);
    }, [settings.theme]);

    // Toggle theme
    const toggleTheme = () => {
        setSettings(prev => ({
            ...prev,
            theme: prev.theme === 'light' ? 'dark' : 'light'
        }));
    };

    // Set voice type
    const setVoiceType = (type) => {
        setSettings(prev => ({
            ...prev,
            voiceType: type
        }));
    };

    // Update any setting
    const updateSetting = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // Bulk update settings
    const updateSettings = (newSettings) => {
        setSettings(prev => ({
            ...prev,
            ...newSettings
        }));
    };

    const value = {
        settings,
        setSettings,
        loading,
        theme: settings.theme,
        voiceType: settings.voiceType,
        toggleTheme,
        setVoiceType,
        updateSetting,
        updateSettings
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within SettingsProvider');
    }
    return context;
};

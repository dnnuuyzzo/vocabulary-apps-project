import { useState, useEffect, useRef } from 'react';
import { Trash2, Bell, ChevronRight, Moon, Sun, Volume2, Download, Upload, Bot, Eye, EyeOff, MessageSquare } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DB } from '../../utils/db';

/**
 * Settings.jsx
 * 
 * Configuration Center.
 * Allows users to customize the app experience and manage their data.
 * 
 * Key Features:
 * - Profile: Set Name.
 * - AI Integration: Input Groq API Key.
 * - Appearance: Light/Dark mode.
 * - Data Management: Export/Import JSON backups (Critical for data safety).
 */
export default function Settings() {
    const { progress, setProgress, theme, toggleTheme, voiceType, setVoiceType, speak, vocab, settings, setSettings } = useApp();
    const [name, setName] = useState(progress?.name || 'Learner');
    const [notificationsEnabled, setNotificationsEnabled] = useState(settings?.notifications || false);
    const [dailyGoal, setDailyGoal] = useState(settings?.dailyGoal || 10);
    const [fontSize, setFontSize] = useState(settings?.fontSize || 'M');
    const [autoPlayAudio, setAutoPlayAudio] = useState(settings?.autoPlayAudio || false);
    const [geminiApiKey, setGeminiApiKey] = useState(settings?.geminiApiKey || '');
    const [showKey, setShowKey] = useState(false);
    const importInputRef = useRef(null);

    useEffect(() => {
        if (progress?.name) setName(progress.name);
    }, [progress]);

    // Save settings when they change
    useEffect(() => {
        if (setSettings) {
            setSettings(prev => ({
                ...prev,
                dailyGoal,
                fontSize,
                autoPlayAudio,
                notifications: notificationsEnabled,
                geminiApiKey
            }));
        }
    }, [dailyGoal, fontSize, autoPlayAudio, notificationsEnabled, geminiApiKey]);

    const saveName = () => {
        setProgress(prev => ({ ...prev, name }));
    };

    const handleReset = async () => {
        if (confirm('Are you sure? This will PERMANENTLY delete ALL your data including Vocabulary, Progress, Achievements, and Chat History. This action cannot be undone.')) {
            try {
                // Clear IndexedDB
                await DB.clear('vocab');
                await DB.clear('progress');
                await DB.clear('settings');
                await DB.clear('trash');

                // Clear LocalStorage
                localStorage.clear();

                // Reload
                window.location.reload();
            } catch (error) {
                console.error("Failed to reset data:", error);
                alert("Failed to reset data completely. Please try again.");
            }
        }
    };

    const handleClearChat = () => {
        if (confirm('Hapus semua histori percakapan AI Mentor?')) {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('chat_history_')) {
                    localStorage.removeItem(key);
                }
            });
            alert('Histori percakapan telah dihapus.');
        }
    };

    const toggleNotifications = async () => {
        if (!notificationsEnabled) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                setNotificationsEnabled(true);
                new Notification("Notifications Enabled", { body: "We'll remind you to practice!" });
            }
        } else {
            setNotificationsEnabled(false);
        }
    };

    const handleExport = () => {
        const data = {
            vocab: JSON.parse(localStorage.getItem('vocab_app_data') || '[]'),
            progress: JSON.parse(localStorage.getItem('vocab_app_progress') || '{}'),
            settings: JSON.parse(localStorage.getItem('vocab_app_settings') || '{}'),
            exportedAt: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lingoquest-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImport = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result);
                if (data.vocab) localStorage.setItem('vocab_app_data', JSON.stringify(data.vocab));
                if (data.progress) localStorage.setItem('vocab_app_progress', JSON.stringify(data.progress));
                if (data.settings) localStorage.setItem('vocab_app_settings', JSON.stringify(data.settings));
                alert('Data imported successfully! Refreshing...');
                window.location.reload();
            } catch (err) {
                alert('Invalid backup file');
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-[var(--text-main)]">Settings</h2>

            {/* Profile Section */}
            <div className="premium-card p-6 space-y-4 shadow-sm">
                <h4 className="font-bold text-[var(--text-muted)] text-sm uppercase tracking-widest">Profile</h4>
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full text-left">
                        <label className="block text-xs font-bold text-[var(--text-muted)] mb-1 uppercase tracking-wider">Your Name</label>
                        <input
                            type="text"
                            className="w-full bg-[var(--input-bg)] text-[var(--text-main)] px-4 py-3 rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none font-bold border border-[var(--border-light)] transition-all"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={saveName}
                        className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all"
                    >
                        Save changes
                    </button>
                </div>
            </div>

            {/* AI Integration Section */}
            <div className="premium-card p-6 space-y-4 shadow-sm bg-gradient-to-br from-[var(--bg-card)] to-indigo-500/5">
                <div className="flex items-center gap-2">
                    <h4 className="font-bold text-[var(--text-muted)] text-sm uppercase tracking-widest">AI Integration</h4>
                    <span className="px-2 py-0.5 bg-indigo-500 text-white text-[10px] font-bold rounded-full">NEW</span>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500 border border-indigo-500/20 mt-1">
                            <Bot size={20} />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-[var(--text-main)]">Groq Cloud AI</h4>
                            <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                                Ultra-fast smart features powered by Llama 3.
                                <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline ml-1">
                                    Get your free Groq key
                                </a>.
                            </p>
                        </div>
                    </div>

                    <div className="relative">
                        <input
                            type={showKey ? "text" : "password"}
                            className="w-full bg-[var(--input-bg)] text-[var(--text-main)] pl-4 pr-12 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium border border-[var(--border-light)] transition-all placeholder:opacity-50 text-sm"
                            placeholder="Paste your Groq API Key (gsk_...)"
                            value={geminiApiKey}
                            onChange={(e) => setGeminiApiKey(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowKey(!showKey)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)] p-1 rounded-lg transition-colors"
                        >
                            {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Appearance Section */}
            <div className="premium-card p-6 space-y-4 shadow-sm">
                <h4 className="font-bold text-[var(--text-muted)] text-sm uppercase tracking-widest">Appearance</h4>
                <div className="flex items-center justify-between p-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[var(--input-bg)] rounded-lg text-[var(--primary)] border border-[var(--border-light)]">
                            {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
                        </div>
                        <div>
                            <h4 className="font-bold text-[var(--text-main)]">Theme Mode</h4>
                            <p className="text-xs text-[var(--text-muted)]">Currently using {theme} mode</p>
                        </div>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className="bg-[var(--primary)] text-white px-5 py-2 rounded-lg font-bold text-sm shadow transition-all hover:bg-[var(--primary-hover)] capitalize"
                    >
                        Switch to {theme === 'light' ? 'dark' : 'light'}
                    </button>
                </div>
            </div>

            {/* Voice Selection */}
            <div className="premium-card p-6 space-y-4 shadow-sm">
                <h4 className="font-bold text-[var(--text-muted)] text-sm uppercase tracking-widest">Voice Settings</h4>
                <div className="flex items-center justify-between p-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[var(--input-bg)] rounded-lg text-[var(--primary)] border border-[var(--border-light)]">
                            <Volume2 size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-[var(--text-main)]">Voice Gender</h4>
                            <p className="text-xs text-[var(--text-muted)]">Choose your preferred study voice</p>
                        </div>
                    </div>
                    <div className="flex bg-[var(--input-bg)] p-1 rounded-xl border border-[var(--border-light)] overflow-x-auto">
                        {['male', 'female', 'mixed'].map(type => (
                            <button
                                key={type}
                                onClick={() => setVoiceType(type)}
                                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap capitalize ${voiceType === type ? 'bg-[var(--primary)] text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="pt-2">
                    <button
                        onClick={() => speak("Hello! I am your Lingo Quest guide. Let's learn together.")}
                        className="w-full py-2 bg-[var(--input-bg)] hover:bg-[var(--bg-hover)] text-[var(--primary)] text-xs font-black uppercase tracking-widest rounded-lg border border-dashed border-[var(--primary)]/30 transition-all"
                    >
                        Test Voice
                    </button>
                </div>
            </div>

            {/* Study Preferences */}
            <div className="premium-card p-6 space-y-4 shadow-sm">
                <h4 className="font-bold text-[var(--text-muted)] text-sm uppercase tracking-widest">Study Preferences</h4>

                {/* Daily Goal */}
                <div className="flex items-center justify-between p-2">
                    <div>
                        <h4 className="font-bold text-[var(--text-main)]">Daily Word Goal</h4>
                        <p className="text-xs text-[var(--text-muted)]">Words to learn per day</p>
                    </div>
                    <select
                        className="bg-[var(--input-bg)] border border-[var(--border-light)] rounded-lg px-3 py-2 text-sm font-bold text-[var(--text-main)]"
                        value={dailyGoal}
                        onChange={(e) => setDailyGoal(Number(e.target.value))}
                    >
                        <option value={5}>5 words</option>
                        <option value={10}>10 words</option>
                        <option value={15}>15 words</option>
                        <option value={20}>20 words</option>
                        <option value={30}>30 words</option>
                    </select>
                </div>

                {/* Font Size */}
                <div className="flex items-center justify-between p-2">
                    <div>
                        <h4 className="font-bold text-[var(--text-main)]">Card Font Size</h4>
                        <p className="text-xs text-[var(--text-muted)]">Flashcard text size</p>
                    </div>
                    <div className="flex bg-[var(--input-bg)] p-1 rounded-lg border border-[var(--border-light)]">
                        {['S', 'M', 'L'].map(size => (
                            <button
                                key={size}
                                onClick={() => setFontSize(size)}
                                className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${fontSize === size ? 'bg-[var(--primary)] text-white' : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'}`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Auto-play Audio */}
                <div className="flex items-center justify-between p-2">
                    <div>
                        <h4 className="font-bold text-[var(--text-main)]">Auto-play Pronunciation</h4>
                        <p className="text-xs text-[var(--text-muted)]">Play audio when viewing cards</p>
                    </div>
                    <button
                        onClick={() => setAutoPlayAudio(!autoPlayAudio)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${autoPlayAudio ? 'bg-[var(--success)]' : 'bg-[var(--input-bg)] border border-[var(--border-light)]'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${autoPlayAudio ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                </div>
            </div>

            {/* Data Management */}
            <div className="premium-card p-6 space-y-4 shadow-sm">
                <h4 className="font-bold text-[var(--text-muted)] text-sm uppercase tracking-widest">Data Management</h4>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={handleExport}
                        className="p-4 bg-[var(--input-bg)] rounded-xl border border-[var(--border-light)] text-left hover:border-[var(--primary)]/50 transition-all flex items-center gap-3"
                    >
                        <Download size={20} className="text-[var(--primary)]" />
                        <div>
                            <h4 className="font-bold text-[var(--text-main)] text-sm">Export Data</h4>
                            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Download as JSON</p>
                        </div>
                    </button>
                    <button
                        onClick={() => importInputRef.current?.click()}
                        className="p-4 bg-[var(--input-bg)] rounded-xl border border-[var(--border-light)] text-left hover:border-[var(--primary)]/50 transition-all flex items-center gap-3"
                    >
                        <Upload size={20} className="text-[var(--primary)]" />
                        <div>
                            <h4 className="font-bold text-[var(--text-main)] text-sm">Import Data</h4>
                            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Restore from file</p>
                        </div>
                    </button>
                    <input
                        ref={importInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        className="hidden"
                    />
                </div>
            </div>

            {/* Notifications & Data */}
            <div className="premium-card overflow-hidden shadow-sm">
                <div className="p-4 border-b border-[var(--border-light)] flex items-center justify-between bg-[var(--bg-card)]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[var(--input-bg)] rounded-lg text-[var(--primary)] border border-[var(--border-light)]"><Bell size={20} /></div>
                        <div>
                            <h4 className="font-bold text-[var(--text-main)]">Daily Reminders</h4>
                            <p className="text-xs text-[var(--text-muted)]">Get notified to keep your streak</p>
                        </div>
                    </div>

                    <button
                        onClick={toggleNotifications}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${notificationsEnabled ? 'bg-[var(--success)]' : 'bg-[var(--input-bg)] border border-[var(--border-light)]'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                </div>

                <div className="p-4 flex items-center justify-between hover:bg-orange-500/5 transition-colors cursor-pointer group border-b border-[var(--border-light)]" onClick={handleClearChat}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500 group-hover:bg-orange-500/20 border border-orange-500/20"><MessageSquare size={20} /></div>
                        <div>
                            <h4 className="font-bold text-orange-500">Bersihkan Histori Chat</h4>
                            <p className="text-xs text-orange-400 opacity-80">Hapus semua percakapan dengan AI Mentor</p>
                        </div>
                    </div>
                    <ChevronRight size={18} className="text-orange-500/50" />
                </div>

                <div className="p-4 flex items-center justify-between hover:bg-red-500/5 transition-colors cursor-pointer group" onClick={handleReset}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/10 rounded-lg text-red-500 group-hover:bg-red-500/20 border border-red-500/20"><Trash2 size={20} /></div>
                        <div>
                            <h4 className="font-bold text-red-500">Reset All Data</h4>
                            <p className="text-xs text-red-400 opacity-80">Start fresh (cannot be undone)</p>
                        </div>
                    </div>
                    <ChevronRight size={18} className="text-red-500/50" />
                </div>
            </div>

            <div className="text-center text-xs text-[var(--text-muted)] mt-12 pb-8">
                LingoQuest Version 1.3.0 • Build 2026.1
            </div>
        </div>
    );
}

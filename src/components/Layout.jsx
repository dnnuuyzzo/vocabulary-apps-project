import { Home, Folder, Zap, LayoutGrid, Search, Menu, Bell, Sun, Moon, Settings, Headphones, Plus, Clock, Play, Pause, SkipBack, SkipForward, X, Shuffle, Repeat, Award, Trophy, Bot, MessageSquare, ChevronRight, Brain, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';

const NavItem = ({ icon: Icon, label, to }) => ( // eslint-disable-line no-unused-vars
    <NavLink
        to={to}
        className={({ isActive }) => `flex items-center w-full px-4 py-3 gap-4 rounded-lg transition-all text-sm font-semibold mb-1
      ${isActive
                ? 'text-white bg-[var(--primary)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)]'
            }`}
    >
        {({ isActive }) => (
            <>
                <Icon size={20} className={isActive ? 'text-white' : ''} strokeWidth={2.5} />
                <span>{label}</span>
            </>
        )}
    </NavLink>
);

/**
 * Layout.jsx
 * 
 * The "Shell" of the application.
 * It remains visible on every page.
 * 
 * Includes:
 * 1. Sidebar (Navigation Menu)
 * 2. Header (Search Bar, Theme Toggle)
 * 3. Main Content Area (Where the page changes)
 * 4. Mini Player (Persistent audio controls at the bottom)
 */
export default function Layout({ children }) {
    const { theme, toggleTheme } = useApp();
    const navigate = useNavigate();



    const {
        setShowAddModal, lastAction, setLastAction, undoDelete, vocab,
        // Persistent Audio
        isAudioPlaying, setIsAudioPlaying, currentAudioIndex, setCurrentAudioIndex,
        audioPlaybackSpeed, isAudioShuffle, setIsAudioShuffle, isAudioRepeat, setIsAudioRepeat,
        isMiniPlayerVisible, setIsMiniPlayerVisible,
        newUnlocked, isSessionActive // Get notification and session state
    } = useApp();
    const [searchHistory, setSearchHistory] = useState(['Flashcards', 'Humongous', 'Culture']); // Mock history
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [showMobileSearch, setShowMobileSearch] = useState(false);

    const handleSearch = (e) => {
        setSearchValue(e.target.value);
    };

    const handleRemoveHistory = (e, itemToRemove) => {
        e.stopPropagation();
        setSearchHistory(prev => prev.filter(item => item !== itemToRemove));
    };



    return (
        <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-main)] flex flex-col md:flex-row transition-colors duration-300">
            {/* === MOBILE TOP BAR === 
                Visible only on small screens. Contains Menu & Theme toggle.
            */}
            <div className="md:hidden flex items-center justify-between p-4 bg-[var(--bg-sidebar)] border-b border-[var(--border-light)] sticky top-0 z-[100]">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/settings')} className="text-[var(--text-main)]">
                        <Menu />
                    </button>
                    <div className="text-xl font-black text-[var(--primary)] tracking-tighter uppercase">GENGO</div>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-[var(--bg-hover)] transition-colors">
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                    <Bell className="text-[var(--text-main)]" />
                </div>
            </div>

            {/* === SIDEBAR (Desktop) === 
                The main navigation rail on the left.
                Sticky position ensures it stays visible while scrolling.
            */}
            <aside className="hidden md:flex flex-col w-64 bg-[rgba(var(--bg-sidebar-rgb),0.5)] backdrop-blur-xl border-r border-[var(--border-light)] h-screen sticky top-0 z-30 overflow-y-auto glass-effect">
                <div className="p-6 flex items-center mb-6">
                    <div className="text-2xl font-black text-[var(--primary)] tracking-tighter uppercase">GENGO<span className="text-[var(--text-main)]">.</span></div>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    <NavItem icon={Home} label="Home" to="/dashboard" />
                    <NavItem icon={Folder} label="Your library" to="/vocab" />
                    <NavItem icon={Zap} label="Learn" to="/learn" />
                    <NavItem icon={Headphones} label="Listen" to="/listen" />
                    <NavItem icon={MessageSquare} label="AI Mentor" to="/ai-mentor" />
                    <NavItem icon={Trophy} label="Achievements" to="/achievements" />
                    <NavItem icon={LayoutGrid} label="Game" to="/game" />
                </nav>

                {/* Bottom Sidebar Action */}
                <div className="p-4 mt-auto">
                    <NavItem icon={Settings} label="Settings" to="/settings" />
                </div>
            </aside>

            {/* === MAIN CONTENT === 
                The right side area where pages (Dashboard, Learn, etc.) are rendered.
            */}
            <div className="flex-1 bg-[var(--bg-app)] flex flex-col min-w-0">
                {/* Top Search Bar (Desktop) */}
                <header className="hidden md:flex items-center gap-4 px-8 py-4 sticky top-0 bg-[rgba(var(--bg-app-rgb),0.4)] z-[100] glass-effect">
                    <div className="relative w-full max-w-2xl flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                        <input
                            type="text"
                            placeholder="Find it faster with a search"
                            className="w-full bg-[var(--input-bg)] text-[var(--text-main)] pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] font-medium placeholder-[var(--text-muted)] transition-all border border-[var(--border-light)]"
                            value={searchValue}
                            onChange={handleSearch}

                            onFocus={() => {
                                setIsSearchFocused(true);
                                // Suggest random words if empty
                                if (!searchValue) {
                                    // Could set a "suggested" mode here if needed, but existing logic handles history/results.
                                    // The user wants "Successions/Suggestions" + "Tags" immediately.
                                    // Logic below handles this via isSearchFocused
                                }
                            }}
                            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                        />
                        {/* Live Search Results Dropdown */}
                        {isSearchFocused && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                                {searchValue ? (
                                    // SHOW RESULTS
                                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                        <div className="px-4 py-2 border-b border-[var(--border-light)] bg-[var(--bg-app)]">
                                            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Search Results</span>
                                        </div>
                                        {vocab.filter(v =>
                                            v.word.toLowerCase().includes(searchValue.toLowerCase()) ||
                                            v.meaning.toLowerCase().includes(searchValue.toLowerCase())
                                        ).length > 0 ? (
                                            vocab.filter(v =>
                                                v.word.toLowerCase().includes(searchValue.toLowerCase()) ||
                                                v.meaning.toLowerCase().includes(searchValue.toLowerCase())
                                            ).slice(0, 5).map(v => (
                                                <button
                                                    key={v.id}
                                                    onMouseDown={() => {
                                                        navigate(`/review/${v.id}`);
                                                        setSearchValue('');
                                                        setIsSearchFocused(false);
                                                    }}
                                                    className="w-full text-left px-4 py-3 text-sm hover:bg-[var(--bg-hover)] transition-colors flex items-center justify-between group border-b border-[var(--border-light)] last:border-0"
                                                >
                                                    <div>
                                                        <div className="font-bold text-[var(--text-main)]">{v.word}</div>
                                                        <div className="text-xs text-[var(--text-muted)] mt-0.5">{v.meaning}</div>
                                                    </div>
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Zap size={14} className="text-[var(--primary)]" />
                                                    </div>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-4 py-4 text-center text-[var(--text-muted)] italic text-sm">
                                                No matches found
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    // SHOW HISTORY & SUGGESTIONS
                                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                        {/* History Section */}
                                        {searchHistory.length > 0 && (
                                            <div className="mb-2">
                                                <div className="px-4 py-2 border-b border-[var(--border-light)] bg-[var(--bg-app)] sticky top-0 z-10">
                                                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Recent Searches</span>
                                                </div>
                                                {searchHistory.map((item, i) => (
                                                    <div
                                                        key={i}
                                                        className="w-full group/history flex items-center hover:bg-[var(--bg-hover)] transition-colors"
                                                    >
                                                        <button
                                                            onMouseDown={() => setSearchValue(item)}
                                                            className="flex-1 text-left px-4 py-3 text-sm font-medium flex items-center gap-3 text-[var(--text-main)]"
                                                        >
                                                            <Clock size={14} className="text-[var(--text-muted)]" />
                                                            {item}
                                                        </button>
                                                        <button
                                                            onMouseDown={(e) => handleRemoveHistory(e, item)}
                                                            className="p-3 text-[var(--text-muted)] hover:text-red-500 opacity-0 group-hover/history:opacity-100 transition-all"
                                                            title="Remove from history"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Suggestions Section */}
                                        <div>
                                            <div className="px-4 py-2 border-b border-[var(--border-light)] bg-[var(--bg-app)] sticky top-0 z-10">
                                                <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Suggestions for you</span>
                                            </div>

                                            {/* Random Word Suggestions */}
                                            {vocab.slice(0, 5).map(v => (
                                                <button
                                                    key={v.id}
                                                    onMouseDown={() => {
                                                        navigate(`/review/${v.id}`);
                                                        setSearchValue('');
                                                        setIsSearchFocused(false);
                                                    }}
                                                    className="w-full text-left px-4 py-3 text-sm hover:bg-[var(--bg-hover)] transition-colors flex items-center justify-between group border-b border-[var(--border-light)] last:border-0"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-[var(--input-bg)] flex items-center justify-center text-[var(--text-muted)]">
                                                            <Zap size={14} />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-[var(--text-main)]">{v.word} - {v.meaning}</div>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleTheme}
                            className="p-3 rounded-xl bg-[var(--input-bg)] text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-all border border-[var(--border-light)] shadow-sm"
                            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                        >
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>
                        <button className="p-3 rounded-xl bg-[var(--input-bg)] text-[var(--text-main)] hover:bg-[var(--bg-hover)] border border-[var(--border-light)] shadow-sm transition-all">
                            <Bell size={20} />
                        </button>
                    </div>
                </header>

                <main className="flex-1 p-4 pb-24 md:p-8 max-w-7xl mx-auto w-full">
                    {children}
                </main>
            </div>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--bg-sidebar)] px-4 py-2 flex justify-between items-center z-50 border-t border-[var(--border-light)] outline-none">
                <NavLink to="/dashboard" className={({ isActive }) => `p-2 ${isActive ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}`}><Home /></NavLink>
                <NavLink to="/vocab" className={({ isActive }) => `p-2 ${isActive ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}`}><Folder /></NavLink>
                <NavLink to="/learn" className={({ isActive }) => `p-2 ${isActive ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}`}><Zap /></NavLink>
                <button onClick={() => setShowMobileSearch(true)} className="p-4 -mt-8 bg-[var(--primary)] rounded-full text-white shadow-lg border-4 border-[var(--bg-app)]"><Search /></button>
                <NavLink to="/ai-mentor" className={({ isActive }) => `p-2 ${isActive ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}`}><Bot size={24} /></NavLink>
                <NavLink to="/achievements" className={({ isActive }) => `p-2 ${isActive ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}`}><Trophy size={24} /></NavLink>
                <NavLink to="/settings" className={({ isActive }) => `p-2 ${isActive ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}`}><Menu /></NavLink>
            </nav>

            {/* Mobile Search Modal */}
            {showMobileSearch && (
                <div className="md:hidden fixed inset-0 z-[1000] bg-[var(--bg-app)] animate-in fade-in duration-200">
                    <div className="flex flex-col h-full">
                        {/* Header */}
                        <div className="flex items-center gap-3 p-4 border-b border-[var(--border-light)]">
                            <button
                                onClick={() => { setShowMobileSearch(false); setSearchValue(''); }}
                                className="p-2 text-[var(--text-muted)] hover:bg-[var(--bg-hover)] rounded-lg"
                            >
                                <X size={20} />
                            </button>
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search words..."
                                    autoFocus
                                    className="w-full bg-[var(--input-bg)] text-[var(--text-main)] pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] font-medium border border-[var(--border-light)]"
                                    value={searchValue}
                                    onChange={handleSearch}
                                />
                            </div>
                        </div>

                        {/* Results */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {searchValue ? (
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-3">Results</p>
                                    {vocab.filter(v =>
                                        v.word.toLowerCase().includes(searchValue.toLowerCase()) ||
                                        v.meaning.toLowerCase().includes(searchValue.toLowerCase())
                                    ).length > 0 ? (
                                        vocab.filter(v =>
                                            v.word.toLowerCase().includes(searchValue.toLowerCase()) ||
                                            v.meaning.toLowerCase().includes(searchValue.toLowerCase())
                                        ).map(v => (
                                            <button
                                                key={v.id}
                                                onClick={() => {
                                                    navigate(`/review/${v.id}`);
                                                    setShowMobileSearch(false);
                                                    setSearchValue('');
                                                }}
                                                className="w-full text-left p-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border-light)] hover:border-[var(--primary)]/50 transition-all"
                                            >
                                                <div className="font-bold text-[var(--text-main)]">{v.word}</div>
                                                <div className="text-xs text-[var(--text-muted)] mt-1">{v.meaning}</div>
                                            </button>
                                        ))
                                    ) : (
                                        <p className="text-center text-[var(--text-muted)] py-8">No words found</p>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center text-[var(--text-muted)] py-12">
                                    <Search size={40} className="mx-auto mb-4 opacity-30" />
                                    <p className="font-bold">Type to search your vocabulary</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Action Button (FAB) */}
            {!isSessionActive && useLocation().pathname !== '/ai-mentor' && (
                <button
                    onClick={() => navigate('/add-word')}
                    className="fixed bottom-24 md:bottom-8 right-8 w-14 h-14 bg-[var(--primary)] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[60] group"
                    title="Add New Word"
                >
                    {/* Tooltip */}
                    <span className="absolute right-full mr-4 px-3 py-1.5 bg-gray-900/90 backdrop-blur-sm text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap pointer-events-none shadow-xl translate-x-2 group-hover:translate-x-0 duration-200">
                        Add New Word
                        <span className="absolute top-1/2 -right-1 -translate-y-1/2 border-4 border-transparent border-l-gray-900/90"></span>
                    </span>
                    <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>
            )}


            {/* Achievement Toast Notification */}
            {newUnlocked && (
                <div className="fixed top-4 right-4 z-[1100] animate-in slide-in-from-top-4 duration-500 fade-in">
                    <div className="bg-[var(--bg-card)] border border-yellow-500/30 shadow-2xl rounded-2xl p-4 flex items-center gap-4 max-w-sm relative overflow-hidden">
                        {/* Shine bg */}
                        <div className="absolute inset-0 bg-yellow-500/5"></div>

                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 shrink-0 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 animate-bounce">
                            <Trophy size={24} className="fill-white" />
                        </div>
                        <div className="flex-1 min-w-0 z-10">
                            <h4 className="font-black text-[var(--text-main)] text-sm mb-0.5">Achievement Unlocked!</h4>
                            <p className="font-bold text-[var(--primary)] text-lg leading-tight">{newUnlocked.title}</p>
                            <p className="text-xs text-[var(--text-muted)] truncate">{newUnlocked.description}</p>
                        </div>
                        {/* Close button implied by timeout, or user can ignore */}
                    </div>
                </div>
            )}

            {/* Undo Notification Toast */}
            {lastAction && (
                <div className="fixed bottom-32 md:bottom-24 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-bottom-5 duration-300">
                    <div className="bg-[var(--bg-card)] border border-[var(--border-light)] shadow-2xl rounded-2xl p-4 flex items-center gap-6 min-w-[300px]">
                        <div className="flex-1">
                            <p className="text-sm font-bold text-[var(--text-main)]">
                                {lastAction.type === 'delete' ? 'Vocabulary deleted' : 'Action complete'}
                            </p>
                            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">10s to undo</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setLastAction(null)}
                                className="px-3 py-1.5 text-xs font-bold text-[var(--text-muted)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
                            >
                                Dismiss
                            </button>
                            <button
                                onClick={undoDelete}
                                className="px-4 py-1.5 text-xs font-black bg-[var(--primary)] text-white rounded-lg shadow-lg hover:bg-[var(--primary-hover)] active:scale-95 transition-all uppercase tracking-widest"
                            >
                                Undo
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Persistent Mini Player */}
            {isMiniPlayerVisible && vocab.length > 0 && (
                <div className="fixed bottom-24 md:bottom-8 right-4 md:right-8 w-80 md:w-96 z-[60] animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <div className="bg-[var(--bg-card)]/95 backdrop-blur-xl border-2 border-[var(--primary)]/30 shadow-2xl rounded-3xl p-5 relative">
                        {/* Close Button */}
                        <button
                            onClick={() => {
                                setIsMiniPlayerVisible(false);
                                stopAudio();
                            }}
                            className="absolute top-3 right-3 p-1.5 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                            <X size={16} />
                        </button>

                        {/* Header */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-[var(--primary)] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[var(--primary)]/20 shrink-0">
                                {isAudioPlaying ? (
                                    <div className="flex gap-1 items-center h-6">
                                        <div className="w-1 bg-white/80 rounded-full h-3 animate-[bounce_1s_infinite]" style={{ animationDelay: '0s' }}></div>
                                        <div className="w-1 bg-white rounded-full h-5 animate-[bounce_1.2s_infinite]" style={{ animationDelay: '0.1s' }}></div>
                                        <div className="w-1 bg-white rounded-full h-4 animate-[bounce_0.8s_infinite]" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-1 bg-white/80 rounded-full h-2 animate-[bounce_1.1s_infinite]" style={{ animationDelay: '0.3s' }}></div>
                                    </div>
                                ) : (
                                    <Headphones size={24} />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <span className="text-[9px] font-black text-[var(--primary)] uppercase tracking-widest block mb-0.5">Now Playing</span>
                                <h4 className="font-bold text-[var(--text-main)] truncate text-base">
                                    {vocab[currentAudioIndex]?.word || 'No word'}
                                </h4>
                                <p className="text-xs text-[var(--text-muted)] truncate">
                                    {vocab[currentAudioIndex]?.meaning?.toLowerCase() || ''}
                                </p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-[var(--input-bg)] h-1 rounded-full overflow-hidden mb-4">
                            <div
                                className="bg-[var(--primary)] h-full transition-all duration-300"
                                style={{ width: `${((currentAudioIndex + 1) / vocab.length) * 100}%` }}
                            ></div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-1">
                                {/* Shuffle */}
                                <button
                                    onClick={() => setIsAudioShuffle(!isAudioShuffle)}
                                    className={`p-2 rounded-lg transition-all ${isAudioShuffle ? 'text-[var(--primary)] bg-[var(--primary)]/10' : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'}`}
                                    title="Shuffle"
                                >
                                    <Shuffle size={16} />
                                </button>

                                {/* Repeat */}
                                <button
                                    onClick={() => setIsAudioRepeat(!isAudioRepeat)}
                                    className={`p-2 rounded-lg transition-all ${isAudioRepeat ? 'text-[var(--primary)] bg-[var(--primary)]/10' : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'}`}
                                    title="Repeat"
                                >
                                    <Repeat size={16} />
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Previous */}
                                <button
                                    onClick={() => setCurrentAudioIndex(prev => Math.max(0, prev - 1))}
                                    disabled={currentAudioIndex === 0}
                                    className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] disabled:opacity-30 transition-all active:scale-90"
                                >
                                    <SkipBack size={20} fill="currentColor" />
                                </button>

                                {/* Play/Pause */}
                                <button
                                    onClick={() => setIsAudioPlaying(!isAudioPlaying)}
                                    className="w-10 h-10 bg-[var(--primary)] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
                                >
                                    {isAudioPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
                                </button>

                                {/* Next */}
                                <button
                                    onClick={() => setCurrentAudioIndex(prev => Math.min(vocab.length - 1, prev + 1))}
                                    disabled={currentAudioIndex === vocab.length - 1}
                                    className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] disabled:opacity-30 transition-all active:scale-90"
                                >
                                    <SkipForward size={20} fill="currentColor" />
                                </button>
                            </div>

                            {/* Open Full Player */}
                            <button
                                onClick={() => navigate('/listen')}
                                className="text-[10px] font-black text-[var(--text-muted)] hover:text-[var(--primary)] transition-all uppercase tracking-widest px-2 py-1 hover:bg-[var(--primary)]/5 rounded-lg"
                            >
                                Open
                            </button>
                        </div>

                        {/* Speed Indicator */}
                        <div className="absolute top-3 left-3 px-2 py-0.5 bg-[var(--input-bg)] rounded-md text-[9px] font-black text-[var(--text-muted)]">
                            {audioPlaybackSpeed}x
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

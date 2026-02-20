import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Plus, Search, Trash2, Volume2, Filter, X, Check, ArrowUpDown, BookOpen, ChevronLeft, ChevronRight, Book } from 'lucide-react';

/**
 * VocabList.jsx
 * 
 * The main data view of the application.
 */

const VocabCard = ({ v, pinColorClass, speak, openEditModal, deleteVocab, restoreVocab, permanentDeleteVocab, setConfirmModal, isTrashView, navigate }) => {
    const [meaningIdx, setMeaningIdx] = useState(0);
    const [exampleIdx, setExampleIdx] = useState(0);

    const meanings = v.meaning.split(', ');
    const examples = v.example ? v.example.split('|||') : [];

    const nextMeaning = (e) => {
        e.stopPropagation();
        setMeaningIdx((prev) => (prev + 1) % meanings.length);
    };

    const prevMeaning = (e) => {
        e.stopPropagation();
        setMeaningIdx((prev) => (prev - 1 + meanings.length) % meanings.length);
    };

    const nextExample = (e) => {
        e.stopPropagation();
        setExampleIdx((prev) => (prev + 1) % examples.length);
    };

    const prevExample = (e) => {
        e.stopPropagation();
        setExampleIdx((prev) => (prev - 1 + examples.length) % examples.length);
    };

    return (
        <div
            onClick={() => navigate && navigate(`/review/${v.id}`)}
            className={`group relative ${pinColorClass} cursor-pointer`}
        >
            <div className="premium-card p-5 scale-100 group-hover:scale-[1.02] active:scale-[0.98] transition-all pin-colorful-border bg-[var(--bg-card)] border border-[var(--border-light)] flex flex-col shadow-sm" style={{ height: '240px' }}>
                <div className="flex flex-col gap-3 flex-1 min-h-0">
                    <div className="flex justify-between items-start shrink-0">
                        <div className="flex-1 min-w-0 pr-2">
                            <h3 className="text-lg font-black text-[var(--text-main)] tracking-tight group-hover:text-vibrant pin-text-vibrant transition-colors truncate">
                                {v.word}
                            </h3>

                            <div className="flex items-center gap-1 mt-1">
                                {meanings.length > 1 && (
                                    <button onClick={prevMeaning} className="p-0.5 text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">
                                        <ChevronLeft size={12} />
                                    </button>
                                )}
                                <p className="text-[var(--text-muted)] font-bold text-xs truncate flex-1 leading-tight">
                                    {meanings[meaningIdx].toLowerCase()}
                                    {meanings.length > 1 && <span className="ml-1 text-[9px] text-[var(--text-muted)]/50">({meaningIdx + 1}/{meanings.length})</span>}
                                </p>
                                {meanings.length > 1 && (
                                    <button onClick={nextMeaning} className="p-0.5 text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">
                                        <ChevronRight size={12} />
                                    </button>
                                )}
                            </div>

                            {/* Synonyms removed from here */}
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); speak(v.word); }}
                            className="w-8 h-8 rounded-xl bg-[var(--input-bg)] flex items-center justify-center text-[var(--text-muted)] hover:pin-colorful pin-text-vibrant transition-all shadow-sm border border-[var(--border-light)] shrink-0"
                        >
                            <Volume2 size={16} />
                        </button>
                    </div>

                    <div className="flex-1 min-h-0 flex items-center mt-2 group/example relative">
                        {examples.length > 0 ? (
                            <div className="w-full bg-[var(--input-bg)]/50 rounded-xl p-3 border border-[var(--border-light)]/50 relative overflow-hidden h-full flex flex-col justify-center">
                                <div className="space-y-1 pr-2 overflow-y-auto custom-scrollbar h-full flex flex-col justify-center">
                                    {(() => {
                                        const ex = examples[exampleIdx];
                                        const match = ex.match(/(.*)\s\((.*)\)/);
                                        if (match) {
                                            return (
                                                <>
                                                    <p className="text-[11px] font-black italic leading-tight text-[var(--text-main)]">"{match[1]}"</p>
                                                    <p className="text-[9px] font-bold text-[var(--text-muted)] opacity-70 leading-tight">{match[2]}</p>
                                                </>
                                            );
                                        }
                                        return <p className="text-[11px] font-black italic leading-tight text-[var(--text-main)] opacity-90">"{ex}"</p>;
                                    })()}
                                </div>

                                {examples.length > 1 && (
                                    <div className="absolute top-0 bottom-0 left-0 right-0 flex items-center justify-between px-1 opacity-0 group-hover/example:opacity-100 transition-opacity pointer-events-none">
                                        <button
                                            onClick={(e) => prevExample(e)}
                                            className="p-1 rounded-full bg-[var(--bg-card)] shadow-sm text-[var(--primary)] pointer-events-auto hover:bg-[var(--primary)] hover:text-white transition-all transform -translate-x-2 group-hover/example:translate-x-0"
                                        >
                                            <ChevronLeft size={14} />
                                        </button>
                                        <button
                                            onClick={(e) => nextExample(e)}
                                            className="p-1 rounded-full bg-[var(--bg-card)] shadow-sm text-[var(--primary)] pointer-events-auto hover:bg-[var(--primary)] hover:text-white transition-all transform translate-x-2 group-hover/example:translate-x-0"
                                        >
                                            <ChevronRight size={14} />
                                        </button>
                                    </div>
                                )}

                                {examples.length > 1 && (
                                    <div className="absolute bottom-1 right-3 flex gap-1">
                                        {examples.map((_, i) => (
                                            <div key={i} className={`w-1 h-1 rounded-full transition-all ${i === exampleIdx ? 'w-3 bg-[var(--primary)]' : 'bg-[var(--border-light)]'}`}></div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-[var(--text-muted)] opacity-30 py-2">
                                <Book size={12} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">No examples</span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-[0.2em] shadow-sm
                        ${v.status === 'new' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                                v.status === 'learning' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                                    'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                            {v.status === 'mastered' ? 'Master' : `${v.practiceCount || 0}/10`}
                        </span>
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-black bg-[var(--input-bg)] text-[var(--text-muted)] uppercase tracking-[0.2em] shadow-sm border border-[var(--border-light)]">
                            {v.level || 'B1'}
                        </span>

                        {v.synonyms && (
                            <div className="flex flex-wrap gap-1 opacity-80">
                                {v.synonyms.split(', ').slice(0, 2).map((syn, i) => (
                                    <span key={i} className="text-[8px] font-bold px-1.5 py-0.5 bg-[var(--primary)]/5 text-[var(--primary)] rounded-md border border-[var(--primary)]/10 lowercase tracking-wide">
                                        {syn}
                                    </span>
                                ))}
                                {v.synonyms.split(', ').length > 2 && (
                                    <span className="text-[8px] text-[var(--text-muted)] font-bold self-center">
                                        +{v.synonyms.split(', ').length - 2}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 pt-4 opacity-0 group-hover:opacity-100 transition-all absolute bottom-5 left-5 right-5 bg-[var(--bg-card)] border-t border-[var(--border-light)]">
                    {!isTrashView ? (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); openEditModal(v); }}
                                className="flex-1 py-1.5 bg-[var(--primary)] text-white rounded-lg font-black text-[10px] shadow-lg shadow-primary/20 hover:bg-[var(--primary-hover)] active:scale-95 transition-all uppercase tracking-widest"
                            >
                                Edit
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); deleteVocab(v.id); }}
                                className="p-1.5 text-[var(--text-muted)] hover:text-red-500 bg-[var(--input-bg)] rounded-lg transition-all active:scale-90 border border-[var(--border-light)]"
                            >
                                <Trash2 size={14} />
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); restoreVocab(v.id); }}
                                className="flex-1 py-1.5 bg-emerald-500 text-white rounded-lg font-black text-[10px] shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 active:scale-95 transition-all uppercase tracking-widest"
                            >
                                Restore
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmModal({
                                        isOpen: true,
                                        title: 'Delete Permanently',
                                        message: `Are you sure you want to delete "${v.word}" forever?`,
                                        action: () => permanentDeleteVocab(v.id)
                                    });
                                }}
                                className="p-1.5 text-[var(--text-muted)] hover:text-red-500 bg-[var(--input-bg)] rounded-lg transition-all active:scale-90 border border-[var(--border-light)]"
                            >
                                <X size={14} />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function VocabList() {
    const { vocab, deleteVocab, speak, trash, restoreVocab, permanentDeleteVocab, emptyTrash } = useApp();
    const navigate = useNavigate();

    const [filter, setFilter] = useState('all');
    const [levelFilter, setLevelFilter] = useState('all_levels');
    const [search, setSearch] = useState('');
    const [isTrashView, setIsTrashView] = useState(false);
    const [sortBy, setSortBy] = useState('az');
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', action: null });

    // Smart Header Logic: Hide on scroll down, show on scroll up
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Show if: scrolling up, or at the very top
            if (currentScrollY < lastScrollY || currentScrollY < 50) {
                setIsVisible(true);
            }
            // Hide if: scrolling down and past the threshold
            else if (currentScrollY > lastScrollY && currentScrollY > 150) {
                setIsVisible(false);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    const getPinColorClass = (id) => {
        const colors = ['pin-blue', 'pin-green', 'pin-purple', 'pin-orange', 'pin-pink', 'pin-teal'];
        const numId = id.split('-').pop() || '0';
        const index = parseInt(numId) || 0;
        return colors[index % colors.length];
    };

    const sourceList = isTrashView ? trash : vocab;

    const filteredVocab = sourceList.filter(v => {
        const matchesFilter = filter === 'all' || v.status === filter;
        const matchesLevel = levelFilter === 'all_levels' || (v.level || 'B1') === levelFilter;
        const matchesSearch = v.word.toLowerCase().includes(search.toLowerCase()) ||
            v.meaning.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch && matchesLevel;
    }).sort((a, b) => {
        switch (sortBy) {
            case 'newest': return new Date(b.createdDate || 0) - new Date(a.createdDate || 0);
            case 'oldest': return new Date(a.createdDate || 0) - new Date(b.createdDate || 0);
            case 'az': return a.word.localeCompare(b.word);
            case 'za': return b.word.localeCompare(a.word);
            default: return 0;
        }
    });

    const openEditModal = (v) => {
        navigate(`/edit-word/${v.id}`);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex justify-between items-center gap-4 flex-wrap">
                <div className="min-w-0 flex-1">
                    <h2 className="text-xl md:text-2xl font-black text-[var(--text-main)] truncate">{isTrashView ? 'Trash' : 'Vocabulary Manager'}</h2>
                    <p className="text-[var(--text-muted)] text-[10px] md:text-sm font-bold truncate">{isTrashView ? 'Items to restore' : 'Manage your word collection'}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                    <button
                        onClick={() => setIsTrashView(!isTrashView)}
                        className={`p-2.5 md:px-4 md:py-2 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-sm ${isTrashView ? 'bg-red-500 text-white' : 'bg-[var(--input-bg)] text-[var(--text-muted)] border border-[var(--border-light)]'}`}
                        title={isTrashView ? 'View Library' : 'View Trash'}
                    >
                        {isTrashView ? <BookOpen size={16} /> : <Trash2 size={16} />}
                        <span className="hidden sm:inline-block">{isTrashView ? 'Library' : `Trash (${trash.length})`}</span>
                        {!isTrashView && <span className="sm:hidden">{trash.length}</span>}
                    </button>
                    {!isTrashView && (
                        <button
                            onClick={() => navigate('/add-word')}
                            className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white p-2.5 md:px-6 md:py-2 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95"
                        >
                            <Plus size={16} /> <span className="hidden sm:inline-block">Add Word</span><span className="sm:hidden">Add</span>
                        </button>
                    )}
                    {isTrashView && trash.length > 0 && (
                        <button
                            onClick={() => setConfirmModal({
                                isOpen: true,
                                title: 'Empty Trash',
                                message: 'Are you sure you want to permanently empty all items in trash? This action cannot be undone.',
                                action: () => emptyTrash()
                            })}
                            className="bg-red-500 hover:bg-red-600 text-white p-2.5 md:px-6 md:py-2 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-red-500/20 transition-all active:scale-95"
                        >
                            <X size={16} /> <span className="hidden sm:inline-block">Empty</span><span className="sm:hidden">Empty</span>
                        </button>
                    )}
                </div>
            </div>

            <div
                className={`premium-card p-5 flex flex-col gap-5 sticky z-[50] bg-[var(--bg-card)]/90 backdrop-blur-xl !overflow-visible shadow-xl border-b border-[var(--border-light)] transition-all duration-500 ease-in-out
                ${isVisible
                        ? 'top-[72px] md:top-[88px] opacity-100'
                        : 'top-[40px] md:top-[60px] -translate-y-full opacity-0 pointer-events-none'
                    }`}
            >
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 w-full">
                        <div className="relative flex-1">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                            <input
                                type="text"
                                placeholder="Search words..."
                                className="w-full pl-12 pr-4 py-3 bg-[var(--input-bg)] border border-[var(--border-light)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--text-main)] placeholder-[var(--text-muted)] transition-all font-bold text-sm"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <button
                                onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                                className="flex items-center gap-2 text-[var(--text-main)] font-bold text-xs px-4 py-3 rounded-xl bg-[var(--input-bg)] hover:bg-[var(--bg-hover)] transition-all whitespace-nowrap border border-[var(--border-light)] uppercase tracking-wider"
                            >
                                <ArrowUpDown size={16} />
                                <span className="hidden sm:inline">Sort</span>
                            </button>
                            {isSortMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsSortMenuOpen(false)}></div>
                                    <div className="absolute top-full right-0 mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                                        {[
                                            { label: 'A-Z', value: 'az' },
                                            { label: 'Z-A', value: 'za' },
                                            { label: 'Newest First', value: 'newest' },
                                            { label: 'Oldest First', value: 'oldest' }
                                        ].map(opt => (
                                            <button
                                                key={opt.value}
                                                onClick={() => { setSortBy(opt.value); setIsSortMenuOpen(false); }}
                                                className={`w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all hover:bg-[var(--bg-hover)] border-b border-[var(--border-light)] last:border-0 ${sortBy === opt.value ? 'text-[var(--primary)] bg-[var(--primary)]/5' : 'text-[var(--text-muted)]'}`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                        <div className="flex p-1 bg-[var(--input-bg)] rounded-xl border border-[var(--border-light)] overflow-x-auto scrollbar-hide w-full sm:w-auto">
                            {['all', 'new', 'learning', 'mastered'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all flex-1 sm:flex-none ${filter === f ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-hide pb-1 sm:pb-0">
                            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider whitespace-nowrap pl-1">Level:</span>
                            {['all_levels', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(lvl => (
                                <button
                                    key={lvl}
                                    onClick={() => setLevelFilter(lvl)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all border ${levelFilter === lvl
                                        ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm'
                                        : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-light)] hover:border-[var(--primary)]/50'
                                        }`}
                                >
                                    {lvl === 'all_levels' ? 'All' : lvl}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredVocab.length === 0 ? (
                    <div className="masonry-item static-card text-center py-20 border-2 border-dashed border-[var(--border-light)] flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-[var(--input-bg)] rounded-3xl flex items-center justify-center mb-6 opacity-30">
                            <Filter size={32} className="text-[var(--text-muted)]" />
                        </div>
                        <p className="text-[var(--text-muted)] font-black text-sm uppercase tracking-widest px-4 opacity-50">No matches found</p>
                    </div>
                ) : (
                    filteredVocab.map(v => (
                        <VocabCard
                            key={v.id}
                            v={v}
                            pinColorClass={getPinColorClass(v.id)}
                            speak={speak}
                            openEditModal={openEditModal}
                            deleteVocab={deleteVocab}
                            restoreVocab={restoreVocab}
                            permanentDeleteVocab={permanentDeleteVocab}
                            setConfirmModal={setConfirmModal}
                            isTrashView={isTrashView}
                            navigate={navigate}
                        />
                    ))
                )}
            </div>

            {confirmModal.isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-[var(--bg-card)] rounded-[32px] w-full max-w-sm p-8 shadow-2xl scale-100 animate-in zoom-in-95 duration-200 border border-[var(--border-light)] relative overflow-hidden text-center">
                        <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <Trash2 size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-[var(--text-main)] mb-3">{confirmModal.title}</h3>
                        <p className="text-[var(--text-muted)] font-bold mb-8 leading-relaxed">
                            {confirmModal.message}
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => { confirmModal.action(); setConfirmModal({ ...confirmModal, isOpen: false }); }}
                                className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-black rounded-2xl shadow-xl shadow-red-500/20 transition-all active:scale-95 uppercase tracking-widest text-xs"
                            >
                                {confirmModal.title.includes('Empty') ? 'Empty Trash' : 'Yes, Delete Forever'}
                            </button>
                            <button
                                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                                className="w-full py-4 text-[var(--text-muted)] font-black hover:bg-[var(--bg-hover)] rounded-2xl transition-colors uppercase tracking-widest text-xs"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

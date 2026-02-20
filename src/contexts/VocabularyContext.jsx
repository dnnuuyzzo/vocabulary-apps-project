import { createContext, useContext, useState, useEffect } from 'react';
import { DB } from '../utils/db';

const VocabularyContext = createContext();

const INITIAL_STATE = {
    vocab: [],
    trash: []
};

export const VocabularyProvider = ({ children }) => {
    const [vocab, setVocab] = useState([]);
    const [trash, setTrash] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastAction, setLastAction] = useState(null);
    const [undoTimer, setUndoTimer] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false); // Modal state

    // Load data from IndexedDB on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                const vocabData = await DB.get('vocab', 'data');
                const trashData = await DB.get('trash', 'data');

                setVocab(vocabData || []);
                setTrash(trashData || []);
            } catch (error) {
                console.error('Error loading vocabulary data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Save vocab to IndexedDB whenever it changes
    useEffect(() => {
        if (!loading) {
            DB.set('vocab', 'data', vocab);
        }
    }, [vocab, loading]);

    // Save trash to IndexedDB whenever it changes
    useEffect(() => {
        if (!loading) {
            DB.set('trash', 'data', trash);
        }
    }, [trash, loading]);

    // Determine word level based on word complexity
    const determineLevel = (word) => {
        const wordLevels = {
            'apple': 'A1', 'book': 'A1', 'cat': 'A1', 'dog': 'A1', 'eat': 'A1',
            'beautiful': 'A2', 'change': 'A2', 'doctor': 'A2', 'future': 'A2',
            'analysis': 'B1', 'behavior': 'B1', 'concept': 'B1', 'data': 'B1',
            'achievement': 'B2', 'complicated': 'B2', 'evaluation': 'B2',
            'adaptation': 'C1', 'complexity': 'C1', 'hypothesis': 'C1',
            'ephemeral': 'C2', 'serendipity': 'C2', 'quintessential': 'C2'
        };
        const lowerWord = word.toLowerCase();
        return wordLevels[lowerWord] || 'B1';
    };

    // Add new vocabulary
    const addVocab = (word, meaning, example = '', manualLevel = null, synonyms = '') => {
        const level = manualLevel || determineLevel(word);
        const newVocab = {
            id: Date.now().toString(),
            word,
            meaning,
            example,
            synonyms,
            level,
            status: 'new',
            practiceCount: 0,
            createdDate: new Date().toISOString()
        };

        setVocab(prev => [newVocab, ...prev]);
        return newVocab;
    };

    // Delete vocabulary (move to trash)
    const deleteVocab = (id) => {
        const itemToDelete = vocab.find(v => v.id === id);
        if (!itemToDelete) return;

        // Clear previous undo timer if exists
        if (undoTimer) clearTimeout(undoTimer);

        // Save to lastAction for immediate undo
        setLastAction({ type: 'delete', data: itemToDelete });

        // Update main list
        setVocab(prev => prev.filter(v => v.id !== id));

        // Move to Trash
        setTrash(prev => [itemToDelete, ...prev]);

        // Set timer to clear undo option after 10 seconds
        const timer = setTimeout(() => {
            setLastAction(null);
            setUndoTimer(null);
        }, 10000);
        setUndoTimer(timer);
    };

    // Undo delete
    const undoDelete = () => {
        if (!lastAction || lastAction.type !== 'delete') return;

        const recoveredItem = lastAction.data;

        // Move back from Trash to Vocab
        setTrash(prev => prev.filter(v => v.id !== recoveredItem.id));
        setVocab(prev => [recoveredItem, ...prev]);

        // Clear action and timer
        setLastAction(null);
        if (undoTimer) clearTimeout(undoTimer);
        setUndoTimer(null);
    };

    // Restore from trash
    const restoreVocab = (id) => {
        const itemToRestore = trash.find(v => v.id === id);
        if (!itemToRestore) return;

        setTrash(prev => prev.filter(v => v.id !== id));
        setVocab(prev => [itemToRestore, ...prev]);
    };

    // Permanent delete from trash
    const permanentDeleteVocab = (id) => {
        setTrash(prev => prev.filter(v => v.id !== id));
    };

    // Empty trash
    const emptyTrash = () => {
        setTrash([]);
    };

    // Update vocabulary status
    const updateVocabStatus = (id, newStatus) => {
        setVocab(prev => prev.map(v => {
            if (v.id === id) {
                return {
                    ...v,
                    status: newStatus,
                    practiceCount: newStatus === 'new' ? 0 : v.practiceCount
                };
            }
            return v;
        }));
    };

    // Update vocabulary details
    const updateVocabDetails = (id, word, meaning, example, level = null, status = null, synonyms = '') => {
        setVocab(prev => prev.map(v => {
            if (v.id === id) {
                return {
                    ...v,
                    word,
                    meaning,
                    example,
                    synonyms: synonyms !== null ? synonyms : v.synonyms,
                    level: level || v.level || determineLevel(word),
                    status: status || v.status,
                    practiceCount: (status === 'new') ? 0 : v.practiceCount
                };
            }
            return v;
        }));
    };

    const value = {
        vocab,
        setVocab,
        trash,
        loading,
        addVocab,
        deleteVocab,
        undoDelete,
        restoreVocab,
        permanentDeleteVocab,
        emptyTrash,
        updateVocabStatus,
        updateVocabDetails,
        lastAction,
        setLastAction,
        showAddModal,
        setShowAddModal
    };

    return (
        <VocabularyContext.Provider value={value}>
            {children}
        </VocabularyContext.Provider>
    );
};

export const useVocabulary = () => {
    const context = useContext(VocabularyContext);
    if (!context) {
        throw new Error('useVocabulary must be used within VocabularyProvider');
    }
    return context;
};

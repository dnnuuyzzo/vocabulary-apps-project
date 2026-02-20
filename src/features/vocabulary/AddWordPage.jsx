import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, Plus, Trash2, Wand2, Sparkles, Check, Brain, Lightbulb, BookOpen, Globe, Volume2 } from 'lucide-react';
import Groq from 'groq-sdk';

/**
 * AddWordPage.jsx
 * 
 * Dedicated page for adding new vocabulary.
 * 2-column layout: Form on left, AI Insights on right.
 */
export default function AddWordPage() {
    const { id } = useParams();
    const { vocab, addVocab, updateVocabDetails, speak, logActivity } = useApp();
    const navigate = useNavigate();

    // Form State
    const [englishWord, setEnglishWord] = useState('');
    const [meanings, setMeanings] = useState(['']);
    const [examples, setExamples] = useState([{ text: '', translation: '' }]);
    const [levelInput, setLevelInput] = useState('A1');
    const [statusInput, setStatusInput] = useState('new');
    const [synonymsInput, setSynonymsInput] = useState('');
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [existingId, setExistingId] = useState(null);

    // Initial load for editing
    useEffect(() => {
        if (id) {
            const wordToEdit = vocab.find(v => v.id === id);
            if (wordToEdit) {
                setEnglishWord(wordToEdit.word);
                setMeanings(wordToEdit.meaning.split(', '));

                const exStr = wordToEdit.example || '';
                const exPairs = exStr.split('|||').filter(Boolean);
                const exObjects = exPairs.map(p => {
                    const match = p.match(/(.*)\s\((.*)\)/);
                    if (match) {
                        return { text: match[1].trim(), translation: match[2].trim() };
                    }
                    return { text: p.trim(), translation: '' };
                });
                setExamples(exObjects.length > 0 ? exObjects : [{ text: '', translation: '' }]);
                setLevelInput(wordToEdit.level || 'A1');
                setStatusInput(wordToEdit.status || 'new');
                setSynonymsInput(wordToEdit.synonyms || '');
            }
        }
    }, [id, vocab]);

    // Duplicate Check
    useEffect(() => {
        if (!id && englishWord.trim()) {
            const duplicate = vocab.find(v => v.word.toLowerCase() === englishWord.trim().toLowerCase());
            if (duplicate) {
                setExistingId(duplicate.id);
            } else {
                setExistingId(null);
            }
        } else {
            setExistingId(null);
        }
    }, [englishWord, vocab, id]);

    // AI Insight State
    const [aiInsight, setAiInsight] = useState(null);
    const [isLoadingInsight, setIsLoadingInsight] = useState(false);

    const handleAddMeaning = () => setMeanings([...meanings, '']);
    const handleRemoveMeaning = (index) => {
        if (meanings.length > 1) {
            setMeanings(meanings.filter((_, i) => i !== index));
        }
    };
    const handleMeaningChange = (index, value) => {
        const newMeanings = [...meanings];
        newMeanings[index] = value;
        setMeanings(newMeanings);
    };

    const handleAddExample = () => setExamples([...examples, { text: '', translation: '' }]);
    const handleRemoveExample = (index) => {
        if (examples.length > 1) {
            setExamples(examples.filter((_, i) => i !== index));
        } else {
            setExamples([{ text: '', translation: '' }]);
        }
    };
    const handleExampleChange = (index, field, value) => {
        const newExamples = [...examples];

        if (field === 'text') {
            const words = value.trim().split(/\s+/).filter(w => w.length > 0);
            const isDeleting = value.length < (examples[index]?.text?.length || 0);
            if (words.length > 20 && !isDeleting) return;
        }

        newExamples[index] = { ...newExamples[index], [field]: value };
        setExamples(newExamples);
    };

    // Fetch AI Insight when word changes (debounced)
    useEffect(() => {
        if (!englishWord.trim() || englishWord.length < 3) {
            setAiInsight(null);
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoadingInsight(true);
            try {
                const apiKey = import.meta.env.VITE_GROQ_API_KEY;
                const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

                const response = await groq.chat.completions.create({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        {
                            role: 'system',
                            content: `You are a fun and educational English vocabulary assistant. For each word, provide interesting information in JSON format:
{
    "etymology": "Brief origin/history of the word (1 sentence)",
    "funFact": "An interesting or surprising fact about this word (1 sentence)",
    "pronunciation": "IPA phonetic spelling",
    "usageTip": "A helpful tip for Indonesian speakers learning this word (1 sentence)",
    "synonyms": ["very accurate synonym 1", "very accurate synonym 2", "...provide as many as relevant"],
    "relatedWords": ["word1", "word2", "word3"]
}
Keep synonyms highly accurate and relevant. provide as many as possible if they are truly synonyms. Output ONLY valid JSON.`
                        },
                        { role: 'user', content: `Word: ${englishWord}` }
                    ],
                    temperature: 0.7,
                    max_tokens: 300
                });

                const text = response.choices[0]?.message?.content || '';
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    setAiInsight(JSON.parse(jsonMatch[0]));
                }
            } catch (error) {
                console.error('AI Insight error:', error);
                setAiInsight(null);
            } finally {
                setIsLoadingInsight(false);
            }
        }, 800);

        return () => clearTimeout(timer);
    }, [englishWord]);

    const handleAutoSuggest = async () => {
        if (!englishWord.trim()) return;

        setIsSuggesting(true);
        try {
            const apiKey = import.meta.env.VITE_GROQ_API_KEY;
            const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

            const response = await groq.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: `You are a vocabulary assistant for Indonesian learners of English.
For the given English word, provide:
1. Up to 3 Indonesian meanings
2. Up to 2 example sentences with Indonesian translations
3. CEFR level (A1-C2)

Output ONLY valid JSON:
{
    "meanings": ["meaning1", "meaning2"],
    "synonyms": ["accurate_syn1", "accurate_syn2", "accurate_syn3", "...as many as relevant"],
    "examples": [{"text": "English sentence", "translation": "Indonesian translation"}],
    "cefr": "B1"
}
Only include synonyms that are strictly accurate and relevant to the most common usage of the word. Provide as many as are truly accurate.`
                    },
                    { role: 'user', content: `Word: ${englishWord}` }
                ],
                temperature: 0.5,
                max_tokens: 400
            });

            const text = response.choices[0]?.message?.content || '';
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const aiData = JSON.parse(jsonMatch[0]);

                if (aiData.meanings && aiData.meanings.length > 0) {
                    setMeanings(aiData.meanings.slice(0, 3));
                }

                if (aiData.synonyms && aiData.synonyms.length > 0) {
                    setSynonymsInput(aiData.synonyms.join(', '));
                }

                if (aiData.examples && aiData.examples.length > 0) {
                    setExamples(aiData.examples.slice(0, 3).map(ex => ({
                        text: ex.text || ex,
                        translation: ex.translation || ''
                    })));
                }

                if (aiData.cefr) {
                    const level = aiData.cefr.toString().toUpperCase().substring(0, 2);
                    if (['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(level)) {
                        setLevelInput(level);
                    }
                }
            }
        } catch (error) {
            console.error("Auto suggest failed:", error);
        } finally {
            setIsSuggesting(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const filteredMeanings = meanings.filter(m => m.trim() !== '');
        const filteredExamples = examples
            .filter(ex => ex.text.trim() !== '')
            .map(ex => ex.translation.trim() ? `${ex.text.trim()} (${ex.translation.trim()})` : ex.text.trim());

        if (englishWord && filteredMeanings.length > 0) {
            const mStr = filteredMeanings.join(', ');
            const exStr = filteredExamples.join('|||');

            if (id) {
                updateVocabDetails(id, englishWord.trim(), mStr, exStr, levelInput || null, statusInput, synonymsInput.trim());
            } else {
                addVocab(englishWord.trim(), mStr, exStr, levelInput || null, synonymsInput.trim());
                logActivity('vocab');
            }

            // Navigate back after saving
            navigate(-1);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-app)] animate-in fade-in duration-300">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-[var(--bg-app)]/80 backdrop-blur-xl border-b border-[var(--border-light)]">
                <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-xl hover:bg-[var(--bg-hover)] text-[var(--text-muted)] transition-colors"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-xl font-black text-[var(--text-main)]">{id ? 'Edit Word' : 'Add New Word'}</h1>
                </div>
            </div>

            {/* Content - 2 Columns */}
            <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
                <div className="flex flex-col lg:flex-row gap-6">

                    {/* Left Column - Form */}
                    <div className="flex-1 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-light)] p-6 md:p-8 shadow-sm">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Word Input */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-xs font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">English Word</label>
                                    <button
                                        type="button"
                                        onClick={handleAutoSuggest}
                                        disabled={!englishWord.trim() || isSuggesting}
                                        className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${!englishWord.trim() || isSuggesting
                                            ? 'text-[var(--text-muted)] opacity-50 cursor-not-allowed bg-[var(--input-bg)]'
                                            : 'bg-[var(--primary)] text-white shadow-lg shadow-primary/30 hover:scale-105 active:scale-95'
                                            }`}
                                        title="Auto-fill with AI"
                                    >
                                        {isSuggesting ? (
                                            <Sparkles size={18} className="animate-spin" />
                                        ) : (
                                            <Wand2 size={18} />
                                        )}
                                    </button>
                                </div>
                                <input
                                    autoFocus
                                    type="text"
                                    className="w-full p-4 bg-[var(--input-bg)] border border-[var(--border-light)] rounded-2xl focus:ring-2 focus:ring-[var(--primary)] focus:outline-none font-bold text-2xl text-[var(--text-main)] transition-all placeholder:opacity-30"
                                    placeholder="e.g., Ephemeral"
                                    value={englishWord}
                                    onChange={(e) => setEnglishWord(e.target.value)}
                                    required
                                />
                                {existingId && (
                                    <div className="mt-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-xl flex items-center justify-between animate-in slide-in-from-top-1 duration-200">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-orange-500 text-white rounded-lg flex items-center justify-center">
                                                <Lightbulb size={14} className="fill-white" />
                                            </div>
                                            <p className="text-xs font-bold text-orange-600 dark:text-orange-400">
                                                This word is already in your vocabulary!
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => navigate(`/edit-word/${existingId}`)}
                                            className="text-[10px] font-black uppercase tracking-widest text-orange-600 hover:underline"
                                        >
                                            Edit Existing
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Synonyms Section */}
                            <div>
                                <label className="block text-xs font-black text-[var(--text-muted)] mb-2 uppercase tracking-[0.2em]">Synonyms</label>
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        className="w-full p-4 bg-[var(--input-bg)] border border-[var(--border-light)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:outline-none text-[var(--text-main)] font-medium transition-all"
                                        placeholder="e.g., fleeting, short-lived"
                                        value={synonymsInput}
                                        onChange={(e) => setSynonymsInput(e.target.value)}
                                    />
                                    {aiInsight?.synonyms && aiInsight.synonyms.length > 0 && (
                                        <div className="flex flex-wrap gap-2 items-center">
                                            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mr-1">AI Suggestions:</span>
                                            {aiInsight.synonyms.map((syn, i) => {
                                                const isSelected = synonymsInput.toLowerCase().includes(syn.toLowerCase());
                                                return (
                                                    <button
                                                        key={i}
                                                        type="button"
                                                        onClick={() => {
                                                            const current = synonymsInput.split(',').map(s => s.trim()).filter(Boolean);
                                                            if (!isSelected) {
                                                                setSynonymsInput(current.length > 0 ? `${synonymsInput.trim()}, ${syn}` : syn);
                                                            } else {
                                                                const filtered = current.filter(s => s.toLowerCase() !== syn.toLowerCase());
                                                                setSynonymsInput(filtered.join(', '));
                                                            }
                                                        }}
                                                        className={`text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${isSelected
                                                            ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-md shadow-primary/20'
                                                            : 'bg-[var(--bg-app)] text-[var(--text-muted)] border-[var(--border-light)] hover:border-[var(--primary)] hover:text-[var(--primary)]'
                                                            }`}
                                                    >
                                                        {isSelected ? <Check size={10} /> : <Plus size={10} />}
                                                        {syn}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Meanings Section */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-xs font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Indonesian</label>
                                    <button
                                        type="button"
                                        onClick={handleAddMeaning}
                                        className="text-[var(--primary)] text-xs font-bold uppercase tracking-wider hover:underline flex items-center gap-1"
                                    >
                                        <Plus size={14} /> Add Meaning
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {meanings.map((m, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="text"
                                                className="flex-1 p-3 bg-[var(--input-bg)] border border-[var(--border-light)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:outline-none text-[var(--text-main)] transition-all font-medium"
                                                placeholder="e.g., Sementara"
                                                value={m}
                                                onChange={(e) => handleMeaningChange(index, e.target.value)}
                                                required={index === 0}
                                            />
                                            {meanings.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveMeaning(index)}
                                                    className="p-2 text-red-400 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Examples Section */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-xs font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Example Sentences</label>
                                    <button
                                        type="button"
                                        onClick={handleAddExample}
                                        className="text-[var(--primary)] text-xs font-bold uppercase tracking-wider hover:underline flex items-center gap-1"
                                    >
                                        <Plus size={14} /> Add Example
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {examples.map((ex, index) => {
                                        const wordCount = ex.text.trim().split(/\s+/).filter(w => w.length > 0).length;
                                        const isLimit = wordCount >= 20;
                                        return (
                                            <div key={index} className="bg-[var(--bg-app)]/50 p-4 rounded-2xl border border-[var(--border-light)] space-y-3 relative">
                                                <div className="flex gap-2">
                                                    <div className="flex-1 space-y-3">
                                                        <div>
                                                            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest block mb-1">English Example</span>
                                                            <textarea
                                                                className={`w-full p-3 bg-[var(--input-bg)] border ${isLimit ? 'border-red-500 ring-1 ring-red-500' : 'border-[var(--border-light)]'} rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:outline-none text-[var(--text-main)] transition-all resize-none text-sm italic h-20`}
                                                                placeholder="e.g., The beauty of the sunset was ephemeral."
                                                                value={ex.text}
                                                                onChange={(e) => handleExampleChange(index, 'text', e.target.value)}
                                                            ></textarea>
                                                        </div>
                                                        <div>
                                                            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest block mb-1">Translation (Indonesian)</span>
                                                            <input
                                                                type="text"
                                                                className="w-full p-3 bg-[var(--input-bg)] border border-[var(--border-light)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:outline-none text-[var(--text-main)] transition-all text-sm"
                                                                placeholder="e.g., Keindahan matahari terbenam itu hanya sementara."
                                                                value={ex.translation}
                                                                onChange={(e) => handleExampleChange(index, 'translation', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveExample(index)}
                                                        className="p-2 text-[var(--text-muted)] hover:text-red-500 transition-colors self-start"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`text-[9px] font-bold uppercase tracking-wider ${isLimit ? 'text-red-500' : 'text-[var(--text-muted)] opacity-50'}`}>
                                                        {wordCount}/20 words
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Level Select */}
                            <div>
                                <label className="block text-xs font-black text-[var(--text-muted)] mb-2 uppercase tracking-[0.2em]">CEFR Level</label>
                                <select
                                    className="w-full p-4 bg-[var(--input-bg)] border border-[var(--border-light)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:outline-none text-[var(--text-main)] font-bold appearance-none cursor-pointer"
                                    value={levelInput}
                                    onChange={e => setLevelInput(e.target.value)}
                                >
                                    <option value="A1">A1 - Beginner</option>
                                    <option value="A2">A2 - Elementary</option>
                                    <option value="B1">B1 - Intermediate</option>
                                    <option value="B2">B2 - Upper Intermediate</option>
                                    <option value="C1">C1 - Advanced</option>
                                    <option value="C2">C2 - Proficient</option>
                                </select>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    className="flex-1 py-4 text-[var(--text-muted)] font-bold hover:bg-[var(--bg-hover)] rounded-xl transition-all uppercase tracking-wider text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-xs"
                                >
                                    <Check size={18} /> {id ? 'Update Word' : 'Save Word'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right Column - AI Insight Panel */}
                    <div className="lg:w-80 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-light)] p-6 shadow-sm h-fit sticky top-24">
                        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[var(--border-light)]">
                            <Brain size={18} className="text-[var(--primary)]" />
                            <h3 className="font-bold text-[var(--text-main)] text-sm uppercase tracking-wider">AI Analysis</h3>
                        </div>

                        {!englishWord.trim() ? (
                            <div className="text-center py-10 opacity-40">
                                <p className="text-xs font-medium text-[var(--text-muted)]">
                                    Enter a word to view insights
                                </p>
                            </div>
                        ) : isLoadingInsight ? (
                            <div className="flex flex-col items-center justify-center py-10">
                                <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mb-3"></div>
                                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Analyzing...</p>
                            </div>
                        ) : aiInsight ? (
                            <div className="space-y-6">
                                {/* Pronunciation */}
                                {aiInsight.pronunciation && (
                                    <div>
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Pronunciation</span>
                                            <button
                                                onClick={() => speak(englishWord)}
                                                className="text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors"
                                                title="Listen"
                                            >
                                                <Volume2 size={14} />
                                            </button>
                                        </div>
                                        <p className="text-lg font-mono text-[var(--text-main)]">{aiInsight.pronunciation}</p>
                                    </div>
                                )}

                                {/* Etymology */}
                                {aiInsight.etymology && (
                                    <div>
                                        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest block mb-1">Origin</span>
                                        <p className="text-xs text-[var(--text-main)] leading-relaxed text-justify">{aiInsight.etymology}</p>
                                    </div>
                                )}

                                {/* Fun Fact */}
                                {aiInsight.funFact && (
                                    <div>
                                        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest block mb-1">Did You Know?</span>
                                        <p className="text-xs text-[var(--text-main)] leading-relaxed italic opacity-80">{aiInsight.funFact}</p>
                                    </div>
                                )}

                                {/* Usage Tip */}
                                {aiInsight.usageTip && (
                                    <div className="p-3 bg-[var(--input-bg)] rounded-xl border border-[var(--border-light)]">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Check size={12} className="text-green-500" />
                                            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Usage Tip</span>
                                        </div>
                                        <p className="text-xs text-[var(--text-main)] leading-relaxed">{aiInsight.usageTip}</p>
                                    </div>
                                )}

                                {/* Related Words */}
                                {aiInsight.relatedWords && aiInsight.relatedWords.length > 0 && (
                                    <div>
                                        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest block mb-2">Related</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {aiInsight.relatedWords.map((word, i) => (
                                                <span key={i} className="px-2 py-1 bg-[var(--input-bg)] text-[var(--text-muted)] text-[10px] font-bold rounded-md border border-[var(--border-light)] uppercase tracking-wide">
                                                    {word}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-10 opacity-40">
                                <p className="text-xs font-medium text-[var(--text-muted)]">
                                    No insights available
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

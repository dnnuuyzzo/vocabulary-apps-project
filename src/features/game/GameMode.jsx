import { useNavigate } from 'react-router-dom';
import { Play, Shuffle, MessageSquare, Zap, BookOpen, Crown, Skull } from 'lucide-react';

/**
 * GameMode.jsx
 * 
 * The Arcade Menu.
 * Displays the list of available mini-games.
 * 
 * Adding a new game?
 * 1. Create the game component in src/features/game/
 * 2. Add a route in App.jsx
 * 3. Add an entry to the `games` array below.
 */
export default function GameMode() {
    const navigate = useNavigate();

    const games = [
        {
            id: 'match',
            title: 'Word Match',
            description: 'Pair English words with their meanings',
            icon: Play,
            color: 'bg-blue-500',
            path: '/game/match'
        },
        {
            id: 'scramble',
            title: 'Word Scramble',
            description: 'Unscramble letters to find the word',
            icon: Shuffle,
            color: 'bg-purple-500',
            path: '/game/scramble'
        },
        {
            id: 'sentence',
            title: 'Sentence Builder',
            description: 'Complete the sentence with the right word',
            icon: MessageSquare,
            color: 'bg-green-500',
            path: '/game/sentence'
        },
        {
            id: 'typing',
            title: 'Flash-Type Race',
            description: 'Type the word before time runs out',
            icon: Zap,
            color: 'bg-orange-500',
            path: '/game/typing'
        },
        {
            id: 'definition',
            title: 'Definition Master',
            description: 'Choose the word that matches the definition',
            icon: BookOpen,
            color: 'bg-pink-500',
            path: '/game/definition'
        },
        {
            id: 'hangman',
            title: 'Hangman',
            description: 'Guess the word letter by letter',
            icon: Skull,
            color: 'bg-red-500',
            path: '/game/hangman'
        }
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-24">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Game Center</h2>
                    <p className="text-[var(--text-muted)] font-medium">Choose a game to challenge your vocabulary skills.</p>
                </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {games.map((game) => (
                    <div
                        key={game.id}
                        onClick={() => navigate(game.path)}
                        className="group relative overflow-hidden bg-[var(--bg-card)] border border-[var(--border-light)] rounded-[32px] p-6 cursor-pointer hover:border-[var(--primary)]/50 transition-all hover:shadow-lg hover:-translate-y-1 active:scale-[0.98]"
                    >
                        <div className={`absolute top-0 right-0 p-32 ${game.color} opacity-5 group-hover:opacity-10 rounded-full blur-3xl transition-opacity -mr-16 -mt-16`}></div>

                        <div className="relative flex items-center gap-6">
                            <div className={`w-16 h-16 ${game.color}/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                                <game.icon size={32} className={`${game.color.replace('bg-', 'text-')}`} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-[var(--text-main)] mb-1 group-hover:text-[var(--primary)] transition-colors">{game.title}</h3>
                                <p className="text-sm font-bold text-[var(--text-muted)] leading-tight">{game.description}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center pt-8">
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] opacity-50">More games coming soon</p>
            </div>
        </div>
    );
}

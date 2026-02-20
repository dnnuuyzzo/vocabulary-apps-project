import { useState } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import { AppProvider } from './context/AppContext';
import Dashboard from './features/dashboard/Dashboard';
import VocabList from './features/vocabulary/VocabList';
import LearnMode from './features/learn/LearnMode';
import QuizMode from './features/quiz/QuizMode';
import GameMode from './features/game/GameMode';
import Settings from './features/settings/Settings';
import WordReview from './features/vocabulary/WordReview';
import ListenMode from './features/vocabulary/ListenMode';
import WordMatchGame from './features/game/WordMatchGame';
import WordScrambleGame from './features/game/WordScrambleGame';
import SentenceBuilderGame from './features/game/SentenceBuilderGame';
import SpeedTypingGame from './features/game/SpeedTypingGame';
import DefinitionQuizGame from './features/game/DefinitionQuizGame';
import HangmanGame from './features/game/HangmanGame';
import ChatMentorGame from './features/game/ChatMentorGame';
import Achievements from './features/achievements/Achievements';
import AddWordPage from './features/vocabulary/AddWordPage';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';

/**
 * App.jsx
 * 
 * THE SKELETON.
 * Defines the URL structure (Routes) and wraps every page with:
 * 1. ErrorBoundary (Catches crashes)
 * 2. AppProvider (Provides data)
 * 3. Layout (The sidebar and background)
 */
function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardWrapper />} />
              <Route path="/vocab" element={<VocabList />} />
              <Route path="/learn" element={<LearnModeWrapper />} />
              <Route path="/quiz" element={<QuizMode />} />
              <Route path="/game" element={<GameMode />} />
              <Route path="/game/match" element={<WordMatchGame />} />
              <Route path="/game/scramble" element={<WordScrambleGame />} />
              <Route path="/game/sentence" element={<SentenceBuilderGame />} />
              <Route path="/game/typing" element={<SpeedTypingGame />} />
              <Route path="/game/definition" element={<DefinitionQuizGame />} />
              <Route path="/game/hangman" element={<HangmanGame />} />
              <Route path="/ai-mentor" element={<ChatMentorGame />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/add-word" element={<AddWordPage />} />
              <Route path="/edit-word/:id" element={<AddWordPage />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/listen" element={<ListenModeWrapper />} />
              <Route path="/review/:wordId" element={<WordReviewWrapper />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Layout>
        </AppProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

const DashboardWrapper = () => {
  const navigate = useNavigate();
  return <Dashboard onNavigate={(tab, param) => {
    if (tab === 'review') navigate(`/review/${param}`);
    else navigate(`/${tab}`);
  }} />;
};

const LearnModeWrapper = () => {
  const navigate = useNavigate();
  return <LearnMode onBack={() => navigate('/dashboard')} />;
};

const ListenModeWrapper = () => {
  const navigate = useNavigate();
  return <ListenMode onBack={() => navigate('/dashboard')} />;
};

const WordReviewWrapper = () => {
  const { wordId } = useParams();
  const navigate = useNavigate();
  return <WordReview wordId={wordId} onBack={() => navigate(-1)} />;
};

export default App;

import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { DiagnosticPage } from './pages/DiagnosticPage';
import { ChatPage } from './pages/ChatPage';
import { KnowledgeBasePage } from './pages/KnowledgeBasePage';
import { useAuth } from './lib/auth';
import { GlobalStore } from './lib/store';
import { LogIn } from 'lucide-react';

export type Page = 'diagnostic' | 'chat' | 'knowledgeBase';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('diagnostic');
  const { user, signIn } = useAuth();

  useEffect(() => {
    if (user?.uid) {
      GlobalStore.loadFromDb(user.uid);
    }
  }, [user?.uid]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 relative">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <LogIn className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">SEO Навигатор</h1>
          <p className="text-sm text-slate-500 mb-8">Войдите, чтобы продолжить использование базы знаний и проектов.</p>
          <button
            onClick={signIn}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-lg px-4 py-3 font-semibold hover:bg-indigo-700 transition"
          >
            Войти через Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden font-sans text-slate-800 bg-slate-50">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1 flex flex-col bg-white overflow-hidden shadow-2xl z-10 w-full relative">
        {currentPage === 'diagnostic' && <DiagnosticPage />}
        {currentPage === 'chat' && <ChatPage />}
        {currentPage === 'knowledgeBase' && <KnowledgeBasePage />}
      </main>
    </div>
  );
}

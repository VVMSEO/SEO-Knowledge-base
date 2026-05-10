import { useState, useEffect } from 'react';
import { Bot, Send, User } from 'lucide-react';
import { askAdvisor } from '../lib/gemini';
import { MarkdownRender } from '../components/MarkdownRender';
import { cn } from '../lib/utils';
import { GlobalStore } from '../lib/store';

export function ChatPage() {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([
    { role: 'ai', content: 'Привет! Я твой SEO-Навигатор. Опиши ситуацию по проекту, проблему или задай вопрос по методикам, и я помогу составить план действий на базе твоих эталонных SOP.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [syncedFileCount, setSyncedFileCount] = useState(0);

  useEffect(() => {
    setSyncedFileCount(GlobalStore.driveFiles.length);
    return GlobalStore.subscribe(() => {
      setSyncedFileCount(GlobalStore.driveFiles.length);
    });
  }, []);

  async function handleSend() {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await askAdvisor(userMessage);
      setMessages(prev => [...prev, { role: 'ai', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: `Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}` }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-white relative">
      <header className="h-16 border-b border-slate-100 flex items-center justify-between px-8 shrink-0">
        <div className="flex flex-col">
          <h2 className="text-sm font-bold text-slate-900">Модуль SEO-Навигатора</h2>
          <p className="text-xs text-slate-500">Сессия: Свободный чат</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-xs font-semibold px-3 py-1.5 border border-slate-200 rounded hover:bg-slate-50 text-slate-700 transition-colors" title="Скачать историю действий">Экспорт плана</button>
          <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-slate-400 font-bold text-xs" title="Вы">Я</div>
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className="flex gap-4 items-start">
            {msg.role === 'user' ? (
              <div className="w-8 h-8 rounded bg-slate-100 flex-shrink-0 flex items-center justify-center text-slate-400 font-bold text-sm text-center">U</div>
            ) : (
              <div className="w-8 h-8 rounded bg-indigo-600 flex-shrink-0 flex items-center justify-center text-white">
                <Bot size={20} />
              </div>
            )}
            
            {msg.role === 'user' ? (
               <div className="bg-slate-50 p-4 rounded-xl rounded-tl-none border border-slate-100 max-w-[80%]">
                 <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
               </div>
            ) : (
               <div className="p-6 border border-indigo-100 bg-indigo-50/30 rounded-xl rounded-tl-none max-w-[80%]">
                 <h3 className="text-sm font-bold text-indigo-900 mb-3 uppercase tracking-wide flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Рекомендация Навигатора
                 </h3>
                 <div className="text-sm text-slate-800 leading-relaxed prose-sm max-w-none prose-indigo">
                   <MarkdownRender content={msg.content} />
                 </div>
               </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded bg-indigo-600 flex-shrink-0 flex items-center justify-center text-white">
              <Bot size={20} />
            </div>
            <div className="p-6 border border-indigo-100 bg-indigo-50/30 rounded-xl rounded-tl-none flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
              <span className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-slate-100 bg-white shrink-0">
        <form 
          className="relative max-w-4xl mx-auto"
          onSubmit={e => { e.preventDefault(); handleSend(); }}
        >
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Спросите о стратегии проекта, чек-листах или деталях из сохраненных материалов..."
            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-inner resize-none min-h-[56px] max-h-48"
            rows={1}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-4 top-3 bg-indigo-600 text-white p-2 rounded-xl shadow-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            title="Отправить сообщение"
          >
            <Send size={20} />
          </button>
        </form>
        <p className="text-center text-[10px] text-slate-400 mt-4 uppercase font-medium">Источники для ответа: файлов из Drive ({syncedFileCount}) • 10 SOP • Архитектурные подсказки</p>
      </div>
    </div>
  );
}

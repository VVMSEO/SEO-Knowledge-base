import { Compass, BookOpen, MessageSquareText, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import type { Page } from '../App';
import { Tooltip } from './Tooltip';
import { GlobalStore } from '../lib/store';
import { useAuth } from '../lib/auth';
import { LogOut } from 'lucide-react';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const [driveFileCount, setDriveFileCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { signOut } = useAuth();

  useEffect(() => {
    setDriveFileCount(GlobalStore.driveFiles.length);
    setIsLoading(GlobalStore.isLoading);
    return GlobalStore.subscribe(() => {
      setDriveFileCount(GlobalStore.driveFiles.length);
      setIsLoading(GlobalStore.isLoading);
    });
  }, []);

  const navItems = [
    { id: 'diagnostic', label: 'Диагностика проекта', icon: Compass },
    { id: 'chat', label: 'Свободный чат', icon: MessageSquareText },
    { id: 'knowledgeBase', label: 'База знаний', icon: BookOpen },
  ] as const;

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col z-20">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <Tooltip content="Аббревиатура Навигатора">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">Н</div>
          </Tooltip>
          <h1 className="text-lg font-bold tracking-tight text-slate-900" title="Название инструмента">SEO Навигатор</h1>
        </div>
        
        <nav className="space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">Меню</div>
          {navItems.map((item) => (
            <Tooltip key={item.id} content={item.label === 'Диагностика проекта' ? 'Анкета для старта' : item.label === 'Свободный чат' ? 'Диалог с помощником' : 'Справочные материалы'} position="right" wrapperClassName="w-full">
              <button
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors text-sm",
                  currentPage === item.id 
                    ? "bg-indigo-50 text-indigo-700" 
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            </Tooltip>
          ))}
        </nav>

        <nav className="mt-8 space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3" title="Интеграции и база знаний">Источники данных</div>
          <Tooltip content="Облачное хранилище подключено" position="right" wrapperClassName="w-full">
            <div className="flex items-center justify-between px-3 py-2 text-sm text-slate-600">
              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Google Drive</span>
              {isLoading ? (
                <span className="text-xs text-slate-500 py-0.5"><Loader2 className="w-3 h-3 animate-spin inline mr-1"/>Загрузка...</span>
              ) : (
                <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500">
                  {driveFileCount > 0 ? `Файлов: ${driveFileCount}` : 'Не подкл.'}
                </span>
              )}
            </div>
          </Tooltip>
          <Tooltip content="Документация и инструкции" position="right" wrapperClassName="w-full">
            <div className="flex items-center justify-between px-3 py-2 text-sm text-slate-600">
              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> База SOP</span>
              <span className="text-xs text-slate-400">10 док.</span>
            </div>
          </Tooltip>
          <Tooltip content="Набор инструментов проверок" position="right" wrapperClassName="w-full">
            <div className="flex items-center justify-between px-3 py-2 text-sm text-slate-600">
              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Чек-листы</span>
              <span className="text-xs text-slate-400">4 шт.</span>
            </div>
          </Tooltip>
        </nav>
      </div>
      
      <div className="mt-auto p-4 border-t border-slate-100 flex flex-col gap-4">
        <Tooltip content="Выйти из аккаунта Firebase" position="top" wrapperClassName="w-full">
          <button
            onClick={() => {
              signOut();
            }}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 border border-rose-200 rounded hover:bg-rose-50 w-full transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Выйти из аккаунта
          </button>
        </Tooltip>

        <Tooltip content="Прогресс обработки текущей задачи" position="top" wrapperClassName="w-full">
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500 mb-2 font-medium italic">"Режим консультанта активен"</p>
            <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full w-3/4"></div>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 uppercase">Обработка заметок</p>
          </div>
        </Tooltip>
      </div>
    </aside>
  );
}

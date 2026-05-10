import { KNOWLEDGE_BASE } from '../data/materials';
import { Search, Database, CloudDownload, FileText, Loader2, AlertCircle, CheckCircle2, Upload } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';
import { listFilesInFolder, getFileContent, DriveFile } from '../lib/drive';
import { GlobalStore } from '../lib/store';
import { useAuth } from '../lib/auth';

export function KnowledgeBasePage() {
  const { signOut, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArea, setFilterArea] = useState('All');
  
  // Google Drive state
  const [driveFolderId, setDriveFolderId] = useState('1QE_y_WllIcX0OT0vv93CC1zJggx3aHKP');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState('');
  const [isFetchingList, setIsFetchingList] = useState(false);
  const [availableDriveFiles, setAvailableDriveFiles] = useState<DriveFile[]>([]);
  const [selectedDriveFileIds, setSelectedDriveFileIds] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Subscribe to GlobalStore
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>(GlobalStore.driveFiles);
  const [driveContents, setDriveContents] = useState<Record<string, string>>(GlobalStore.driveContents);

  useEffect(() => {
    GlobalStore.loadFromDb(user?.uid);
    return GlobalStore.subscribe(() => {
      setDriveFiles(GlobalStore.driveFiles);
      setDriveContents(GlobalStore.driveContents);
    });
  }, [user?.uid]);

  const areas = ['All', ...Array.from(new Set(KNOWLEDGE_BASE.map(m => m.area)))];

  const filtered = KNOWLEDGE_BASE.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArea = filterArea === 'All' || item.area === filterArea;
    return matchesSearch && matchesArea;
  });

  const handleFetchDriveList = async () => {
    if (!driveFolderId) return;
    setIsFetchingList(true);
    setSyncError('');
    try {
      let folderId = driveFolderId;
      if (folderId.includes('folders/')) {
        folderId = folderId.split('folders/')[1].split('?')[0];
      }
      
      const files = await listFilesInFolder(folderId);
      setAvailableDriveFiles(files);
      setSelectedDriveFileIds(new Set(files.map(f => f.id)));
    } catch (err) {
      console.error(err);
      setSyncError(err instanceof Error ? err.message : 'Unknown error during fetch');
    } finally {
      setIsFetchingList(false);
    }
  };

  const handleSyncSelectedDriveFiles = async () => {
    const filesToSync = availableDriveFiles.filter(f => selectedDriveFileIds.has(f.id));
    if (filesToSync.length === 0) return;

    setIsSyncing(true);
    setSyncError('');
    try {
      const syncFiles = async () => {
        let currentFiles = [...GlobalStore.driveFiles];
        for (const file of filesToSync) {
          try {
            if (!currentFiles.find(f => f.id === file.id)) {
              currentFiles = [...currentFiles, file];
              GlobalStore.setDriveFiles(currentFiles);
            }
            
            const content = await getFileContent(file.id, file.mimeType);
            await GlobalStore.saveContent(file, content, driveFolderId);
            await new Promise(r => setTimeout(r, 2000));
          } catch (err) {
            console.error(`Failed to read content for ${file.name}`, err);
            currentFiles = currentFiles.filter(f => f.id !== file.id);
            GlobalStore.setDriveFiles(currentFiles);
          }
        }
      };
      
      await syncFiles();
      setAvailableDriveFiles([]);
    } catch (err) {
      console.error(err);
      setSyncError(err instanceof Error ? err.message : 'Unknown error during sync');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLocalUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsSyncing(true);
    setSyncError('');

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const content = await file.text();
          const driveFile: DriveFile = {
            id: `local_${Date.now()}_${i}_${Math.random().toString(36).substring(7)}`,
            name: file.name,
            mimeType: file.type || 'text/plain',
            webViewLink: ''
          };
          
          GlobalStore.setDriveFiles([...GlobalStore.driveFiles, driveFile]);
          try {
            await GlobalStore.saveContent(driveFile, content, 'local_uploads');
            // small delay
            await new Promise(r => setTimeout(r, 1000));
          } catch (err) {
             console.error(`Failed to save content for ${file.name}`, err);
             GlobalStore.setDriveFiles(GlobalStore.driveFiles.filter(f => f.id !== driveFile.id));
          }
        } catch (err) {
           console.error(`Failed to read local file ${file.name}:`, err);
        }
      }
    } catch (err) {
       console.error(err);
       setSyncError('Ошибка загрузки локальных файлов');
    } finally {
      setIsSyncing(false);
      // reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      <header className="h-16 border-b border-slate-100 flex items-center justify-between px-8 shrink-0">
        <div className="flex flex-col">
          <h2 className="text-sm font-bold text-slate-900">Модуль SEO-Навигатора</h2>
          <p className="text-xs text-slate-500">Сессия: Просмотр базы знаний</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Библиотека SOP и источники данных</h1>
            <p className="text-sm text-slate-500">Справочная документация, стандартные операционные процедуры и загруженные данные</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-5">
              <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-2 mb-3">
                <CloudDownload className="w-4 h-4 text-indigo-600" />
                Google Drive
              </h3>
              <div className="flex flex-col gap-3">
                <input 
                  type="text" 
                  placeholder="URL или ID папки Google Drive" 
                  value={driveFolderId}
                  onChange={e => setDriveFolderId(e.target.value)}
                  className="w-full px-4 py-2 text-sm border border-indigo-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white shadow-sm"
                />
                {availableDriveFiles.length === 0 ? (
                  <button 
                    onClick={handleFetchDriveList}
                    disabled={isFetchingList}
                    className="w-full justify-center px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
                  >
                    {isFetchingList ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Найти файлы в папке'}
                  </button>
                ) : (
                  <div className="mt-2 flex flex-col gap-2">
                    <div className="max-h-48 overflow-y-scroll border border-indigo-200 rounded-lg bg-white p-2 text-left">
                      <label className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100 cursor-pointer">
                         <input type="checkbox" 
                            checked={selectedDriveFileIds.size === availableDriveFiles.length}
                            onChange={(e) => {
                               if (e.target.checked) {
                                  setSelectedDriveFileIds(new Set(availableDriveFiles.map(f => f.id)));
                               } else {
                                  setSelectedDriveFileIds(new Set());
                               }
                            }}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                         />
                         <span className="text-xs font-semibold text-slate-700">Выбрать все</span>
                      </label>
                      {availableDriveFiles.map(file => (
                         <label key={file.id} className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-slate-50 px-1 rounded">
                            <input type="checkbox"
                               checked={selectedDriveFileIds.has(file.id)}
                               onChange={(e) => {
                                  const newSet = new Set(selectedDriveFileIds);
                                  if (e.target.checked) newSet.add(file.id);
                                  else newSet.delete(file.id);
                                  setSelectedDriveFileIds(newSet);
                               }}
                               className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                            />
                            <span className="text-xs text-slate-700 truncate">{file.name}</span>
                         </label>
                      ))}
                    </div>
                    <div className="flex gap-2">
                       <button
                         onClick={() => setAvailableDriveFiles([])}
                         disabled={isSyncing}
                         className="flex-1 justify-center px-4 py-2 bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-300 disabled:opacity-50 flex items-center gap-2 transition-colors"
                       >Отмена</button>
                       <button 
                         onClick={handleSyncSelectedDriveFiles}
                         disabled={isSyncing || selectedDriveFileIds.size === 0}
                         className="flex-1 justify-center px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
                       >
                         {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : `Загрузить (${selectedDriveFileIds.size})`}
                       </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-5">
              <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-2 mb-3">
                <Upload className="w-4 h-4 text-indigo-600" />
                Локальные текстовые файлы
              </h3>
              <div className="flex flex-col gap-3 h-full justify-start">
                <p className="text-xs text-indigo-700/80 mb-1">
                  Поддерживаются форматы: .txt, .csv, .json, .md
                </p>
                <div className="relative overflow-hidden inline-block w-full">
                  <button 
                    disabled={isSyncing}
                    className="w-full justify-center px-4 py-2 bg-indigo-100 text-indigo-700 border border-indigo-200 text-sm font-semibold rounded-lg hover:bg-indigo-200 disabled:opacity-50 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Выбрать файлы...'}
                  </button>
                  <input 
                    type="file"
                    multiple
                    accept=".txt,.csv,.json,.md"
                    ref={fileInputRef}
                    onChange={handleLocalUpload}
                    disabled={isSyncing}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {syncError && (
            <div className="mb-8 text-xs text-rose-600 font-medium flex items-center gap-2 bg-rose-50 p-3 border border-rose-100 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="flex-1">{syncError}</span>
            </div>
          )}
          
          {driveFiles.length > 0 && (
            <div className="mb-8 bg-white border border-slate-200 rounded-xl p-5">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Загруженные материалы ({driveFiles.length})</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2">
                {driveFiles.map(file => (
                  <a key={file.id} href={file.webViewLink || '#'} target={file.webViewLink ? "_blank" : undefined} rel="noreferrer" className="flex items-center gap-2 p-2 text-sm bg-slate-50 border border-slate-200 rounded hover:border-indigo-300 hover:shadow-sm transition-all group">
                     <FileText className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 shrink-0" />
                     <span className="truncate flex-1 text-slate-700">{file.name}</span>
                     {driveContents[file.id] ? (
                        <span title="Содержимое загружено и доступно для ИИ"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /></span>
                     ) : (
                        <span title="Загрузка содержимого..."><Loader2 className="w-3 h-3 text-indigo-400 animate-spin shrink-0" /></span>
                     )}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Поиск по заметкам, руководствам или курсам..." 
                value={searchTerm}
                title="Введите текст для поиска по документам"
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm shadow-inner transition-all hover:bg-slate-50 focus:bg-white"
              />
            </div>
            <select 
              value={filterArea}
              onChange={e => setFilterArea(e.target.value)}
              title="Фильтрация по направлению"
              className="border border-slate-200 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm shadow-inner transition-all hover:bg-slate-50 focus:bg-white cursor-pointer"
            >
              {areas.map(a => (
                <option key={a} value={a}>{a === 'All' ? 'Все направления' : a}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 mt-6">
            {filtered.map(item => (
              <div key={item.id} className="bg-white border text-left border-slate-200 rounded-xl p-5 hover:border-indigo-200 hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">{item.title}</h3>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wide",
                    item.status === 'Эталон' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-500'
                  )}>
                    {item.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">{item.summary}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-100">
                   <div className="min-w-0">
                      <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Источник</span>
                      <span className="block text-xs text-slate-700 font-medium break-words" title="Откуда взяты данные">{item.source}</span>
                   </div>
                   <div className="min-w-0">
                      <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Область</span>
                      <span className="block text-xs text-slate-700 font-medium break-words" title="Категория документа">{item.area}</span>
                   </div>
                   <div className="min-w-0">
                      <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Когда использовать</span>
                      <span className="block text-xs text-slate-700 font-medium break-words" title={`Подсказка: ${item.useWhen}`}>{item.useWhen}</span>
                   </div>
                   <div className="min-w-0">
                      <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Приоритет</span>
                      <span className={cn(
                        "block text-xs font-bold break-words",
                        item.priority === 'Критично' ? 'text-rose-600' : 'text-slate-700'
                      )} title="Важность документа">{item.priority}</span>
                   </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-12">
                <p className="text-sm font-bold text-slate-400 mb-1">Документы не найдены</p>
                <p className="text-xs text-slate-400">Попробуйте изменить параметры поиска или фильтры.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


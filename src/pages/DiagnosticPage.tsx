import { useState } from 'react';
import { CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import { askAdvisor } from '../lib/gemini';
import { MarkdownRender } from '../components/MarkdownRender';

interface DiagnosticState {
  site: string;
  type: string;
  region: string;
  goal: string;
  problem: string;
  trafficDynamics: string;
  pageTypes: string;
  availableData: string;
  doneBefore: string;
  devConstraints: string;
  contentConstraints: string;
  budget: string;
  deadline: string;
  competitors: string;
  expectedOutput: string;
}

const INITIAL_STATE: DiagnosticState = {
  site: '', type: 'Интернет-магазин', region: '', goal: '', problem: '',
  trafficDynamics: '', pageTypes: '', availableData: 'Яндекс.Метрика, Google Search Console', 
  doneBefore: '', devConstraints: '', contentConstraints: '',
  budget: '', deadline: '', competitors: '', expectedOutput: 'План работ по SEO'
};

export function DiagnosticPage() {
  const [form, setForm] = useState<DiagnosticState>(INITIAL_STATE);
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const prompt = `
Вот данные по проекту. Проведи диагностику и составь рекомендации согласно твоим инструкциям:

1. Сайт: ${form.site}
2. Тип проекта: ${form.type}
3. Регион: ${form.region}
4. Основная цель: ${form.goal}
5. Что случилось / какая проблема: ${form.problem}
6. Текущая динамика трафика: ${form.trafficDynamics}
7. Какие типы страниц есть: ${form.pageTypes}
8. Доступные данные: ${form.availableData}
9. Что уже делали: ${form.doneBefore}
10. Ограничения по разработке: ${form.devConstraints}
11. Ограничения по контенту: ${form.contentConstraints}
12. Ресурсы: ${form.budget}
13. Срок: ${form.deadline}
14. Главные конкуренты: ${form.competitors}
15. Ожидаемый результат: ${form.expectedOutput}
    `.trim();

    try {
      const response = await askAdvisor(prompt);
      setResult(response);
    } catch (error) {
      setResult(`Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (result) {
    return (
      <div className="flex flex-col h-full bg-white relative">
        <header className="h-16 border-b border-slate-100 flex items-center justify-between px-8 shrink-0">
          <div className="flex flex-col">
            <h2 className="text-sm font-bold text-slate-900">Модуль SEO-Навигатора</h2>
            <p className="text-xs text-slate-500">Сессия: Отчет диагностики</p>
          </div>
          <div className="flex items-center gap-4">
             <button 
               onClick={() => setResult(null)}
               className="text-xs font-semibold px-3 py-1.5 border border-slate-200 rounded hover:bg-slate-50 text-slate-700 transition-colors"
             >
               Новая диагностика
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          <div className="max-w-4xl mx-auto">
            <div className="p-8 border border-indigo-100 bg-white rounded-2xl shadow-sm">
               <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-slate-900 tracking-tight">Диагностика завершена</h1>
                    <p className="text-sm text-slate-500">На основе руководств SOP и предоставленных данных</p>
                  </div>
               </div>
               <div className="prose-indigo">
                 <MarkdownRender content={result} />
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white relative">
      <header className="h-16 border-b border-slate-100 flex items-center justify-between px-8 shrink-0">
        <div className="flex flex-col">
          <h2 className="text-sm font-bold text-slate-900">Модуль SEO-Навигатора</h2>
          <p className="text-xs text-slate-500">Сессия: Настройка и диагностика</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold tracking-tighter">SEO</div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Анкета диагностики</h1>
            </div>
            <p className="text-sm text-slate-500">Укажите детали проекта для создания индивидуального SEO-плана на основе справочных материалов.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="1. Проект / Сайт URL" value={form.site} onChange={(v: string) => setForm({...form, site: v})} placeholder="example.com" />
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">2. Тип проекта</label>
                  <select 
                    value={form.type} 
                    onChange={e => setForm({...form, type: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-slate-50/50 transition-all hover:bg-slate-50 focus:bg-white"
                  >
                    {['Интернет-магазин', 'Сайт услуг', 'Инфосайт', 'Агрегатор', 'SaaS', 'Локальный бизнес'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <Field label="3. Регион" value={form.region} onChange={(v: string) => setForm({...form, region: v})} placeholder="Москва, РФ" />
              <Field label="4. Основная цель" value={form.goal} onChange={(v: string) => setForm({...form, goal: v})} placeholder="Удвоить органический трафик за 6 месяцев" multiline />
              <Field label="5. Главная проблема / Задача" value={form.problem} onChange={(v: string) => setForm({...form, problem: v})} placeholder="Трафик упал после редизайна сайта..." multiline required />
              <Field label="6. Динамика трафика" value={form.trafficDynamics} onChange={(v: string) => setForm({...form, trafficDynamics: v})} placeholder="Стагнирует уже 3 месяца" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100 mt-6">
                <Field label="7. Типы страниц" value={form.pageTypes} onChange={(v: string) => setForm({...form, pageTypes: v})} placeholder="Категории, карточки товаров, фильтры" />
                <Field label="8. Доступные данные" value={form.availableData} onChange={(v: string) => setForm({...form, availableData: v})} placeholder="Яндекс Метрика, GSC" />
              </div>

              <Field label="9. Что уже делали" value={form.doneBefore} onChange={(v: string) => setForm({...form, doneBefore: v})} placeholder="Переписали title, купили ссылки..." multiline />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="10. Ограничения разработчиков" value={form.devConstraints} onChange={(v: string) => setForm({...form, devConstraints: v})} placeholder="10 часов разработки в месяц" />
                <Field label="11. Ограничения по контенту" value={form.contentConstraints} onChange={(v: string) => setForm({...form, contentConstraints: v})} placeholder="Контент заблокирован юристами" />
              </div>

              <Field label="14. Главные конкуренты" value={form.competitors} onChange={(v: string) => setForm({...form, competitors: v})} placeholder="competitor1.ru, competitor2.ru" />
            </div>

            <div className="bg-slate-50 p-6 border-t border-slate-100 flex justify-end gap-6 items-center">
              {isLoading && <p className="text-xs text-indigo-600 font-bold uppercase tracking-wide animate-pulse flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/> Анализ данных...</p>}
              <button 
                type="submit" 
                disabled={isLoading || !form.problem}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-sm text-sm tracking-wide"
              >
                Сформировать план
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, multiline = false, required = false }: any) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      {multiline ? (
        <textarea 
          value={value} 
          onChange={e => onChange(e.target.value)} 
          placeholder={placeholder}
          required={required}
          className="w-full border border-slate-200 rounded-lg p-3 min-h-[96px] focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-slate-50/50 transition-all hover:bg-slate-50 focus:bg-white resize-y"
        />
      ) : (
        <input 
          type="text" 
          value={value} 
          onChange={e => onChange(e.target.value)} 
          placeholder={placeholder}
          required={required}
          className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-slate-50/50 transition-all hover:bg-slate-50 focus:bg-white"
        />
      )}
    </div>
  );
}

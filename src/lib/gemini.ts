import { SYSTEM_PROMPT, KNOWLEDGE_BASE } from '../data/materials';
import { GlobalStore } from './store';

const ROUTERAI_API_KEY = (import.meta as any).env?.VITE_ROUTERAI_API_KEY || 'sk-qbf6ACgy2tmghGMBdty2uA3lWSHY98w7';

export async function askAdvisor(userPrompt: string): Promise<string> {
  // Inject Knowledge Base into the system prompt
  const kbContext = KNOWLEDGE_BASE.map(
    (m) => `- ID: ${m.id} | ${m.title} | ${m.status}\n  Когда использовать: ${m.useWhen}\n  Резюме: ${m.summary}`
  ).join('\n\n');

  const driveContext = GlobalStore.getFormattedContext();
  
  let fullSystemPrompt = SYSTEM_PROMPT.replace('{KB_CONTEXT}', kbContext);
  
  if (driveContext) {
    fullSystemPrompt += `\n\n=== ВНЕШНИЕ МАТЕРИАЛЫ ИЗ GOOGLE DRIVE ===\nПОЛЬЗОВАТЕЛЬ СИНХРОНИЗИРОВАЛ СЛЕДУЮЩИЕ ДОКУМЕНТЫ. АКТИВНО ИСПОЛЬЗУЙ ИХ ПРИ ОТВЕТЕ:\n\n${driveContext}`;
  }

  try {
    const response = await fetch("https://routerai.ru/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": ROUTERAI_API_KEY.includes('Bearer') ? ROUTERAI_API_KEY : (ROUTERAI_API_KEY.startsWith('sk-') ? `Bearer ${ROUTERAI_API_KEY}` : `Bearer ${ROUTERAI_API_KEY}`),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "anthropic/claude-sonnet-4.6",
        messages: [
          { role: "system", content: fullSystemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.2
      })
    });

    if (!response.ok) {
       const errText = await response.text();
       throw new Error(`API error: ${response.status} ${response.statusText} - ${errText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content || 'Не удалось получить ответ.';
  } catch (error: any) {
    console.error('Error calling Router AI:', error);
    throw new Error(`Ошибка при обращении к AI-советнику: ${error.message}`);
  }
}

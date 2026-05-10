const API_KEY = (import.meta as any).env.VITE_GOOGLE_API_KEY;

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
}

export async function listFilesInFolder(folderId: string, visited: Set<string> = new Set()): Promise<DriveFile[]> {
  if (!API_KEY || API_KEY === 'YOUR_GOOGLE_API_KEY') {
    throw new Error('Укажите VITE_GOOGLE_API_KEY в переменных окружения.');
  }

  if (visited.has(folderId)) return [];
  visited.add(folderId);

  const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+trashed=false&fields=files(id,name,mimeType,webViewLink)&key=${API_KEY}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Отказано в доступе (HTTP ${response.status}). Убедитесь, что папка доступна "для всех, у кого есть ссылка", и API ключ действителен.`);
    }
    const data = await response.json();
    const items = data.files || [];
    
    const files: DriveFile[] = [];
    for (const item of items) {
      if (item.mimeType === 'application/vnd.google-apps.folder') {
        try {
          const subFiles = await listFilesInFolder(item.id, visited);
          files.push(...subFiles);
        } catch (err) {
          console.warn(`Failed to read subfolder ${item.name}:`, err);
        }
      } else {
        files.push(item);
      }
    }
    return files;
  } catch (e) {
    if (e instanceof Error && e.message.includes('HTTP')) throw e;
    throw new Error(`Ошибка подключения к Google Drive API: ${e instanceof Error ? e.message : 'Unknown'}`);
  }
}

export async function getFileContent(fileId: string, mimeType: string): Promise<string> {
  if (!API_KEY || API_KEY === 'YOUR_GOOGLE_API_KEY') throw new Error('API Key missing');

  try {
    let url = "";
    if (mimeType === 'application/vnd.google-apps.document') {
      url = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain&key=${API_KEY}`;
    } else if (mimeType === 'application/vnd.google-apps.spreadsheet') {
      url = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/csv&key=${API_KEY}`;
    } else if (mimeType === 'application/vnd.google-apps.presentation') {
      url = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain&key=${API_KEY}`;
    } else if (String(mimeType).startsWith('application/vnd.google-apps')) {
      return `[Содержимое недоступно для извлечения. Тип файла: ${mimeType}]`;
    } else {
      url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${API_KEY}`;
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 403) {
        return "Не удалось извлечь содержимое напрямую (возможно, формат не поддерживается или нет доступа).";
      }
      throw new Error(`HTTP ${response.status}`);
    }
    
    // Check content length if available
    const contentLengthStr = response.headers.get('content-length');
    if (contentLengthStr) {
      const length = parseInt(contentLengthStr, 10);
      if (length > 10 * 1024 * 1024) { // 10MB limit
         return `[Файл слишком велик для извлечения текста (>10MB). Перейдите по ссылке для просмотра.]`;
      }
    }

    // Read stream up to 5MB to prevent OOM
    const MAX_BYTES = 5 * 1024 * 1024;
    let totalBytes = 0;
    const chunks: Uint8Array[] = [];
    
    if (response.body) {
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          totalBytes += value.length;
          if (totalBytes > MAX_BYTES) {
            chunks.push(value.slice(0, MAX_BYTES - (totalBytes - value.length)));
            break;
          }
          chunks.push(value);
        }
      }
    } else {
      const arrayBuffer = await response.arrayBuffer();
      if (arrayBuffer.byteLength > MAX_BYTES) {
         chunks.push(new Uint8Array(arrayBuffer.slice(0, MAX_BYTES)));
      } else {
         chunks.push(new Uint8Array(arrayBuffer));
      }
    }

    // Merge chunks
    const totalLength = chunks.reduce((acc, val) => acc + val.length, 0);
    const merged = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }

    let content = new TextDecoder('utf-8').decode(merged);
    if (totalBytes > MAX_BYTES) {
      content += '\n\n[Внимание: Содержимое обрезано, так как файл слишком велик]';
    }

    return content;
  } catch (e) {
    throw new Error(`Failed to fetch content: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }
}

import { DriveFile } from './drive';
import { getDocuments, saveDocument } from './db';
import { auth } from './firebase';

export const GlobalStore = {
  driveFiles: [] as DriveFile[],
  driveContents: {} as Record<string, string>,
  isLoading: false,
  listeners: new Set<() => void>(),

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  },
  
  notify() {
    this.listeners.forEach(l => l());
  },

  async loadFromDb(userId?: string) {
    const uid = userId || auth.currentUser?.uid;
    if (!uid) return;
    this.isLoading = true;
    this.notify();
    try {
      const docs = await getDocuments(uid);
      this.driveFiles = docs.map(d => ({
        id: d.id,
        name: d.name,
        mimeType: d.mimeType || '',
        webViewLink: d.webViewLink || ''
      }));
      docs.forEach(d => {
        this.driveContents[d.id] = d.content;
      });
      this.isLoading = false;
      this.notify();
    } catch (e) {
      this.isLoading = false;
      this.notify();
      console.error(e);
    }
  },

  setDriveFiles(files: DriveFile[]) {
    this.driveFiles = files;
    this.notify();
  },

  async saveContent(file: DriveFile, content: string, folderId: string) {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    
    this.driveContents[file.id] = content;
    this.notify();
    
    // Save to Firestore, handle failures gracefully (e.g. quota exceeded)
    try {
      await saveDocument({
        id: file.id,
        name: file.name,
        content,
        userId,
        folderId,
        mimeType: file.mimeType,
        webViewLink: file.webViewLink
      });
    } catch (err) {
      console.warn("Failed to persist file content to database (possibly quota exceeded). File available in current session.", err);
    }
  },

  getFormattedContext() {
    let totalChars = 0;
    const MAX_TOTAL_CHARS = 100000; // limit to ~100k chars to save the user's budget and avoid massive token usage
    
    return this.driveFiles.map(file => {
      if (totalChars > MAX_TOTAL_CHARS) return '';
      const content = this.driveContents[file.id];
      if (content) {
         const remaining = MAX_TOTAL_CHARS - totalChars;
         const snippet = content.length > remaining ? content.substring(0, remaining) + '\n...[содержимое обрезано]' : content;
         totalChars += snippet.length;
         return `--- Источник: ${file.name} ---\n${snippet}\n`;
      }
      return '';
    }).filter(Boolean).join('\n');
  }
};


import { collection, doc, setDoc, updateDoc, getDoc, getDocs, deleteDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { db } from './firebase';
import { handleFirestoreError, OperationType } from './auth';

export interface IndexedDocument {
  id: string;
  name: string;
  content: string;
  userId: string;
  folderId?: string;
  mimeType?: string;
  webViewLink?: string;
  createdAt: any;
  updatedAt: any;
}

export async function saveDocument(docData: Omit<IndexedDocument, 'createdAt' | 'updatedAt'>) {
  try {
    const docRef = doc(db, 'documents', docData.id);
    
    // Truncate content to roughly 150,000 characters to stay well under the limit and avoid stream exhaustion
    const MAX_CONTENT_LENGTH = 150000;
    const safeContent = docData.content && docData.content.length > MAX_CONTENT_LENGTH 
      ? docData.content.substring(0, MAX_CONTENT_LENGTH) + '\n\n[Внимание: Содержимое файла было обрезано из-за ограничений размера базы данных]'
      : (docData.content || '');

    const updateData = {
      name: docData.name || '',
      content: safeContent,
      folderId: docData.folderId || '',
      mimeType: docData.mimeType || '',
      webViewLink: docData.webViewLink || '',
      updatedAt: serverTimestamp()
    };

    try {
      await updateDoc(docRef, updateData as any);
    } catch (e: any) {
      if (e.code === 'not-found') {
        const createData = {
          ...updateData,
          id: docData.id,
          userId: docData.userId,
          createdAt: serverTimestamp()
        };
        await setDoc(docRef, createData);
      } else {
        throw e;
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `documents/${docData.id}`);
  }
}

export async function getDocuments(userId: string): Promise<IndexedDocument[]> {
  try {
    const q = query(collection(db, 'documents'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as IndexedDocument);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'documents');
    return [];
  }
}

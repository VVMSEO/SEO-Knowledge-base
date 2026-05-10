import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import * as fs from 'fs';

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf-8'));
const app = initializeApp(config);
const db = getFirestore(app, 'seonav');

async function test() {
  try {
    const q = query(collection(db, 'documents'), where('userId', '==', 'A97IK4dUORQzo4e2Ot3yDMNrXC43'));
    const snapshot = await getDocs(q);
    console.log("Documents found:", snapshot.docs.length);
    let totalSize = 0;
    snapshot.docs.forEach(doc => {
       const content = doc.data().content || '';
       totalSize += content.length;
    });
    console.log(`Total content size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  } catch(e: any) {
    console.log("Error message:", e.message);
  }
  process.exit();
}
test();

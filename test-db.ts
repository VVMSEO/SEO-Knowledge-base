import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import * as fs from 'fs';

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf-8'));
const app = initializeApp(config);
const db = getFirestore(app, 'seonav');

async function test() {
  const content = 'a'.repeat(400000);
  for (let i = 0; i < 5; i++) {
    try {
      console.log(`Writing ${i}...`);
      await setDoc(doc(db, 'test', 'large_doc_' + i), { content });
      console.log(`Written ${i}`);
    } catch (e: any) {
      console.error(`ERROR ${i}:`, e.message);
    }
  }
  process.exit();
}
test();

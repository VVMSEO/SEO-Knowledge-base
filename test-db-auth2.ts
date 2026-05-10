import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import * as fs from 'fs';

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf-8'));
const app = initializeApp(config);
const db = getFirestore(app, 'seonav');

async function test() {
  try {
    await setDoc(doc(db, 'documents', 'nonexistent123'), { name: 'test' });
    console.log("Success");
  } catch(e: any) {
    console.log("Error code:", e.code);
    console.log("Error message:", e.message);
  }
  process.exit();
}
test();

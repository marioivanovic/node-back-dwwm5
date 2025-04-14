import admin from 'firebase-admin';
import serviceAccount from './firebaseConfig.js';

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
export { db };
// Firebase project configuration and initialization
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyA0j3GrHXmm-ncywptjabwcZO6TL7-zgiE',
  authDomain: 'petmarcetlace.firebaseapp.com',
  projectId: 'petmarcetlace',
  storageBucket: 'petmarcetlace.firebasestorage.app',
  messagingSenderId: '556244164833',
  appId: '1:556244164833:web:5a3488291b6198461057a0',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

const commentsRef = collection(db, 'comments');

export function addComment(data) {
  return addDoc(commentsRef, {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function getComments(listingId) {
  const q = query(commentsRef, where('listingId', '==', listingId));
  const snapshot = await getDocs(q);
  const comments = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  return comments.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
}

import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import { db } from '../firebase';

const listingsRef = collection(db, 'listings');

export function createListing(data) {
  return addDoc(listingsRef, {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function getListings() {
  const q = query(listingsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getListingsByAuthor(authorId) {
  const q = query(listingsRef, where('authorId', '==', authorId));
  const snapshot = await getDocs(q);
  const listings = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  return listings.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

export async function getListingById(id) {
  const snapshot = await getDoc(doc(db, 'listings', id));
  if (!snapshot.exists()) {
    return null;
  }
  return { id: snapshot.id, ...snapshot.data() };
}

export function updateListing(id, data) {
  return updateDoc(doc(db, 'listings', id), data);
}

export function deleteListing(id) {
  return deleteDoc(doc(db, 'listings', id));
}

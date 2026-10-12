import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { getListingById } from './listings';

const favoritesRef = collection(db, 'favorites');

function favoriteId(userId, listingId) {
  return `${userId}_${listingId}`;
}

export async function isFavorite(userId, listingId) {
  const snapshot = await getDoc(doc(db, 'favorites', favoriteId(userId, listingId)));
  return snapshot.exists();
}

export function addFavorite(userId, listingId) {
  return setDoc(doc(db, 'favorites', favoriteId(userId, listingId)), {
    userId,
    listingId,
    createdAt: serverTimestamp(),
  });
}

export function removeFavorite(userId, listingId) {
  return deleteDoc(doc(db, 'favorites', favoriteId(userId, listingId)));
}

export async function getFavoriteListingIds(userId) {
  const q = query(favoritesRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => d.data().listingId);
}

export async function getFavoriteListings(userId) {
  const ids = await getFavoriteListingIds(userId);
  const listings = await Promise.all(ids.map((listingId) => getListingById(listingId)));
  return listings.filter((listing) => listing !== null);
}

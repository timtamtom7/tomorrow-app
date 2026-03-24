// Recipients Firestore service
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase/config';

const RECIPIENTS_COL = 'recipients';

/**
 * Create a recipient profile.
 */
export async function createRecipient({ userId, name, relationship, email }) {
  const recipientsRef = collection(db, RECIPIENTS_COL);
  return addDoc(recipientsRef, {
    userId,
    name: name.trim(),
    relationship: relationship || '',
    email: email || '',
    createdAt: serverTimestamp(),
  });
}

/**
 * Update a recipient profile.
 */
export async function updateRecipient(recipientId, data) {
  const recipientRef = doc(db, RECIPIENTS_COL, recipientId);
  return updateDoc(recipientRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a recipient profile.
 */
export async function deleteRecipient(recipientId) {
  const recipientRef = doc(db, RECIPIENTS_COL, recipientId);
  return deleteDoc(recipientRef);
}

/**
 * Get a single recipient by ID.
 */
export async function getRecipient(recipientId) {
  const snap = await getDoc(doc(db, RECIPIENTS_COL, recipientId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * Get all recipients for a user.
 */
export async function getUserRecipients(userId) {
  const recipientsRef = collection(db, RECIPIENTS_COL);
  const q = query(
    recipientsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Real-time listener for a user's recipients.
 */
export function subscribeToUserRecipients(userId, callback) {
  const recipientsRef = collection(db, RECIPIENTS_COL);
  const q = query(
    recipientsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, snap => {
    const recipients = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(recipients);
  });
}

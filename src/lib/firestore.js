// Firestore service — letters CRUD
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase/config';

const LETTERS_COL = 'letters';

/**
 * Create a new letter (draft or sealed).
 * Returns the new letter doc ref.
 */
export async function createLetter({ senderId, senderName, recipientEmail, recipientName, recipientRelationship, subject, body, bodyHtml, tone, deliverAt, status = 'draft', photoAttachment, voiceAttachment, allowReply }) {
  const lettersRef = collection(db, LETTERS_COL);
  return addDoc(lettersRef, {
    senderId,
    senderName,
    recipientEmail: recipientEmail || null,
    recipientName: recipientName || null,
    recipientRelationship: recipientRelationship || null,
    subject: subject || '',
    body: body || '',
    bodyHtml: bodyHtml || null,
    tone: tone || 'quiet',
    deliverAt: deliverAt ? new Date(deliverAt) : null,
    sentAt: status === 'sealed' ? new Date() : null,
    status,
    allowReply: allowReply || false,
    photoAttachment: photoAttachment || null,
    voiceAttachment: voiceAttachment || null,
    createdAt: serverTimestamp(),
  });
}

/**
 * Update a draft letter.
 */
export async function updateLetter(letterId, data) {
  const letterRef = doc(db, LETTERS_COL, letterId);
  return updateDoc(letterRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Get a single letter by ID.
 */
export async function getLetter(letterId) {
  const letterRef = doc(db, LETTERS_COL, letterId);
  const snap = await getDoc(letterRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * Get all letters for a user (as sender).
 * Returns an array sorted by createdAt desc.
 */
export async function getUserLetters(userId) {
  const lettersRef = collection(db, LETTERS_COL);
  const q = query(
    lettersRef,
    where('senderId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Mark a letter as sealed (ready to send).
 */
export async function sealLetter(letterId) {
  const letterRef = doc(db, LETTERS_COL, letterId);
  return updateDoc(letterRef, {
    status: 'sealed',
    sentAt: new Date(),
  });
}

/**
 * Mark a letter as delivered (email sent).
 */
export async function deliverLetter(letterId) {
  const letterRef = doc(db, LETTERS_COL, letterId);
  return updateDoc(letterRef, {
    status: 'delivered',
    deliveredAt: new Date(),
  });
}

/**
 * Mark a letter as opened (recipient claimed it).
 */
export async function openLetter(letterId) {
  const letterRef = doc(db, LETTERS_COL, letterId);
  return updateDoc(letterRef, {
    status: 'opened',
    openedAt: new Date(),
  });
}

/**
 * Cancel a letter before delivery.
 */
export async function cancelLetter(letterId) {
  const letterRef = doc(db, LETTERS_COL, letterId);
  return updateDoc(letterRef, {
    status: 'cancelled',
    cancelledAt: new Date(),
  });
}

/**
 * Delete a letter (draft only).
 */
export async function deleteLetter(letterId) {
  const letterRef = doc(db, LETTERS_COL, letterId);
  return updateDoc(letterRef, { status: 'deleted', deletedAt: new Date() });
}

/**
 * Real-time listener for a user's letters.
 */
export function subscribeToUserLetters(userId, callback) {
  const lettersRef = collection(db, LETTERS_COL);
  const q = query(
    lettersRef,
    where('senderId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, snap => {
    const letters = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(letters);
  });
}

/**
 * Real-time listener for a single letter.
 */
export function subscribeToLetter(letterId, callback) {
  const letterRef = doc(db, LETTERS_COL, letterId);
  return onSnapshot(letterRef, snap => {
    if (!snap.exists()) return callback(null);
    callback({ id: snap.id, ...snap.data() });
  });
}

/**
 * Get all sealed letters sent to a specific recipient (by email).
 * Used to show recipient history in the recipient profile.
 */
export function getLettersToRecipient(userId, recipientEmail) {
  const lettersRef = collection(db, LETTERS_COL);
  const q = query(
    lettersRef,
    where('senderId', '==', userId),
    where('recipientEmail', '==', recipientEmail),
    where('status', 'in', ['sealed', 'delivered', 'opened']),
    orderBy('sentAt', 'desc')
  );
  return getDocs(q).then(snap =>
    snap.docs.map(d => ({ id: d.id, ...d.data() }))
  );
}

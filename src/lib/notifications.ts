import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from './firestore-utils';

export async function sendNotification(type: 'login' | 'logout' | 'upload' | 'download' | 'notice' | 'admin', title: string, message: string) {
  const path = 'notifications';
  try {
    await addDoc(collection(db, path), {
      type,
      title,
      message,
      timestamp: serverTimestamp(),
      read: false
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

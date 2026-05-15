import functions from '@react-native-firebase/functions';
import firestore from '@react-native-firebase/firestore';

const db = firestore();

/**
 * Send a message to the AI chat Cloud Function.
 * Returns { message: string } with the assistant's response.
 */
export async function sendAIChatMessage(message) {
  const aiChat = functions().httpsCallable('aiChat');
  const result = await aiChat({ message });
  return result.data;
}

/**
 * Subscribe to chat messages in real-time.
 * Returns unsubscribe function.
 */
export function subscribeChatMessages(uid, callback, onError) {
  return db
    .collection('users')
    .doc(uid)
    .collection('aiChats')
    .doc('current')
    .collection('messages')
    .orderBy('createdAt', 'asc')
    .limitToLast(50)
    .onSnapshot(
      (snapshot) => {
        const messages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(messages);
      },
      (err) => {
        console.warn('Chat subscription error:', err.message);
        onError?.(err);
      },
    );
}

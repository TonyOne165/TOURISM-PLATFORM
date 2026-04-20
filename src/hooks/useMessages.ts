import { useState, useEffect } from 'react';
import {
  collection, addDoc, updateDoc, doc,
  getDocs, query, where, orderBy, Timestamp, or,
} from 'firebase/firestore';
import { db, COLLECTIONS } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import type { Message } from '../types';

export const useMessages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchMessages = async () => {
    if (!user) return;
    try {
      setLoading(true);
      let msgs: Message[];
      try {
        const q = query(
          collection(db, COLLECTIONS.MESSAGES),
          or(
            where('senderId', '==', user.uid),
            where('receiverId', '==', user.uid)
          ),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        msgs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Message[];
      } catch (indexErr) {
        // Fallback: run two separate queries if composite index is missing
        console.warn('Messages or() query failed, using fallback:', indexErr);
        const [sentSnap, receivedSnap] = await Promise.all([
          getDocs(query(collection(db, COLLECTIONS.MESSAGES), where('senderId', '==', user.uid))),
          getDocs(query(collection(db, COLLECTIONS.MESSAGES), where('receiverId', '==', user.uid))),
        ]);
        const sentMsgs = sentSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Message[];
        const receivedMsgs = receivedSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Message[];
        // Deduplicate (user could be both sender and receiver)
        const map = new Map<string, Message>();
        [...sentMsgs, ...receivedMsgs].forEach(m => map.set(m.id!, m));
        msgs = Array.from(map.values());
        msgs.sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() || 0;
          const bTime = b.createdAt?.toMillis?.() || 0;
          return bTime - aTime;
        });
      }
      setMessages(msgs);
      setUnreadCount(msgs.filter(m => m.receiverId === user.uid && !m.read).length);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, [user]);

  const sendMessage = async (data: {
    receiverId: string;
    receiverName: string;
    subject: string;
    body: string;
  }): Promise<string> => {
    if (!user) throw new Error('Must be logged in');
    const msg: Omit<Message, 'id'> = {
      ...data,
      senderId: user.uid,
      senderName: user.displayName || 'Usuario',
      senderRole: user.role,
      read: false,
      createdAt: Timestamp.now(),
    };
    const docRef = await addDoc(collection(db, COLLECTIONS.MESSAGES), msg);
    await fetchMessages();
    return docRef.id;
  };

  const markAsRead = async (messageId: string): Promise<void> => {
    await updateDoc(doc(db, COLLECTIONS.MESSAGES, messageId), { read: true });
    await fetchMessages();
  };

  const getConversation = (otherUserId: string): Message[] => {
    return messages.filter(
      m => (m.senderId === otherUserId || m.receiverId === otherUserId)
    );
  };

  return { messages, loading, unreadCount, fetchMessages, sendMessage, markAsRead, getConversation };
};

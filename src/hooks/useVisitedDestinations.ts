import { useState } from 'react';
import {
  collection, addDoc, getDocs, query, where, orderBy, Timestamp,
} from 'firebase/firestore';
import { db, COLLECTIONS } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import type { VisitedDestination } from '../types';

export const useVisitedDestinations = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const getUserVisited = async (): Promise<VisitedDestination[]> => {
    if (!user) return [];
    setLoading(true);
    try {
      const q = query(
        collection(db, COLLECTIONS.VISITED_DESTINATIONS),
        where('userId', '==', user.uid),
        orderBy('visitDate', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as VisitedDestination[];
    } finally {
      setLoading(false);
    }
  };

  const getAllVisited = async (): Promise<VisitedDestination[]> => {
    setLoading(true);
    try {
      const snapshot = await getDocs(query(collection(db, COLLECTIONS.VISITED_DESTINATIONS), orderBy('visitDate', 'desc')));
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as VisitedDestination[];
    } finally {
      setLoading(false);
    }
  };

  const markAsVisited = async (data: {
    tourId: string;
    tourTitle: string;
    tourCategory?: string;
    visitDate: Date;
    rating?: number;
    notes?: string;
  }): Promise<string> => {
    if (!user) throw new Error('Must be logged in');
    const dest: Omit<VisitedDestination, 'id'> = {
      ...data,
      userId: user.uid,
      visitDate: Timestamp.fromDate(data.visitDate),
      createdAt: Timestamp.now(),
    };
    const docRef = await addDoc(collection(db, COLLECTIONS.VISITED_DESTINATIONS), dest);
    return docRef.id;
  };

  return { loading, getUserVisited, getAllVisited, markAsVisited };
};

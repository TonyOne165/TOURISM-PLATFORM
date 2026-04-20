import { useState } from 'react';
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  getDocs, query, where, orderBy, Timestamp,
} from 'firebase/firestore';
import { db, COLLECTIONS } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import type { Review } from '../types';

export const useReviews = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const getReviewsByTour = async (tourId: string): Promise<Review[]> => {
    let snapshot;
    try {
      const q = query(
        collection(db, COLLECTIONS.REVIEWS),
        where('tourId', '==', tourId),
        orderBy('createdAt', 'desc')
      );
      snapshot = await getDocs(q);
    } catch {
      // Fallback without orderBy if composite index is missing
      snapshot = await getDocs(query(collection(db, COLLECTIONS.REVIEWS), where('tourId', '==', tourId)));
    }
    const reviews = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Review[];
    reviews.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
    return reviews;
  };

  const getReviewsByAccommodation = async (accommodationId: string): Promise<Review[]> => {
    let snapshot;
    try {
      const q = query(
        collection(db, COLLECTIONS.REVIEWS),
        where('accommodationId', '==', accommodationId),
        orderBy('createdAt', 'desc')
      );
      snapshot = await getDocs(q);
    } catch {
      snapshot = await getDocs(query(collection(db, COLLECTIONS.REVIEWS), where('accommodationId', '==', accommodationId)));
    }
    const reviews = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Review[];
    reviews.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
    return reviews;
  };

  const getUserReviews = async (): Promise<Review[]> => {
    if (!user) return [];
    let snapshot;
    try {
      const q = query(
        collection(db, COLLECTIONS.REVIEWS),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      snapshot = await getDocs(q);
    } catch {
      snapshot = await getDocs(query(collection(db, COLLECTIONS.REVIEWS), where('userId', '==', user.uid)));
    }
    const reviews = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Review[];
    reviews.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
    return reviews;
  };

  const createReview = async (data: {
    rating: number;
    comment: string;
    tourId?: string;
    tourTitle?: string;
    accommodationId?: string;
    accommodationName?: string;
    type: 'tour' | 'accommodation';
  }): Promise<string> => {
    if (!user) throw new Error('Must be logged in');
    setLoading(true);
    try {
      const review: Record<string, unknown> = {
        ...data,
        userId: user.uid,
        userName: user.displayName || 'Anónimo',
        createdAt: Timestamp.now(),
      };
      // Only include userPhoto if it has a value — Firestore rejects undefined
      if (user.photoURL) {
        review.userPhoto = user.photoURL;
      }
      const docRef = await addDoc(collection(db, COLLECTIONS.REVIEWS), review);
      return docRef.id;
    } finally {
      setLoading(false);
    }
  };

  const updateReview = async (id: string, updates: { rating?: number; comment?: string }): Promise<void> => {
    setLoading(true);
    try {
      await updateDoc(doc(db, COLLECTIONS.REVIEWS, id), { ...updates, updatedAt: Timestamp.now() });
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, COLLECTIONS.REVIEWS, id));
  };

  return { loading, getReviewsByTour, getReviewsByAccommodation, getUserReviews, createReview, updateReview, deleteReview };
};

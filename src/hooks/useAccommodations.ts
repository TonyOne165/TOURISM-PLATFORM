import { useState, useEffect } from 'react';
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  getDocs, query, orderBy, Timestamp, where,
} from 'firebase/firestore';
import { db, COLLECTIONS } from '../services/firebase';
import type { Accommodation, CreateAccommodationInput } from '../types';

export const useAccommodations = () => {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccommodations = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, COLLECTIONS.ACCOMMODATIONS), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Accommodation[];
      setAccommodations(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching accommodations:', err);
      setError('Error loading accommodations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAccommodations(); }, []);

  const getByTourId = async (tourId: string): Promise<Accommodation[]> => {
    try {
      const q = query(
        collection(db, COLLECTIONS.ACCOMMODATIONS),
        where('associatedTourIds', 'array-contains', tourId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Accommodation[];
    } catch {
      return [];
    }
  };

  const createAccommodation = async (input: CreateAccommodationInput, imageUrls: string[] = []): Promise<string> => {
    const slug = input.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    const data: Omit<Accommodation, 'id'> = {
      ...input,
      slug,
      images: imageUrls,
      rating: 0,
      reviewCount: 0,
      createdAt: Timestamp.now(),
    };
    const docRef = await addDoc(collection(db, COLLECTIONS.ACCOMMODATIONS), data);
    await fetchAccommodations();
    return docRef.id;
  };

  const updateAccommodation = async (id: string, updates: Partial<Accommodation>, imageUrls?: string[]): Promise<void> => {
    const docRef = doc(db, COLLECTIONS.ACCOMMODATIONS, id);
    await updateDoc(docRef, {
      ...updates,
      ...(imageUrls?.length ? { images: imageUrls } : {}),
      updatedAt: Timestamp.now(),
    });
    await fetchAccommodations();
  };

  const deleteAccommodation = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, COLLECTIONS.ACCOMMODATIONS, id));
    await fetchAccommodations();
  };

  return { accommodations, loading, error, fetchAccommodations, getByTourId, createAccommodation, updateAccommodation, deleteAccommodation };
};

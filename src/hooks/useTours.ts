import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db, COLLECTIONS } from '../services/firebase';
import type { Tour, CreateTourInput } from '../types';

/**
 * Hook para manejar los tours
 * Compatible con URLs externas (sin Firebase Storage)
 */
export const useTours = () => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Obtener todos los tours
  const fetchTours = async () => {
    try {
      setLoading(true);
      let snapshot;
      try {
        // Try with orderBy first (requires Firestore index)
        const q = query(collection(db, COLLECTIONS.TOURS), orderBy('createdAt', 'desc'));
        snapshot = await getDocs(q);
      } catch (indexErr) {
        // Fallback: fetch without orderBy if index doesn't exist
        console.warn('Firestore index not available for tours, fetching without order:', indexErr);
        snapshot = await getDocs(collection(db, COLLECTIONS.TOURS));
      }
      const toursData = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Tour[];
      setTours(toursData);
      setError(null);
    } catch (err) {
      console.error('Error fetching tours:', err);
      setError('Error loading tours');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, []);

  // 🔹 Obtener tour por ID
  const getTourById = async (id: string): Promise<Tour | null> => {
    try {
      const docRef = doc(db, COLLECTIONS.TOURS, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Tour;
      }
      return null;
    } catch (err) {
      console.error('Error fetching tour:', err);
      return null;
    }
  };

  // 🔹 Obtener tour por slug
  const getTourBySlug = async (slug: string): Promise<Tour | null> => {
    try {
      const q = query(collection(db, COLLECTIONS.TOURS));
      const snapshot = await getDocs(q);
      const tour = snapshot.docs.find((docSnap) => docSnap.data().slug === slug);
      if (tour) {
        return { id: tour.id, ...tour.data() } as Tour;
      }
      return null;
    } catch (err) {
      console.error('Error fetching tour by slug:', err);
      return null;
    }
  };

  // 🔹 Crear tour (usa URLs externas)
  const createTour = async (
    input: CreateTourInput,
    authorId: string,
    imageUrls?: string[]
  ): Promise<string> => {
    try {
      const slug = input.title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '');

      const tourData: Omit<Tour, 'id'> = {
        ...input,
        slug,
        images: imageUrls || [],
        rating: 0,
        reviews: [],
        createdAt: Timestamp.now(),
        authorId,
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.TOURS), tourData);
      await fetchTours();
      return docRef.id;
    } catch (err) {
      console.error('Error creating tour:', err);
      throw new Error('Failed to create tour');
    }
  };

  // 🔹 Actualizar tour (acepta imágenes externas opcionales)
  const updateTour = async (
    id: string,
    updates: Partial<Tour>,
    imageUrls?: string[]
  ): Promise<void> => {
    try {
      const docRef = doc(db, COLLECTIONS.TOURS, id);
      const updateData = {
        ...updates,
        ...(imageUrls && imageUrls.length > 0 ? { images: imageUrls } : {}),
        updatedAt: Timestamp.now(),
      };
      await updateDoc(docRef, updateData);
      await fetchTours();
    } catch (err) {
      console.error('Error updating tour:', err);
      throw new Error('Failed to update tour');
    }
  };

  // 🔹 Eliminar tour
  const deleteTour = async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.TOURS, id));
      await fetchTours();
    } catch (err) {
      console.error('Error deleting tour:', err);
      throw new Error('Failed to delete tour');
    }
  };

  return {
    tours,
    loading,
    error,
    fetchTours,
    getTourById,
    getTourBySlug,
    createTour,
    updateTour,
    deleteTour,
  };
};

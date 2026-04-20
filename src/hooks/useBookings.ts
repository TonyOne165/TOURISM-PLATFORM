import { useState, useEffect, useCallback } from 'react';
import {
  collection, addDoc, updateDoc, doc, getDocs, query, where, orderBy, Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db, COLLECTIONS } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import type { Booking, CreateBookingInput } from '../types';

export const useBookings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getUserBookings = async (): Promise<Booking[]> => {
    if (!user) return [];
    setLoading(true);
    setError(null);
    try {
      let snapshot;
      try {
        const q = query(
          collection(db, COLLECTIONS.BOOKINGS),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        snapshot = await getDocs(q);
      } catch (indexErr) {
        console.warn('Firestore index not available for bookings, fetching without order:', indexErr);
        const fallbackQ = query(
          collection(db, COLLECTIONS.BOOKINGS),
          where('userId', '==', user.uid)
        );
        snapshot = await getDocs(fallbackQ);
      }
      const bookings = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Booking[];
      bookings.sort((a, b) => {
        const aTime = (a.createdAt as Timestamp)?.toMillis?.() || 0;
        const bTime = (b.createdAt as Timestamp)?.toMillis?.() || 0;
        return bTime - aTime;
      });
      return bookings;
    } catch (err) {
      setError(err as Error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  /** Real-time subscription to user bookings */
  const subscribeToUserBookings = (
    callback: (bookings: Booking[]) => void,
    onError?: (err: Error) => void
  ) => {
    if (!user) {
      callback([]);
      return () => {};
    }
    try {
      const q = query(
        collection(db, COLLECTIONS.BOOKINGS),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const bookings = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Booking[];
        callback(bookings);
      }, (err) => {
        console.warn('Bookings subscription error (may need Firestore index), trying fallback:', err);
        // Fallback: query without orderBy, sort client-side
        const fallbackQ = query(
          collection(db, COLLECTIONS.BOOKINGS),
          where('userId', '==', user.uid)
        );
        const fallbackUnsub = onSnapshot(fallbackQ, (snapshot) => {
          const bookings = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Booking[];
          bookings.sort((a, b) => {
            const aTime = (a.createdAt as Timestamp)?.toMillis?.() || 0;
            const bTime = (b.createdAt as Timestamp)?.toMillis?.() || 0;
            return bTime - aTime;
          });
          callback(bookings);
        }, (fallbackErr) => {
          console.error('Fallback bookings subscription also failed:', fallbackErr);
          callback([]);
          onError?.(fallbackErr as Error);
        });
        // Replace the cleanup function
        cleanupRef.current = fallbackUnsub;
      });
      const cleanupRef = { current: unsubscribe };
      return () => cleanupRef.current();
    } catch (err) {
      console.error('Error setting up bookings subscription:', err);
      callback([]);
      onError?.(err as Error);
      return () => {};
    }
  };

  const createBooking = async (input: CreateBookingInput): Promise<string> => {
    if (!user) throw new Error('User must be logged in');
    setLoading(true);
    setError(null);
    try {
      const booking: Omit<Booking, 'id'> = {
        userId: user.uid,
        userName: user.displayName || 'Usuario',
        type: input.type,
        date: input.date instanceof Date ? Timestamp.fromDate(input.date) : input.date as Timestamp,
        status: 'pending',
        participants: input.participants || 1,
        paymentStatus: 'pending',
        createdAt: Timestamp.now(),
      };

      if (user.email) booking.userEmail = user.email;
      if (input.tourId) booking.tourId = input.tourId;
      if (input.tourTitle) booking.tourTitle = input.tourTitle;
      if (input.accommodationId) booking.accommodationId = input.accommodationId;
      if (input.accommodationName) booking.accommodationName = input.accommodationName;
      if (input.endDate) booking.endDate = input.endDate instanceof Date ? Timestamp.fromDate(input.endDate) : input.endDate as Timestamp;
      if (input.notes) booking.notes = input.notes;
      if (input.promoCode) booking.promoCode = input.promoCode;
      if (input.totalPrice != null) booking.totalPrice = input.totalPrice;
      if (input.discount != null) booking.discount = input.discount;
      if (input.paymentMethod) {
        booking.paymentMethod = input.paymentMethod;
        // Simulate payment processing based on method
        booking.paymentStatus = simulatePayment(input.paymentMethod);
      }

      const docRef = await addDoc(collection(db, COLLECTIONS.BOOKINGS), booking);
      return docRef.id;
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: Booking['status']): Promise<void> => {
    await updateDoc(doc(db, COLLECTIONS.BOOKINGS, bookingId), { status, updatedAt: Timestamp.now() });
  };

  const updatePaymentStatus = async (bookingId: string, paymentStatus: Booking['paymentStatus']): Promise<void> => {
    const updates: Record<string, unknown> = { paymentStatus, updatedAt: Timestamp.now() };
    if (paymentStatus === 'paid') {
      updates.status = 'confirmed';
    }
    await updateDoc(doc(db, COLLECTIONS.BOOKINGS, bookingId), updates);
  };

  const cancelBooking = async (bookingId: string): Promise<void> => {
    await updateBookingStatus(bookingId, 'cancelled');
  };

  return {
    getUserBookings, subscribeToUserBookings, createBooking,
    updateBookingStatus, updatePaymentStatus, cancelBooking,
    loading, error,
  };
};

/** Simulate payment result based on method */
function simulatePayment(method: string): 'pending' | 'paid' {
  // PayPal and card payments simulate immediate success
  if (method === 'paypal' || method === 'credit_card' || method === 'debit_card') {
    return 'paid';
  }
  // PSE, Google Pay, Apple Pay remain pending for admin validation
  return 'pending';
}

export default useBookings;

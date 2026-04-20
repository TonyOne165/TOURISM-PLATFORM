import { useState } from 'react';
import {
  collection, getDocs, query, where, orderBy, Timestamp,
  limit,
} from 'firebase/firestore';
import { db, COLLECTIONS } from '../services/firebase';
import type { DashboardStats, Booking, User, Tour } from '../types';

export const useAnalytics = () => {
  const [loading, setLoading] = useState(false);

  const getDashboardStats = async (): Promise<DashboardStats> => {
    setLoading(true);
    try {
      const [usersSnap, bookingsSnap, toursSnap, accommodationsSnap] = await Promise.all([
        getDocs(collection(db, COLLECTIONS.USERS)),
        getDocs(collection(db, COLLECTIONS.BOOKINGS)),
        getDocs(collection(db, COLLECTIONS.TOURS)),
        getDocs(collection(db, COLLECTIONS.ACCOMMODATIONS)),
      ]);

      const users = usersSnap.docs.map(d => d.data()) as User[];
      const bookings = bookingsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Booking[];
      const tours = toursSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Tour[];

      const totalRevenue = bookings
        .filter(b => b.status === 'confirmed' || b.status === 'completed')
        .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const activeUsers = users.filter(u =>
        u.updatedAt && u.updatedAt.toDate() > thirtyDaysAgo
      ).length;

      // Tour popularity
      const tourBookingCounts: Record<string, number> = {};
      bookings.forEach(b => {
        if (b.tourId) {
          tourBookingCounts[b.tourId] = (tourBookingCounts[b.tourId] || 0) + 1;
        }
      });

      const popularTours = Object.entries(tourBookingCounts)
        .map(([tourId, count]) => {
          const tour = tours.find(t => t.id === tourId);
          return { tourId, title: tour?.title || 'Unknown', bookings: count };
        })
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, 5);

      // Revenue by month
      const revenueByMonth: Record<string, number> = {};
      bookings.forEach(b => {
        if (b.createdAt && (b.status === 'confirmed' || b.status === 'completed')) {
          const date = b.createdAt.toDate();
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          revenueByMonth[key] = (revenueByMonth[key] || 0) + (b.totalPrice || 0);
        }
      });

      // Bookings by status
      const statusCounts: Record<string, number> = {};
      bookings.forEach(b => {
        statusCounts[b.status] = (statusCounts[b.status] || 0) + 1;
      });

      const avgRating = tours.length > 0
        ? tours.reduce((s, t) => s + t.rating, 0) / tours.length
        : 0;

      return {
        totalUsers: users.length,
        activeUsers,
        totalBookings: bookings.length,
        totalRevenue,
        pendingBookings: bookings.filter(b => b.status === 'pending').length,
        completedBookings: bookings.filter(b => b.status === 'completed').length,
        totalTours: tours.length,
        totalAccommodations: accommodationsSnap.size,
        averageRating: avgRating,
        popularTours,
        revenueByMonth: Object.entries(revenueByMonth)
          .map(([month, revenue]) => ({ month, revenue }))
          .sort((a, b) => a.month.localeCompare(b.month)),
        bookingsByStatus: Object.entries(statusCounts)
          .map(([status, count]) => ({ status, count })),
      };
    } finally {
      setLoading(false);
    }
  };

  const getAllUsers = async (): Promise<User[]> => {
    let snapshot;
    try {
      snapshot = await getDocs(query(collection(db, COLLECTIONS.USERS), orderBy('createdAt', 'desc')));
    } catch {
      // Fallback: fetch without orderBy (handles missing createdAt fields)
      snapshot = await getDocs(collection(db, COLLECTIONS.USERS));
    }
    const users = snapshot.docs.map(d => ({ uid: d.id, ...d.data() })) as User[];
    // Client-side sort as fallback for docs missing createdAt
    users.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;
      return bTime - aTime;
    });
    return users;
  };

  const getAllBookings = async (): Promise<Booking[]> => {
    const snapshot = await getDocs(query(collection(db, COLLECTIONS.BOOKINGS), orderBy('createdAt', 'desc')));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Booking[];
  };

  const getRecentBookings = async (count: number = 10): Promise<Booking[]> => {
    const q = query(collection(db, COLLECTIONS.BOOKINGS), orderBy('createdAt', 'desc'), limit(count));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Booking[];
  };

  return { loading, getDashboardStats, getAllUsers, getAllBookings, getRecentBookings };
};

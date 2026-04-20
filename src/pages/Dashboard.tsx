import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../hooks/useAuth';
import { COLLECTIONS } from '../utils/constants';
import type { Booking, Tour } from '../types';

interface BookingWithTour extends Booking {
  tour?: Tour;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingWithTour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;
      
      try {
        // Get user's bookings
        const bookingsQuery = query(
          collection(db, COLLECTIONS.BOOKINGS),
          where('userId', '==', user.uid)
        );
        const bookingsSnapshot = await getDocs(bookingsQuery);
        const bookingsData = bookingsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as BookingWithTour[];

        // Fetch tour details for each booking
        const bookingsWithTours = await Promise.all(
          bookingsData.map(async (booking) => {
            const tourDoc = await getDocs(
              query(
                collection(db, COLLECTIONS.TOURS),
                where('id', '==', booking.tourId)
              )
            );
            
            if (!tourDoc.empty) {
              booking.tour = {
                id: tourDoc.docs[0].id,
                ...tourDoc.docs[0].data()
              } as Tour;
            }
            
            return booking;
          })
        );

        setBookings(bookingsWithTours);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Error loading your bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'badge-success';
      case 'pending':
        return 'badge-warning';
      case 'cancelled':
        return 'badge-error';
      default:
        return 'badge-ghost';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6">
        {/* User Profile Section */}
        <div className="bg-base-200 rounded-lg p-6 mb-8">
        <div className="flex items-center gap-4">
          {user?.photoURL && (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              className="w-16 h-16 rounded-full"
            />
          )}
          <div>
            <h2 className="text-2xl font-bold">{user?.displayName || 'User'}</h2>
            <p className="text-gray-600">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Bookings Section */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Your Bookings</h3>
        
        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="text-center py-8">
            <h4 className="text-lg font-semibold mb-2">No bookings yet</h4>
            <p className="text-gray-600">Start exploring our amazing tours!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bookings.map((booking) => (
              <div key={booking.id} className="card bg-base-200 shadow-xl">
                {booking.tour?.images?.[0] && (
                  <figure>
                    <img
                      src={booking.tour.images[0]}
                      alt={booking.tour.title}
                      className="w-full h-48 object-cover"
                    />
                  </figure>
                )}
                
                <div className="card-body">
                  <h4 className="card-title">
                    {booking.tour?.title || 'Tour not found'}
                  </h4>
                  
                  <div className="flex flex-wrap gap-2 my-2">
                    <span className={`badge ${getStatusColor(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                    <span className="badge badge-outline">
                      {booking.date.toDate().toLocaleDateString()}
                    </span>
                  </div>

                  {booking.tour && (
                    <>
                      <p className="text-gray-600 line-clamp-2">
                        {booking.tour.description}
                      </p>
                      <p className="text-primary font-semibold mt-2">
                        ${booking.tour.price.toLocaleString()}
                      </p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default Dashboard;

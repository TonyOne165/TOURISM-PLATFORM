import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useBookings } from '../../hooks/useBookings';
import { useVisitedDestinations } from '../../hooks/useVisitedDestinations';
import { useReviews } from '../../hooks/useReviews';
import type { Booking, VisitedDestination, Review } from '../../types';

export const UserDashboard = () => {
  const { user } = useAuth();
  const { getUserBookings } = useBookings();
  const { getUserVisited } = useVisitedDestinations();
  const { getUserReviews } = useReviews();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [visited, setVisited] = useState<VisitedDestination[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [b, v, r] = await Promise.all([
          getUserBookings().catch(() => [] as Booking[]),
          getUserVisited().catch(() => [] as VisitedDestination[]),
          getUserReviews().catch(() => [] as Review[]),
        ]);
        setBookings(b);
        setVisited(v);
        setReviews(r);
      } catch (err) {
        console.error('Error loading dashboard:', err);
        setError('Error al cargar el panel. Intenta recargar la página.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalSpent = bookings
    .filter(b => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const upcomingBookings = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed');

  if (loading) return <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg text-primary"></span></div>;

  if (error) return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Mi Panel</h1>
      <div className="alert alert-error mb-4"><span>{error}</span></div>
      <button className="btn btn-primary btn-sm" onClick={() => window.location.reload()}>Recargar</button>
    </div>
  );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Bienvenido, {user?.displayName || 'Viajero'}!</h1>
      <p className="text-base-content/60 mb-6">Tu resumen de actividad</p>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card bg-base-100 shadow-sm min-w-0">
          <div className="card-body p-4 text-center min-w-0">
            <span className="text-3xl shrink-0">🏝️</span>
            <p className="text-2xl font-bold text-primary truncate">{visited.length}</p>
            <p className="text-sm text-base-content/60 truncate">Destinos Visitados</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-sm min-w-0">
          <div className="card-body p-4 text-center min-w-0">
            <span className="text-3xl shrink-0">📋</span>
            <p className="text-2xl font-bold text-secondary truncate">{bookings.length}</p>
            <p className="text-sm text-base-content/60 truncate">Reservas Totales</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-sm min-w-0">
          <div className="card-body p-4 text-center min-w-0">
            <span className="text-3xl shrink-0">💰</span>
            <p className="text-2xl font-bold text-accent truncate">${totalSpent.toLocaleString()}</p>
            <p className="text-sm text-base-content/60 truncate">Total Gastado</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-sm min-w-0">
          <div className="card-body p-4 text-center min-w-0">
            <span className="text-3xl shrink-0">⭐</span>
            <p className="text-2xl font-bold truncate">{reviews.length}</p>
            <p className="text-sm text-base-content/60 truncate">Reseñas Escritas</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Bookings */}
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <div className="flex justify-between items-center">
              <h2 className="card-title text-lg">Próximas Reservas</h2>
              <Link to="/dashboard/bookings" className="btn btn-ghost btn-sm">Ver todas</Link>
            </div>
            {upcomingBookings.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-base-content/60 mb-3">No tienes reservas próximas</p>
                <Link to="/tours" className="btn btn-primary btn-sm">Explorar Tours</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingBookings.slice(0, 3).map(b => (
                  <div key={b.id} className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                    <div>
                      <p className="font-medium">{b.tourTitle || b.accommodationName || 'Reserva'}</p>
                      <p className="text-sm text-base-content/60">
                        {b.date?.toDate?.()?.toLocaleDateString() || 'Fecha pendiente'}
                      </p>
                    </div>
                    <span className={`badge ${b.status === 'confirmed' ? 'badge-info' : 'badge-warning'}`}>
                      {b.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Visits */}
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <div className="flex justify-between items-center">
              <h2 className="card-title text-lg">Últimos Destinos</h2>
              <Link to="/dashboard/history" className="btn btn-ghost btn-sm">Ver historial</Link>
            </div>
            {visited.length === 0 ? (
              <p className="text-center py-6 text-base-content/60">Aún no has visitado ningún destino</p>
            ) : (
              <div className="space-y-3">
                {visited.slice(0, 3).map(v => (
                  <div key={v.id} className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                    <div>
                      <p className="font-medium">{v.tourTitle}</p>
                      <p className="text-sm text-base-content/60">{v.visitDate?.toDate?.()?.toLocaleDateString?.() || 'Fecha no disponible'}</p>
                    </div>
                    {v.rating && <span className="text-yellow-500">{v.rating}/5 ⭐</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card bg-base-100 shadow-md lg:col-span-2">
          <div className="card-body">
            <h2 className="card-title text-lg">Acciones Rápidas</h2>
            <div className="flex flex-wrap gap-3">
              <Link to="/tours" className="btn btn-primary btn-sm">Explorar Tours</Link>
              <Link to="/accommodations" className="btn btn-secondary btn-sm">Ver Hospedajes</Link>
              <Link to="/dashboard/bookings" className="btn btn-outline btn-sm">Mis Reservas</Link>
              <Link to="/dashboard/reviews" className="btn btn-outline btn-sm">Mis Reseñas</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

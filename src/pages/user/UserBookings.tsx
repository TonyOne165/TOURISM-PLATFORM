import { useState, useEffect } from 'react';
import { useBookings } from '../../hooks/useBookings';
import type { Booking } from '../../types';

const PAYMENT_LABELS: Record<string, string> = {
  paypal: 'PayPal', google_pay: 'Google Pay', apple_pay: 'Apple Pay',
  credit_card: 'Tarjeta de Crédito', debit_card: 'Tarjeta de Débito', pse: 'PSE',
};
const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Pago Pendiente', paid: 'Pagado', failed: 'Pago Fallido', refunded: 'Reembolsado',
};
const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: 'badge-warning', paid: 'badge-success', failed: 'badge-error', refunded: 'badge-info',
};

export const UserBookings = () => {
  const { subscribeToUserBookings, cancelBooking } = useBookings();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');

  // Real-time subscription
  useEffect(() => {
    setLoading(true);
    setSubscriptionError(null);
    const unsubscribe = subscribeToUserBookings(
      (data) => {
        setBookings(data);
        setLoading(false);
        setSubscriptionError(null);
      },
      (err) => {
        console.error('Subscription error:', err);
        setSubscriptionError('Error al cargar las reservas. Intenta recargar la página.');
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm('¿Estás seguro de cancelar esta reserva?')) return;
    await cancelBooking(id);
  };

  const filtered = bookings.filter(b => !statusFilter || b.status === statusFilter);

  const statusColors: Record<string, string> = {
    pending: 'badge-warning', confirmed: 'badge-info', cancelled: 'badge-error', completed: 'badge-success'
  };
  const statusLabels: Record<string, string> = {
    pending: 'Pendiente', confirmed: 'Confirmada', cancelled: 'Cancelada', completed: 'Completada'
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-brand-dark">Mis Reservas</h1>
        {!loading && <span className="text-xs text-brand-dark/40 flex items-center gap-1 shrink-0">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Actualización en tiempo real
        </span>}
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
        <button className={`btn btn-sm ${!statusFilter ? 'bg-brand-blue text-white border-0' : 'btn-ghost text-brand-dark'}`} onClick={() => setStatusFilter('')}>Todas</button>
        <button className={`btn btn-sm ${statusFilter === 'pending' ? 'btn-warning' : 'btn-ghost text-brand-dark'}`} onClick={() => setStatusFilter('pending')}>Pendientes</button>
        <button className={`btn btn-sm ${statusFilter === 'confirmed' ? 'btn-info' : 'btn-ghost text-brand-dark'}`} onClick={() => setStatusFilter('confirmed')}>Confirmadas</button>
        <button className={`btn btn-sm ${statusFilter === 'completed' ? 'btn-success' : 'btn-ghost text-brand-dark'}`} onClick={() => setStatusFilter('completed')}>Completadas</button>
        <button className={`btn btn-sm ${statusFilter === 'cancelled' ? 'btn-error' : 'btn-ghost text-brand-dark'}`} onClick={() => setStatusFilter('cancelled')}>Canceladas</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg text-brand-blue"></span></div>
      ) : subscriptionError ? (
        <div className="card bg-brand-cream shadow-sm border border-red-300">
          <div className="card-body text-center">
            <p className="text-red-600">{subscriptionError}</p>
            <button className="btn btn-sm bg-brand-blue text-white hover:bg-brand-dark border-0 mt-2" onClick={() => window.location.reload()}>
              Recargar
            </button>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card bg-brand-cream shadow-sm border border-brand-beige">
          <div className="card-body text-center">
            <p className="text-brand-dark/60">No tienes reservas {statusFilter ? `con estado "${statusLabels[statusFilter]}"` : ''}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(b => (
            <div key={b.id} className="card bg-brand-cream shadow-md border border-brand-beige">
              <div className="card-body p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="badge badge-outline badge-sm border-brand-brown text-brand-dark">{b.type === 'tour' ? 'Tour' : 'Hospedaje'}</span>
                      <span className={`badge ${statusColors[b.status]} badge-sm`}>{statusLabels[b.status]}</span>
                      {b.paymentStatus && (
                        <span className={`badge ${PAYMENT_STATUS_COLORS[b.paymentStatus]} badge-sm`}>
                          {PAYMENT_STATUS_LABELS[b.paymentStatus]}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold mt-1 text-brand-dark">{b.tourTitle || b.accommodationName || 'Reserva'}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-brand-dark/60 mt-1">
                      <span>Fecha: {b.date?.toDate?.()?.toLocaleDateString() || 'N/A'}</span>
                      <span>Participantes: {b.participants || 1}</span>
                      <span className="font-semibold text-brand-blue">Total: ${b.totalPrice?.toLocaleString() || '0'}</span>
                    </div>
                    {b.paymentMethod && <p className="text-xs text-brand-dark/50 mt-1">Método: {PAYMENT_LABELS[b.paymentMethod] || b.paymentMethod}</p>}
                    {b.promoCode && (
                      <p className="text-sm text-success mt-1">
                        Código promo: {b.promoCode}
                        {b.discount ? ` (-$${b.discount.toLocaleString()})` : ''}
                      </p>
                    )}
                    {b.notes && <p className="text-sm mt-1 text-brand-dark/50">Notas: {b.notes}</p>}
                  </div>
                  {(b.status === 'pending' || b.status === 'confirmed') && (
                    <button className="btn btn-error btn-sm btn-outline" onClick={() => handleCancel(b.id!)}>
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

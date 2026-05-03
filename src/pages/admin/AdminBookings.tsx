import { useState, useEffect } from 'react';
import { doc, updateDoc, Timestamp, collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, COLLECTIONS } from '../../services/firebase';
import type { Booking, PaymentStatus } from '../../types';

const PAYMENT_LABELS: Record<string, string> = {
  paypal: 'PayPal', google_pay: 'Google Pay', apple_pay: 'Apple Pay',
  credit_card: 'T. Crédito', debit_card: 'T. Débito', pse: 'PSE',
};
const PAY_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente', paid: 'Pagado', failed: 'Fallido', refunded: 'Reembolsado',
};
const PAY_STATUS_COLORS: Record<string, string> = {
  pending: 'badge-warning', paid: 'badge-success', failed: 'badge-error', refunded: 'badge-info',
};

export const AdminBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [payFilter, setPayFilter] = useState('');

  // Real-time subscription to ALL bookings
  useEffect(() => {
    const q = query(collection(db, COLLECTIONS.BOOKINGS), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Booking[]);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching bookings:', err);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const updateStatus = async (id: string, status: Booking['status']) => {
    await updateDoc(doc(db, COLLECTIONS.BOOKINGS, id), { status, updatedAt: Timestamp.now() });
  };

  const updatePaymentStatus = async (id: string, paymentStatus: PaymentStatus) => {
    const updates: Record<string, unknown> = { paymentStatus, updatedAt: Timestamp.now() };
    // Auto-confirm booking when payment is marked as paid
    if (paymentStatus === 'paid') {
      updates.status = 'confirmed';
    }
    await updateDoc(doc(db, COLLECTIONS.BOOKINGS, id), updates);
  };

  const filtered = bookings.filter(b => {
    if (statusFilter && b.status !== statusFilter) return false;
    if (typeFilter && b.type !== typeFilter) return false;
    if (payFilter && b.paymentStatus !== payFilter) return false;
    return true;
  });

  const statusColors: Record<string, string> = {
    pending: 'badge-warning', confirmed: 'badge-info', cancelled: 'badge-error', completed: 'badge-success'
  };
  const statusLabels: Record<string, string> = {
    pending: 'Pendiente', confirmed: 'Confirmada', cancelled: 'Cancelada', completed: 'Completada'
  };

  if (loading) return <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg text-brand-blue"></span></div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-brand-dark">Gestión de Reservas</h1>
        <span className="text-xs text-brand-dark/40 flex items-center gap-1 shrink-0">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Tiempo real
        </span>
      </div>

      {/* Filters */}
      <div className="card bg-brand-cream shadow-sm mb-6 border border-brand-beige">
        <div className="card-body p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <select className="select select-bordered bg-white text-brand-dark border-brand-brown/30 select-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="confirmed">Confirmada</option>
              <option value="cancelled">Cancelada</option>
              <option value="completed">Completada</option>
            </select>
            <select className="select select-bordered bg-white text-brand-dark border-brand-brown/30 select-sm" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="">Todos los tipos</option>
              <option value="tour">Tour</option>
              <option value="accommodation">Hospedaje</option>
            </select>
            <select className="select select-bordered bg-white text-brand-dark border-brand-brown/30 select-sm" value={payFilter} onChange={e => setPayFilter(e.target.value)}>
              <option value="">Todos los pagos</option>
              <option value="pending">Pago Pendiente</option>
              <option value="paid">Pagado</option>
              <option value="failed">Fallido</option>
              <option value="refunded">Reembolsado</option>
            </select>
            <span className="badge badge-lg bg-brand-blue text-white border-0 self-center">{filtered.length} reservas</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card bg-brand-cream shadow-md border border-brand-beige">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="bg-brand-beige/50">
                <tr className="text-brand-dark">
                  <th>ID</th>
                  <th>Usuario</th>
                  <th>Tipo</th>
                  <th>Detalle</th>
                  <th>Fecha</th>
                  <th>Pers.</th>
                  <th>Total</th>
                  <th>Promo</th>
                  <th>Estado</th>
                  <th>Pago</th>
                  <th>Método</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.id} className="hover">
                    <td className="text-xs font-mono text-brand-dark/60">{b.id?.slice(0, 8)}...</td>
                    <td className="text-sm text-brand-dark">
                      <div>{b.userName || 'Sin nombre'}</div>
                      <div className="text-xs text-brand-dark/40">{b.userEmail}</div>
                    </td>
                    <td><span className="badge badge-outline badge-sm border-brand-brown text-brand-dark">{b.type === 'tour' ? 'Tour' : 'Hospedaje'}</span></td>
                    <td className="text-sm text-brand-dark max-w-[150px] truncate">{b.tourTitle || b.accommodationName || b.tourId || b.accommodationId || '—'}</td>
                    <td className="text-sm text-brand-dark">{b.date?.toDate?.()?.toLocaleDateString() || 'N/A'}</td>
                    <td className="text-brand-dark">{b.participants || 1}</td>
                    <td className="font-semibold text-brand-blue">
                      ${b.totalPrice?.toLocaleString() || '0'}
                      {b.discount ? <span className="text-xs text-success block">-${b.discount.toLocaleString()}</span> : ''}
                    </td>
                    <td className="text-xs text-brand-dark/60">{b.promoCode || '—'}</td>
                    <td><span className={`badge ${statusColors[b.status]} badge-sm`}>{statusLabels[b.status]}</span></td>
                    <td>
                      {b.paymentStatus ? (
                        <span className={`badge ${PAY_STATUS_COLORS[b.paymentStatus]} badge-sm`}>
                          {PAY_STATUS_LABELS[b.paymentStatus]}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="text-xs text-brand-dark/60">{b.paymentMethod ? PAYMENT_LABELS[b.paymentMethod] || b.paymentMethod : '—'}</td>
                    <td>
                      <div className="flex flex-col gap-1">
                        <select
                          className="select select-bordered select-xs bg-white text-brand-dark border-brand-brown/30"
                          value={b.status}
                          onChange={e => updateStatus(b.id!, e.target.value as Booking['status'])}
                        >
                          <option value="pending">Pendiente</option>
                          <option value="confirmed">Confirmar</option>
                          <option value="cancelled">Cancelar</option>
                          <option value="completed">Completar</option>
                        </select>
                        {b.paymentMethod && (
                          <select
                            className="select select-bordered select-xs bg-white text-brand-dark border-brand-brown/30"
                            value={b.paymentStatus || 'pending'}
                            onChange={e => updatePaymentStatus(b.id!, e.target.value as PaymentStatus)}
                          >
                            <option value="pending">Pago Pendiente</option>
                            <option value="paid">Marcar Pagado</option>
                            <option value="failed">Marcar Fallido</option>
                            <option value="refunded">Reembolsar</option>
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="text-center py-8 text-brand-dark/60">No se encontraron reservas</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

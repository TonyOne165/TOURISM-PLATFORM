import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import type { Tour } from '../../types';

interface BookingProps {
  tour: Pick<Tour, 'id' | 'title' | 'price' | 'images'>;
  onSuccess: () => void;
  onError: (error: Error) => void;
  onAttempt?: () => void;
}

const Booking = ({ tour, onSuccess, onError, onAttempt }: BookingProps) => {
  const { user } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [date, setDate] = useState('');
  const [participants, setParticipants] = useState(1);
  const [notes, setNotes] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const totalPrice = tour.price * participants;
  const today = new Date().toISOString().split('T')[0];

  const handleAddToCart = () => {
    if (!user) { onAttempt?.(); return; }
    if (!date) return;
    addItem({
      type: 'tour',
      itemId: tour.id!,
      title: tour.title,
      image: tour.images?.[0] || '',
      price: tour.price,
      date,
      participants,
      notes,
    });
    navigate('/dashboard/cart');
  };

  const handleBookNow = () => {
    if (!user) { onAttempt?.(); return; }
    if (!date) return;
    addItem({
      type: 'tour',
      itemId: tour.id!,
      title: tour.title,
      image: tour.images?.[0] || '',
      price: tour.price,
      date,
      participants,
      notes,
    });
    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
      navigate('/dashboard/cart');
    }, 2000);
  };

  if (!user) {
    return (
      <div className="p-4 text-center bg-brand-beige rounded-lg">
        <p className="text-brand-dark/60 mb-2">Inicia sesión para reservar este tour</p>
        <button className="btn bg-brand-blue text-white hover:bg-brand-dark border-0 btn-sm" onClick={onAttempt}>Iniciar Sesión</button>
      </div>
    );
  }

  if (showConfirmation) {
    return (
      <div className="p-6 text-center bg-green-50 rounded-lg border border-green-200">
        <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="font-semibold text-green-700 text-lg">¡Reserva agregada!</p>
        <p className="text-green-600 text-sm mt-1">Redirigiendo al carrito...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-brand-dark">{tour.title}</h3>
        <p className="text-brand-blue font-bold">${tour.price.toLocaleString()} / persona</p>
      </div>

      <div className="form-control">
        <label className="label"><span className="label-text text-brand-dark">Fecha</span></label>
        <input type="date" className="input input-bordered w-full bg-white text-brand-dark border-brand-brown/30" value={date}
          onChange={e => setDate(e.target.value)} required min={today} />
        {!date && <span className="text-xs text-brand-brown mt-1">* Selecciona una fecha para continuar</span>}
      </div>

      <div className="form-control">
        <label className="label"><span className="label-text text-brand-dark">Participantes</span></label>
        <input type="number" className="input input-bordered w-full bg-white text-brand-dark border-brand-brown/30" value={participants}
          onChange={e => setParticipants(Math.max(1, parseInt(e.target.value) || 1))} min="1" max="20" />
      </div>

      <div className="form-control">
        <label className="label"><span className="label-text text-brand-dark">Notas (opcional)</span></label>
        <textarea className="textarea textarea-bordered bg-white text-brand-dark border-brand-brown/30" value={notes}
          onChange={e => setNotes(e.target.value)} placeholder="Requisitos especiales..." rows={2} />
      </div>

      {participants > 1 && (
        <div className="bg-brand-blue/10 border border-brand-blue/20 rounded-lg p-3">
          <span className="text-sm text-brand-dark">{participants} personas x ${tour.price.toLocaleString()} = <strong className="text-brand-blue">${totalPrice.toLocaleString()}</strong></span>
        </div>
      )}

      <div className="space-y-2">
        <button className="btn bg-brand-blue text-white hover:bg-brand-dark border-0 w-full" onClick={handleBookNow} disabled={!date}>
          Reservar Ahora — ${totalPrice.toLocaleString()}
        </button>
        <button className="btn btn-outline border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white w-full" onClick={handleAddToCart} disabled={!date}>
          Agregar al Carrito
        </button>
      </div>
    </div>
  );
};

export { Booking };

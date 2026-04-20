import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, COLLECTIONS } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../hooks/useCart';
import { useReviews } from '../hooks/useReviews';
import { TourMap } from '../components/map/TourMap';
import type { Accommodation, Review } from '../types';

const AccommodationDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { getReviewsByAccommodation, createReview } = useReviews();
  const [accommodation, setAccommodation] = useState<Accommodation | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingEndDate, setBookingEndDate] = useState('');
  const [guests, setGuests] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetch = async () => {
      try {
        const q = query(collection(db, COLLECTIONS.ACCOMMODATIONS), where('slug', '==', slug));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const data = { id: snap.docs[0].id, ...snap.docs[0].data() } as Accommodation;
          setAccommodation(data);
          const r = await getReviewsByAccommodation(data.id!);
          setReviews(r);
        }
      } finally { setLoading(false); }
    };
    fetch();
  }, [slug]);

  const nights = bookingEndDate && bookingDate
    ? Math.max(1, Math.ceil((new Date(bookingEndDate).getTime() - new Date(bookingDate).getTime()) / 86400000))
    : 1;
  const totalPrice = accommodation ? accommodation.pricePerNight * nights : 0;

  const handleAddToCart = () => {
    if (!accommodation || !bookingDate) return;
    addItem({
      type: 'accommodation',
      itemId: accommodation.id!,
      title: accommodation.name,
      image: accommodation.images?.[0] || '',
      price: totalPrice,
      date: bookingDate,
      endDate: bookingEndDate,
      participants: guests,
    });
    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
      navigate('/dashboard/cart');
    }, 2000);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accommodation) return;
    await createReview({
      ...reviewForm,
      accommodationId: accommodation.id,
      accommodationName: accommodation.name,
      type: 'accommodation',
    });
    const updated = await getReviewsByAccommodation(accommodation.id!);
    setReviews(updated);
    setReviewForm({ rating: 5, comment: '' });
    setShowReviewForm(false);
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen bg-brand-cream"><span className="loading loading-spinner loading-lg text-brand-blue"></span></div>;
  if (!accommodation) return <div className="min-h-screen p-4 bg-brand-cream"><div className="alert alert-error">Hospedaje no encontrado</div></div>;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 pt-20 sm:pt-24 bg-brand-cream min-h-screen">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="badge badge-outline border-brand-brown text-brand-dark">{accommodation.type}</span>
          {accommodation.featured && <span className="badge bg-brand-brown text-white border-0">Destacado</span>}
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-brand-dark">{accommodation.name}</h1>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm sm:text-base text-brand-dark/60">
          <span className="flex items-center gap-1"><span className="text-yellow-500">★</span> {accommodation.rating.toFixed(1)} ({accommodation.reviewCount} reseñas)</span>
          <span>{accommodation.address}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Gallery */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8">
            {accommodation.images.map((img, i) => (
              <img key={i} src={img} alt={`${accommodation.name} ${i + 1}`}
                className="w-full h-48 sm:h-64 object-cover rounded-lg shadow-md" />
            ))}
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-brand-dark">Descripción</h2>
            <p className="text-brand-dark/80">{accommodation.description}</p>
          </div>

          {/* Amenities */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-brand-dark">Amenidades</h2>
            <div className="flex flex-wrap gap-2">
              {accommodation.amenities.map(a => (
                <span key={a} className="badge badge-lg badge-outline border-brand-brown text-brand-dark">{a}</span>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="card bg-brand-beige"><div className="card-body p-3 text-center">
              <p className="text-sm text-brand-dark/60">Habitaciones</p><p className="font-bold text-brand-dark">{accommodation.rooms}</p>
            </div></div>
            <div className="card bg-brand-beige"><div className="card-body p-3 text-center">
              <p className="text-sm text-brand-dark/60">Máx. Huéspedes</p><p className="font-bold text-brand-dark">{accommodation.maxGuests}</p>
            </div></div>
            <div className="card bg-brand-beige"><div className="card-body p-3 text-center">
              <p className="text-sm text-brand-dark/60">Check-in</p><p className="font-bold text-brand-dark">{accommodation.checkInTime}</p>
            </div></div>
            <div className="card bg-brand-beige"><div className="card-body p-3 text-center">
              <p className="text-sm text-brand-dark/60">Check-out</p><p className="font-bold text-brand-dark">{accommodation.checkOutTime}</p>
            </div></div>
          </div>

          {/* Map */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-brand-dark">Ubicación</h2>
            <TourMap coords={accommodation.coords} title={accommodation.name} price={accommodation.pricePerNight} zoom={14} />
          </div>

          {/* Reviews */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-brand-dark">Reseñas ({reviews.length})</h2>
              {user && <button className="btn bg-brand-blue text-white hover:bg-brand-dark border-0 btn-sm" onClick={() => setShowReviewForm(!showReviewForm)}>
                {showReviewForm ? 'Cancelar' : 'Escribir Reseña'}
              </button>}
            </div>
            {showReviewForm && (
              <form onSubmit={handleSubmitReview} className="card bg-brand-beige p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-brand-dark">Tu calificación:</span>
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: s })}
                      className={`text-2xl ${s <= reviewForm.rating ? 'text-yellow-500' : 'text-brand-brown/40'}`}>★</button>
                  ))}
                </div>
                <textarea className="textarea textarea-bordered w-full mb-3 bg-white text-brand-dark border-brand-brown/30" placeholder="Tu comentario..."
                  value={reviewForm.comment} onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })} required />
                <button type="submit" className="btn bg-brand-blue text-white hover:bg-brand-dark border-0 btn-sm">Enviar Reseña</button>
              </form>
            )}
            <div className="space-y-3">
              {reviews.map(r => (
                <div key={r.id} className="bg-brand-beige p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-brand-dark">{r.userName}</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(s => (
                        <span key={s} className={`text-sm ${s <= r.rating ? 'text-yellow-500' : 'text-brand-brown/40'}`}>★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-brand-dark/80">{r.comment}</p>
                  <p className="text-xs text-brand-dark/40 mt-1">{r.createdAt.toDate().toLocaleDateString()}</p>
                </div>
              ))}
              {reviews.length === 0 && <p className="text-brand-dark/60 text-center py-4">No hay reseñas aún</p>}
            </div>
          </div>
        </div>

        {/* Booking Sidebar */}
        <div>
          <div className="sticky top-20 card bg-brand-beige shadow-lg">
            <div className="card-body">
              {showConfirmation ? (
                <div className="p-6 text-center bg-green-50 rounded-lg border border-green-200">
                  <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="font-semibold text-green-700 text-lg">¡Reserva agregada!</p>
                  <p className="text-green-600 text-sm mt-1">Redirigiendo al carrito...</p>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-brand-blue">${accommodation.pricePerNight}</span>
                    <span className="text-brand-dark/60">/noche</span>
                  </div>
                  <div className="space-y-3">
                    <div className="form-control">
                      <label className="label"><span className="label-text text-brand-dark">Check-in</span></label>
                      <input type="date" className="input input-bordered bg-white text-brand-dark border-brand-brown/30" value={bookingDate}
                        onChange={e => setBookingDate(e.target.value)} min={today} />
                      {!bookingDate && <span className="text-xs text-brand-brown mt-1">* Selecciona una fecha</span>}
                    </div>
                    <div className="form-control">
                      <label className="label"><span className="label-text text-brand-dark">Check-out</span></label>
                      <input type="date" className="input input-bordered bg-white text-brand-dark border-brand-brown/30" value={bookingEndDate}
                        onChange={e => setBookingEndDate(e.target.value)} min={bookingDate || today} />
                    </div>
                    <div className="form-control">
                      <label className="label"><span className="label-text text-brand-dark">Huéspedes</span></label>
                      <input type="number" className="input input-bordered bg-white text-brand-dark border-brand-brown/30" value={guests}
                        onChange={e => setGuests(parseInt(e.target.value))} min="1" max={accommodation.maxGuests} />
                    </div>
                  </div>

                  {bookingEndDate && bookingDate && (
                    <div className="bg-brand-blue/10 border border-brand-blue/20 rounded-lg p-3 mt-3">
                      <span className="text-sm text-brand-dark">
                        {nights} noche{nights > 1 ? 's' : ''} x ${accommodation.pricePerNight.toLocaleString()} = <strong className="text-brand-blue">${totalPrice.toLocaleString()}</strong>
                      </span>
                    </div>
                  )}

                  {user ? (
                    <button className="btn bg-brand-blue text-white hover:bg-brand-dark border-0 w-full mt-4" onClick={handleAddToCart} disabled={!bookingDate}>
                      Reservar — ${totalPrice.toLocaleString()}
                    </button>
                  ) : (
                    <div className="mt-4 text-center">
                      <p className="text-sm text-brand-dark/60 mb-2">Inicia sesión para reservar</p>
                      <button className="btn bg-brand-blue text-white hover:bg-brand-dark border-0 btn-sm" onClick={() => navigate('/login')}>Iniciar Sesión</button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccommodationDetail;

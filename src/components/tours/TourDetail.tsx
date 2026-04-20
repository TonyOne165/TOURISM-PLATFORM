import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { COLLECTIONS } from '../../utils/constants';
import { Booking } from '../booking/Booking';
import { TourMap } from '../map/TourMap';
import { useAuth } from '../../hooks/useAuth';
import { useReviews } from '../../hooks/useReviews';
import type { Tour, Review } from '../../types';

interface TourDetailProps {
  onBookingAttempt?: () => void;
}

const TourDetail: React.FC<TourDetailProps> = ({ onBookingAttempt }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getReviewsByTour, createReview } = useReviews();
  const [tour, setTour] = useState<Tour | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const toursRef = collection(db, COLLECTIONS.TOURS);
        const q = query(toursRef, where('slug', '==', slug));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) { setError('Tour no encontrado'); return; }

        const tourData = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as Tour;
        setTour(tourData);

        // Fetch reviews separately so a failure doesn't block the tour detail
        try {
          const r = await getReviewsByTour(tourData.id!);
          setReviews(r);
        } catch (reviewErr) {
          console.warn('Error loading reviews (may need Firestore composite index):', reviewErr);
          // Try fallback without orderBy
          try {
            const reviewsRef = collection(db, COLLECTIONS.REVIEWS);
            const fallbackQ = query(reviewsRef, where('tourId', '==', tourData.id));
            const reviewSnapshot = await getDocs(fallbackQ);
            const fallbackReviews = reviewSnapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Review[];
            fallbackReviews.sort((a, b) => {
              const aTime = a.createdAt?.toMillis?.() || 0;
              const bTime = b.createdAt?.toMillis?.() || 0;
              return bTime - aTime;
            });
            setReviews(fallbackReviews);
          } catch {
            console.warn('Could not load reviews, showing tour without them');
            setReviews([]);
          }
        }
      } catch (err) {
        console.error('Error fetching tour:', err);
        setError('Error al cargar los detalles del tour');
      } finally {
        setLoading(false);
      }
    };
    fetchTour();
  }, [slug]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tour) return;
    if (!reviewForm.comment.trim()) {
      setReviewError('Por favor escribe un comentario');
      return;
    }
    if (reviewForm.rating < 1 || reviewForm.rating > 5) {
      setReviewError('La calificación debe ser entre 1 y 5');
      return;
    }
    setReviewSubmitting(true);
    setReviewError(null);
    setReviewSuccess(false);
    try {
      await createReview({
        ...reviewForm,
        comment: reviewForm.comment.trim(),
        tourId: tour.id,
        tourTitle: tour.title,
        type: 'tour',
      });
      setReviewSuccess(true);
      setReviewForm({ rating: 5, comment: '' });
      setTimeout(() => {
        setShowReviewForm(false);
        setReviewSuccess(false);
      }, 2000);
      // Refresh reviews
      try {
        const updated = await getReviewsByTour(tour.id!);
        setReviews(updated);
      } catch {
        // Non-blocking: review was created, just can't refresh list
      }
    } catch (err: any) {
      console.error('Error submitting review:', err);
      setReviewError(err?.message || 'Error al enviar la reseña. Intenta de nuevo.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen bg-brand-cream"><span className="loading loading-spinner loading-lg text-brand-blue"></span></div>;
  if (error || !tour) return <div className="min-h-screen p-4 bg-brand-cream"><div className="alert alert-error"><span>{error || 'Tour no encontrado'}</span></div></div>;

  const allReviews = [...(tour.reviews || []), ...reviews];

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 bg-brand-cream min-h-screen">
      {/* Tour Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 text-brand-dark">{tour.title}</h1>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm sm:text-base text-brand-dark/60">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {tour.duration}
          </span>
          <span className="flex items-center gap-1">
            <span className="text-yellow-500">★</span> {tour.rating.toFixed(1)} ({allReviews.length} reseñas)
          </span>
          {tour.category && <span className="badge badge-outline border-brand-brown text-brand-dark">{tour.category}</span>}
          {tour.difficulty && (
            <span className={`badge ${tour.difficulty === 'easy' ? 'badge-success' : tour.difficulty === 'moderate' ? 'badge-warning' : 'badge-error'}`}>
              {tour.difficulty === 'easy' ? 'Fácil' : tour.difficulty === 'moderate' ? 'Moderado' : 'Difícil'}
            </span>
          )}
          <span className="text-brand-blue font-bold text-xl">${tour.price.toLocaleString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Image Gallery */}
          {tour.images.length > 0 && (
            <div className="mb-8">
              <img
                src={tour.images[selectedImage]}
                alt={tour.title}
                className="w-full h-56 sm:h-72 lg:h-96 object-cover rounded-xl shadow-lg mb-3"
              />
              {tour.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {tour.images.map((img, i) => (
                    <img key={i} src={img} alt={`${tour.title} ${i + 1}`}
                      className={`w-14 h-14 sm:w-20 sm:h-20 object-cover rounded-lg cursor-pointer transition ${selectedImage === i ? 'ring-2 ring-brand-blue' : 'opacity-60 hover:opacity-100'}`}
                      onClick={() => setSelectedImage(i)} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-brand-dark">Acerca de este Tour</h2>
            <p className="text-brand-dark/80 leading-relaxed">{tour.description}</p>
          </div>

          {/* Includes */}
          {tour.includes && tour.includes.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-brand-dark">Incluye</h2>
              <div className="flex flex-wrap gap-2">
                {tour.includes.map(item => (
                  <span key={item} className="badge badge-lg badge-outline border-brand-brown text-brand-dark gap-1">✓ {item}</span>
                ))}
              </div>
            </div>
          )}

          {/* Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {tour.maxParticipants && (
              <div className="card bg-brand-beige"><div className="card-body p-3 text-center">
                <p className="text-sm text-brand-dark/60">Máx. Personas</p><p className="font-bold text-brand-dark">{tour.maxParticipants}</p>
              </div></div>
            )}
            {tour.meetingPoint && (
              <div className="card bg-brand-beige col-span-2"><div className="card-body p-3 text-center">
                <p className="text-sm text-brand-dark/60">Punto de Encuentro</p><p className="font-bold text-brand-dark">{tour.meetingPoint}</p>
              </div></div>
            )}
          </div>

          {/* Map */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-brand-dark">Ubicación</h2>
            <TourMap coords={tour.coords} title={tour.title} price={tour.price} zoom={14} />
          </div>

          {/* Reviews */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-brand-dark">Reseñas ({allReviews.length})</h2>
              {user && (
                <button className="btn bg-brand-blue text-white hover:bg-brand-dark border-0 btn-sm" onClick={() => setShowReviewForm(!showReviewForm)}>
                  {showReviewForm ? 'Cancelar' : 'Escribir Reseña'}
                </button>
              )}
            </div>

            {showReviewForm && (
              <form onSubmit={handleSubmitReview} className="card bg-brand-beige p-4 mb-4">
                {reviewSuccess && (
                  <div className="alert alert-success mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>¡Reseña enviada exitosamente!</span>
                  </div>
                )}
                {reviewError && (
                  <div className="alert alert-error mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>{reviewError}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-brand-dark">Tu calificación:</span>
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: s })}
                      className={`text-2xl ${s <= reviewForm.rating ? 'text-yellow-500' : 'text-brand-brown/40'}`}>★</button>
                  ))}
                </div>
                <textarea className="textarea textarea-bordered w-full mb-3 bg-white text-brand-dark border-brand-brown/30" placeholder="Tu comentario..."
                  value={reviewForm.comment} onChange={e => { setReviewForm({ ...reviewForm, comment: e.target.value }); setReviewError(null); }} required minLength={3} />
                <button type="submit" className="btn bg-brand-blue text-white hover:bg-brand-dark border-0 btn-sm" disabled={reviewSubmitting}>
                  {reviewSubmitting ? <><span className="loading loading-spinner loading-sm"></span> Enviando...</> : 'Enviar Reseña'}
                </button>
              </form>
            )}

            <div className="space-y-4">
              {allReviews.map((review, idx) => (
                <div key={review.id || idx} className="bg-brand-beige p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {review.userPhoto && <img src={review.userPhoto} alt="" className="w-8 h-8 rounded-full" />}
                      <span className="font-semibold text-brand-dark">{review.userName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(s => (
                        <span key={s} className={`text-sm ${s <= review.rating ? 'text-yellow-500' : 'text-brand-brown/40'}`}>★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-brand-dark/80">{review.comment}</p>
                  <span className="text-xs text-brand-dark/40">
                    {review.createdAt?.toDate?.()?.toLocaleDateString() || ''}
                  </span>
                </div>
              ))}
              {allReviews.length === 0 && <p className="text-center text-brand-dark/60 py-4">No hay reseñas aún. Sé el primero!</p>}
            </div>
          </div>
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <div className="bg-brand-beige p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4 text-brand-dark">Reservar este Tour</h3>
              <Booking
                tour={tour}
                onSuccess={() => navigate('/dashboard')}
                onError={(err) => console.error('Booking error:', err)}
                onAttempt={onBookingAttempt}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetail;

import { useState, useEffect } from 'react';
import { useReviews } from '../../hooks/useReviews';
import type { Review } from '../../types';

export const UserReviews = () => {
  const { getUserReviews, deleteReview, loading } = useReviews();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoadingData(true);
      setReviews(await getUserReviews());
      setLoadingData(false);
    };
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta reseña?')) return;
    await deleteReview(id);
    setReviews(prev => prev.filter(r => r.id !== id));
  };

  if (loadingData) return <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg text-primary"></span></div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Mis Reseñas y Calificaciones</h1>

      <p className="text-base-content/60 mb-4">{reviews.length} reseña(s) escrita(s)</p>

      {reviews.length === 0 ? (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body text-center">
            <p className="text-base-content/60">No has escrito ninguna reseña aún</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r.id} className="card bg-base-100 shadow-md">
              <div className="card-body p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="badge badge-outline badge-sm">{r.type === 'tour' ? 'Tour' : 'Hospedaje'}</span>
                      <h3 className="font-semibold">{r.tourTitle || r.accommodationName || 'Reseña'}</h3>
                    </div>
                    <div className="flex items-center gap-1 my-2">
                      {[1, 2, 3, 4, 5].map(s => (
                        <span key={s} className={`text-lg ${s <= r.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                      ))}
                      <span className="text-sm ml-1">({r.rating}/5)</span>
                    </div>
                    <p className="text-base-content/80">{r.comment}</p>
                    <p className="text-xs text-base-content/40 mt-2">{r.createdAt.toDate().toLocaleDateString()}</p>
                  </div>
                  <button className="btn btn-ghost btn-sm text-error" onClick={() => handleDelete(r.id!)}>Eliminar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db, COLLECTIONS } from '../../services/firebase';
import type { Review } from '../../types';

export const AdminReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('');
  const [filterTarget, setFilterTarget] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        let snapshot;
        try {
          snapshot = await getDocs(query(collection(db, COLLECTIONS.REVIEWS), orderBy('createdAt', 'desc')));
        } catch {
          snapshot = await getDocs(collection(db, COLLECTIONS.REVIEWS));
        }
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Review[];
        data.sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() || 0;
          const bTime = b.createdAt?.toMillis?.() || 0;
          return bTime - aTime;
        });
        setReviews(data);
      } catch (err) {
        console.error('Error loading reviews:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta reseña?')) return;
    try {
      await deleteDoc(doc(db, COLLECTIONS.REVIEWS, id));
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Error deleting review:', err);
    }
  };

  // Build unique filter targets
  const targets = Array.from(new Set(
    reviews.map(r => r.type === 'tour' ? r.tourTitle || r.tourId || '' : r.accommodationName || r.accommodationId || '')
  )).filter(Boolean).sort();

  // Filter
  const filtered = reviews.filter(r => {
    if (filterType && r.type !== filterType) return false;
    if (filterTarget) {
      const name = r.type === 'tour' ? (r.tourTitle || r.tourId || '') : (r.accommodationName || r.accommodationId || '');
      if (name !== filterTarget) return false;
    }
    return true;
  });

  // Analytics
  const totalCount = filtered.length;
  const avgRating = totalCount > 0 ? filtered.reduce((s, r) => s + r.rating, 0) / totalCount : 0;
  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: filtered.filter(r => r.rating === star).length,
  }));

  if (loading) {
    return <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Reseñas</h1>
        <span className="badge badge-lg badge-primary">{reviews.length} reseña(s) total</span>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card bg-blue-50 shadow-sm">
          <div className="card-body p-4 text-center">
            <p className="text-sm text-base-content/60">Total Reseñas</p>
            <p className="text-3xl font-bold text-blue-600">{totalCount}</p>
          </div>
        </div>
        <div className="card bg-yellow-50 shadow-sm">
          <div className="card-body p-4 text-center">
            <p className="text-sm text-base-content/60">Rating Promedio</p>
            <p className="text-3xl font-bold text-yellow-600">{avgRating.toFixed(1)} <span className="text-lg">/ 5</span></p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-4">
            <p className="text-sm text-base-content/60 mb-2">Distribución</p>
            {ratingDistribution.map(d => {
              const pct = totalCount > 0 ? (d.count / totalCount) * 100 : 0;
              return (
                <div key={d.star} className="flex items-center gap-2 text-xs">
                  <span className="w-6 text-right">{d.star}★</span>
                  <div className="flex-1 bg-base-200 rounded-full h-3">
                    <div className="bg-yellow-400 rounded-full h-3" style={{ width: `${Math.max(pct, 2)}%` }} />
                  </div>
                  <span className="w-8 text-right">{d.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card bg-base-100 shadow-sm mb-6">
        <div className="card-body p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <select className="select select-bordered w-full sm:w-48" value={filterType} onChange={e => { setFilterType(e.target.value); setFilterTarget(''); }}>
              <option value="">Todos los tipos</option>
              <option value="tour">Tours</option>
              <option value="accommodation">Hospedajes</option>
            </select>
            <select className="select select-bordered flex-1" value={filterTarget} onChange={e => setFilterTarget(e.target.value)}>
              <option value="">Todos</option>
              {targets.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {filtered.length === 0 ? (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body text-center text-base-content/60">No se encontraron reseñas</div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <div key={r.id} className="card bg-base-100 shadow-sm">
              <div className="card-body p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`badge badge-sm ${r.type === 'tour' ? 'badge-primary' : 'badge-secondary'}`}>
                        {r.type === 'tour' ? 'Tour' : 'Hospedaje'}
                      </span>
                      <span className="font-semibold text-sm">{r.tourTitle || r.accommodationName || 'Sin nombre'}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      {r.userPhoto && <img src={r.userPhoto} alt="" className="w-6 h-6 rounded-full" />}
                      <span className="text-sm text-base-content/70">{r.userName}</span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <span key={s} className={`text-sm ${s <= r.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                        ))}
                      </div>
                      <span className="text-xs text-base-content/40">({r.rating}/5)</span>
                    </div>
                    <p className="text-sm text-base-content/80">{r.comment}</p>
                    <p className="text-xs text-base-content/40 mt-1">{r.createdAt?.toDate?.()?.toLocaleDateString() || ''}</p>
                  </div>
                  <button className="btn btn-ghost btn-sm text-error" onClick={() => handleDelete(r.id!)}>
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

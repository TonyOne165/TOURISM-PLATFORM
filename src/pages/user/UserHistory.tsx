import { useState, useEffect } from 'react';
import { useVisitedDestinations } from '../../hooks/useVisitedDestinations';
import type { VisitedDestination } from '../../types';

export const UserHistory = () => {
  const { getUserVisited, loading } = useVisitedDestinations();
  const [destinations, setDestinations] = useState<VisitedDestination[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        setDestinations(await getUserVisited());
      } catch (err) {
        console.error('Error loading history:', err);
        setError('No se pudo cargar el historial de viajes.');
      }
    };
    load();
  }, []);

  const uniqueDestinations = new Set(destinations.map(d => d.tourId)).size;
  const categories = [...new Set(destinations.map(d => d.tourCategory).filter(Boolean))];

  if (loading) return <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg text-primary"></span></div>;

  if (error) return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Historial de Viajes</h1>
      <div className="alert alert-error"><span>{error}</span></div>
    </div>
  );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Historial de Viajes</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card bg-base-100 shadow-sm"><div className="card-body p-4 text-center">
          <p className="text-2xl font-bold text-primary">{destinations.length}</p>
          <p className="text-sm text-base-content/60">Total Viajes</p>
        </div></div>
        <div className="card bg-base-100 shadow-sm"><div className="card-body p-4 text-center">
          <p className="text-2xl font-bold text-secondary">{uniqueDestinations}</p>
          <p className="text-sm text-base-content/60">Destinos Únicos</p>
        </div></div>
        <div className="card bg-base-100 shadow-sm"><div className="card-body p-4 text-center">
          <p className="text-2xl font-bold text-accent">{categories.length}</p>
          <p className="text-sm text-base-content/60">Categorías Exploradas</p>
        </div></div>
      </div>

      {destinations.length === 0 ? (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body text-center">
            <p className="text-base-content/60">Aún no has visitado ningún destino. Empieza a explorar!</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {destinations.map(d => (
            <div key={d.id} className="card bg-base-100 shadow-md">
              <div className="card-body p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{d.tourTitle}</h3>
                    <div className="flex flex-wrap gap-3 mt-1">
                      {d.tourCategory && <span className="badge badge-outline badge-sm">{d.tourCategory}</span>}
                      <span className="text-sm text-base-content/60">{d.visitDate?.toDate?.()?.toLocaleDateString?.() || 'Fecha no disponible'}</span>
                    </div>
                    {d.notes && <p className="text-sm mt-2 text-base-content/60">{d.notes}</p>}
                  </div>
                  {d.rating && (
                    <div className="text-right">
                      <span className="text-xl font-bold text-yellow-500">{d.rating}/5</span>
                      <p className="text-xs text-base-content/60">Tu rating</p>
                    </div>
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

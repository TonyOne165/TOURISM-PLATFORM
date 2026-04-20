import { useState, useEffect } from 'react';
import { useVisitedDestinations } from '../../hooks/useVisitedDestinations';
import type { VisitedDestination } from '../../types';

export const AdminVisited = () => {
  const { getAllVisited, loading } = useVisitedDestinations();
  const [destinations, setDestinations] = useState<VisitedDestination[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    const load = async () => { setDestinations(await getAllVisited()); };
    load();
  }, []);

  const filtered = destinations.filter(d =>
    !categoryFilter || d.tourCategory === categoryFilter
  );

  // Stats
  const uniqueUsers = new Set(destinations.map(d => d.userId)).size;
  const uniqueTours = new Set(destinations.map(d => d.tourId)).size;
  const categories = [...new Set(destinations.map(d => d.tourCategory).filter(Boolean))];

  // Most visited
  const tourCounts: Record<string, { title: string; count: number }> = {};
  destinations.forEach(d => {
    if (!tourCounts[d.tourId]) tourCounts[d.tourId] = { title: d.tourTitle, count: 0 };
    tourCounts[d.tourId].count++;
  });
  const topDestinations = Object.values(tourCounts).sort((a, b) => b.count - a.count).slice(0, 5);

  if (loading) return <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg text-primary"></span></div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Historial de Destinos Visitados</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card bg-base-100 shadow-sm"><div className="card-body p-4 text-center">
          <p className="text-3xl font-bold text-primary">{destinations.length}</p><p className="text-sm text-base-content/60">Total Visitas</p>
        </div></div>
        <div className="card bg-base-100 shadow-sm"><div className="card-body p-4 text-center">
          <p className="text-3xl font-bold text-secondary">{uniqueUsers}</p><p className="text-sm text-base-content/60">Usuarios Únicos</p>
        </div></div>
        <div className="card bg-base-100 shadow-sm"><div className="card-body p-4 text-center">
          <p className="text-3xl font-bold text-accent">{uniqueTours}</p><p className="text-sm text-base-content/60">Destinos Únicos</p>
        </div></div>
      </div>

      {/* Top destinations */}
      {topDestinations.length > 0 && (
        <div className="card bg-base-100 shadow-md mb-6">
          <div className="card-body">
            <h2 className="card-title text-lg">Destinos Más Visitados</h2>
            <div className="space-y-2">
              {topDestinations.map((d, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="badge badge-lg badge-primary">#{i + 1}</span>
                    <span className="font-medium">{d.title}</span>
                  </div>
                  <span className="badge badge-outline">{d.count} visitas</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="mb-4">
        <select className="select select-bordered" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="">Todas las categorías</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card bg-base-100 shadow-md">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead><tr><th>Usuario</th><th>Destino</th><th>Categoría</th><th>Fecha</th><th>Rating</th><th>Notas</th></tr></thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d.id}>
                    <td className="text-sm">{d.userId.slice(0, 8)}...</td>
                    <td className="font-medium">{d.tourTitle}</td>
                    <td><span className="badge badge-outline badge-sm">{d.tourCategory || 'N/A'}</span></td>
                    <td className="text-sm">{d.visitDate.toDate().toLocaleDateString()}</td>
                    <td>{d.rating ? `${d.rating}/5 ⭐` : '-'}</td>
                    <td className="text-sm max-w-xs truncate">{d.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="text-center py-8 text-base-content/60">No hay registros</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

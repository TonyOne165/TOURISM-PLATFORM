import { useState, useEffect } from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';
import type { DashboardStats, Booking, User } from '../../types';

export const AdminReports = () => {
  const { getDashboardStats, getAllBookings, getAllUsers } = useAnalytics();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [s, b, u] = await Promise.all([getDashboardStats(), getAllBookings(), getAllUsers()]);
      setStats(s);
      setBookings(b);
      setUsers(u);
      setLoading(false);
    };
    load();
  }, []);

  const exportCSV = (data: Record<string, unknown>[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(h => {
        const val = row[h];
        const str = val instanceof Object && 'toDate' in (val as Record<string, unknown>)
          ? (val as { toDate: () => Date }).toDate().toISOString()
          : String(val ?? '');
        return `"${str.replace(/"/g, '""')}"`;
      }).join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) return <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg text-primary"></span></div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Reportes y Exportación</h1>

      {/* Export Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h3 className="card-title text-lg">Reporte de Reservas</h3>
            <p className="text-sm text-base-content/60">{bookings.length} reservas totales</p>
            <button className="btn btn-primary btn-sm mt-2" onClick={() => exportCSV(
              bookings.map(b => ({
                id: b.id, usuario: b.userName || b.userId, tipo: b.type,
                tour: b.tourTitle || b.tourId || '', hospedaje: b.accommodationName || b.accommodationId || '',
                fecha: b.date, estado: b.status, participantes: b.participants || 1,
                total: b.totalPrice || 0, creado: b.createdAt,
              })), 'reservas'
            )}>Exportar CSV</button>
          </div>
        </div>

        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h3 className="card-title text-lg">Reporte de Usuarios</h3>
            <p className="text-sm text-base-content/60">{users.length} usuarios registrados</p>
            <button className="btn btn-primary btn-sm mt-2" onClick={() => exportCSV(
              users.map(u => ({
                uid: u.uid, nombre: u.displayName || '', email: u.email || '',
                rol: u.role, bloqueado: u.blocked ? 'Sí' : 'No', registro: u.createdAt,
              })), 'usuarios'
            )}>Exportar CSV</button>
          </div>
        </div>

        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h3 className="card-title text-lg">Reporte de Analytics</h3>
            <p className="text-sm text-base-content/60">Resumen general de la plataforma</p>
            <button className="btn btn-primary btn-sm mt-2" onClick={() => {
              if (!stats) return;
              exportCSV([{
                total_usuarios: stats.totalUsers, usuarios_activos: stats.activeUsers,
                total_reservas: stats.totalBookings, ingresos_totales: stats.totalRevenue,
                pendientes: stats.pendingBookings, completadas: stats.completedBookings,
                tours: stats.totalTours, hospedajes: stats.totalAccommodations,
                rating_promedio: stats.averageRating.toFixed(2),
              }], 'analytics');
            }}>Exportar CSV</button>
          </div>
        </div>
      </div>

      {/* Summary */}
      {stats && (
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h2 className="card-title text-lg">Resumen General</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-base-200 rounded-lg">
                <p className="text-2xl font-bold text-primary">${stats.totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-base-content/60">Ingresos Totales</p>
              </div>
              <div className="text-center p-4 bg-base-200 rounded-lg">
                <p className="text-2xl font-bold text-secondary">{stats.totalBookings}</p>
                <p className="text-sm text-base-content/60">Reservas Totales</p>
              </div>
              <div className="text-center p-4 bg-base-200 rounded-lg">
                <p className="text-2xl font-bold text-accent">{stats.totalUsers}</p>
                <p className="text-sm text-base-content/60">Usuarios</p>
              </div>
              <div className="text-center p-4 bg-base-200 rounded-lg">
                <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)} ⭐</p>
                <p className="text-sm text-base-content/60">Rating Promedio</p>
              </div>
            </div>

            {/* Revenue chart */}
            {stats.revenueByMonth.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-3">Tendencia de Ingresos</h3>
                <div className="space-y-2">
                  {stats.revenueByMonth.map(e => {
                    const max = Math.max(...stats.revenueByMonth.map(x => x.revenue));
                    const pct = max > 0 ? (e.revenue / max) * 100 : 0;
                    return (
                      <div key={e.month} className="flex items-center gap-3">
                        <span className="w-20 text-sm">{e.month}</span>
                        <div className="flex-1 bg-base-200 rounded-full h-5">
                          <div className="bg-primary rounded-full h-5 flex items-center justify-end pr-2" style={{ width: `${Math.max(pct, 8)}%` }}>
                            <span className="text-xs text-primary-content">${e.revenue.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

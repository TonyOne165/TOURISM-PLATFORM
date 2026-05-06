import { useState, useEffect } from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';
import type { DashboardStats, Booking } from '../../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import type { ValueType } from 'recharts/types/component/DefaultTooltipContent';

const COLORS = ['#f59e0b', '#3b82f6', '#ef4444', '#10b981'];

export const AdminDashboard = () => {
  const { getDashboardStats, getRecentBookings, loading } = useAnalytics();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, b] = await Promise.all([getDashboardStats(), getRecentBookings(5)]);
        setStats(s);
        setRecentBookings(b);
      } catch (err) {
        console.error('Error loading dashboard:', err);
        setError('Error al cargar estadísticas.');
      }
    };
    load();
  }, []);

  if (loading || (!stats && !error)) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="alert alert-error"><span>{error}</span></div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { label: 'Usuarios Totales', value: stats.totalUsers, icon: '👥', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Usuarios Activos', value: stats.activeUsers, icon: '🟢', color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Reservas Totales', value: stats.totalBookings, icon: '📋', color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Ingresos Totales', value: `$${stats.totalRevenue.toLocaleString()}`, icon: '💰', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Reservas Pendientes', value: stats.pendingBookings, icon: '⏳', color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Completadas', value: stats.completedBookings, icon: '✅', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Tours Activos', value: stats.totalTours, icon: '🏝️', color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { label: 'Hospedajes', value: stats.totalAccommodations, icon: '🏨', color: 'text-pink-600', bg: 'bg-pink-50' },
  ];

  const statusLabels: Record<string, string> = {
    pending: 'Pendiente', confirmed: 'Confirmada',
    cancelled: 'Cancelada', completed: 'Completada'
  };

  const pieData = stats.bookingsByStatus.map(item => ({
    name: statusLabels[item.status] || item.status,
    value: item.count,
  }));

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(card => (
          <div key={card.label} className={`card ${card.bg} shadow-sm min-w-0`}>
            <div className="card-body p-4 min-w-0">
              <div className="flex items-center justify-between min-w-0 gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-base-content/60 truncate">{card.label}</p>
                  <p className={`text-2xl font-bold ${card.color} truncate`}>{card.value}</p>
                </div>
                <span className="text-3xl shrink-0">{card.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Month - Bar Chart */}
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h2 className="card-title text-lg">Ingresos por Mes</h2>
            {stats.revenueByMonth.length === 0 ? (
              <p className="text-base-content/60">No hay datos disponibles</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stats.revenueByMonth.slice(-6)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: ValueType) => [`$${(value as number)?.toLocaleString() ?? 0}`, 'Ingresos']} />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Bookings by Status - Pie Chart */}
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h2 className="card-title text-lg">Reservas por Estado</h2>
            {pieData.length === 0 ? (
              <p className="text-base-content/60">No hay datos disponibles</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Users / Bookings over time - Line Chart */}
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h2 className="card-title text-lg">Tendencia de Reservas</h2>
            {stats.revenueByMonth.length === 0 ? (
              <p className="text-base-content/60">No hay datos disponibles</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={stats.revenueByMonth.slice(-6)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: ValueType) => [`$${(value as number)?.toLocaleString() ?? 0}`, 'Ingresos']} />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Popular Tours */}
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h2 className="card-title text-lg">Tours Más Populares</h2>
            {stats.popularTours.length === 0 ? (
              <p className="text-base-content/60">No hay datos disponibles</p>
            ) : (
              <div className="space-y-3">
                {stats.popularTours.map((tour, idx) => (
                  <div key={tour.tourId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`badge badge-lg ${idx === 0 ? 'badge-primary' : idx === 1 ? 'badge-secondary' : 'badge-ghost'}`}>
                        #{idx + 1}
                      </span>
                      <span className="font-medium">{tour.title}</span>
                    </div>
                    <span className="badge badge-outline">{tour.bookings} reservas</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="card bg-base-100 shadow-md lg:col-span-2">
          <div className="card-body">
            <h2 className="card-title text-lg">Reservas Recientes</h2>
            {recentBookings.length === 0 ? (
              <p className="text-base-content/60">No hay reservas recientes</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-sm">
                  <thead>
                    <tr><th>Usuario</th><th>Tour</th><th>Estado</th><th>Precio</th></tr>
                  </thead>
                  <tbody>
                    {recentBookings.map(b => (
                      <tr key={b.id}>
                        <td className="text-sm">{b.userName || b.userId}</td>
                        <td className="text-sm">{b.tourTitle || b.tourId}</td>
                        <td>
                          <span className={`badge badge-sm ${
                            b.status === 'confirmed' ? 'badge-info' :
                            b.status === 'completed' ? 'badge-success' :
                            b.status === 'cancelled' ? 'badge-error' : 'badge-warning'
                          }`}>{statusLabels[b.status] || b.status}</span>
                        </td>
                        <td className="text-sm">${b.totalPrice?.toLocaleString() || '0'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

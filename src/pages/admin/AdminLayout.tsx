import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: '📊' },
  { path: '/admin/users', label: 'Usuarios', icon: '👥' },
  { path: '/admin/tours', label: 'Tours', icon: '🏝️' },
  { path: '/admin/accommodations', label: 'Hospedajes', icon: '🏨' },
  { path: '/admin/bookings', label: 'Reservas', icon: '📋' },
  { path: '/admin/promotions', label: 'Promociones', icon: '🎁' },
  { path: '/admin/reviews', label: 'Reseñas', icon: '⭐' },
  { path: '/admin/messages', label: 'Mensajes', icon: '✉️' },
  { path: '/admin/join-requests', label: 'Solicitudes', icon: '📩' },
  { path: '/admin/visited', label: 'Destinos Visitados', icon: '📍' },
  { path: '/admin/reports', label: 'Reportes', icon: '📄' },
  { path: '/admin/settings', label: 'Configuración', icon: '⚙️' },
];

export const AdminLayout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-brand-cream pt-16">
      {/* Mobile sidebar toggle */}
      <button
        className="lg:hidden fixed top-[4.5rem] left-4 z-50 btn btn-sm btn-circle bg-brand-blue text-white hover:bg-brand-dark border-0 shadow-lg"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 bg-brand-dark shadow-lg
          overflow-y-auto transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-4 border-b border-brand-brown/30">
            <h2 className="text-lg font-bold text-brand-blue">Panel Admin</h2>
            <p className="text-sm text-brand-cream/60">{user?.displayName || user?.email}</p>
          </div>
          <nav className="p-2">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors
                  ${location.pathname === item.path
                    ? 'bg-brand-blue text-white'
                    : 'hover:bg-brand-blue/10 text-brand-cream'
                  }`}
              >
                <span>{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-brand-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 p-4 lg:p-8 min-h-[calc(100vh-4rem)] min-w-0 w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

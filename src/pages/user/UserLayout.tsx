import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../hooks/useCart';

const navItems = [
  { path: '/dashboard', label: 'Mi Panel', icon: '🏠' },
  { path: '/dashboard/bookings', label: 'Mis Reservas', icon: '📋' },
  { path: '/dashboard/history', label: 'Historial de Viajes', icon: '📍' },
  { path: '/dashboard/reviews', label: 'Mis Reseñas', icon: '⭐' },
  { path: '/dashboard/messages', label: 'Mensajes', icon: '✉️' },
  { path: '/dashboard/cart', label: 'Carrito', icon: '🛒' },
  { path: '/dashboard/profile', label: 'Mi Perfil', icon: '👤' },
];

export const UserLayout = () => {
  const { user } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-brand-cream pt-16">
      <button
        className="lg:hidden fixed top-[4.5rem] left-4 z-50 btn btn-sm btn-circle bg-brand-blue text-white hover:bg-brand-dark border-0 shadow-lg"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>

      <div className="flex">
        <aside className={`
          fixed lg:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 bg-brand-dark shadow-lg
          overflow-y-auto transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-4 border-b border-brand-brown/30">
            <div className="flex items-center gap-3">
              <div className="avatar placeholder">
                <div className="bg-brand-blue text-white rounded-full w-10">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || ''} />
                  ) : (
                    <span>{(user?.displayName || user?.email || '?')[0].toUpperCase()}</span>
                  )}
                </div>
              </div>
              <div>
                <p className="font-semibold text-sm text-white">{user?.displayName || 'Usuario'}</p>
                <p className="text-xs text-brand-cream/60">{user?.email}</p>
              </div>
            </div>
          </div>
          <nav className="p-2">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-lg mb-1 transition-colors
                  ${location.pathname === item.path
                    ? 'bg-brand-blue text-white'
                    : 'hover:bg-brand-blue/10 text-brand-cream'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <span>{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                {item.path === '/dashboard/cart' && itemCount > 0 && (
                  <span className="badge badge-sm bg-brand-brown text-white border-0">{itemCount}</span>
                )}
              </Link>
            ))}
          </nav>
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 bg-brand-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <main className="flex-1 p-4 lg:p-8 min-h-[calc(100vh-4rem)] min-w-0 w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

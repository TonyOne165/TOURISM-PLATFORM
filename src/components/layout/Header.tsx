import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const Header: React.FC = () => {
  const { currentUser, userProfile, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-brand-dark/95 backdrop-blur-md shadow-lg" role="banner">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:px-3 focus:py-2 focus:bg-brand-cream focus:text-brand-dark focus:rounded-md focus:shadow-lg"
      >
        Saltar al contenido principal
      </a>
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-brand-cream hover:text-white transition shrink-0 focus-visible:ring-2 focus-visible:ring-brand-cream focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark rounded"
            aria-label="Cartagena Tours — Ir al inicio"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs sm:text-sm font-semibold tracking-wider uppercase">Cartagena Tours</span>
          </Link>

          {/* Main Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6" aria-label="Navegación principal">
            <Link to="/" className="text-brand-cream text-sm hover:text-white transition focus-visible:ring-2 focus-visible:ring-brand-cream focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark rounded px-1">Inicio</Link>
            <Link to="/tours" className="text-brand-cream text-sm hover:text-white transition focus-visible:ring-2 focus-visible:ring-brand-cream focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark rounded px-1">Tours</Link>
            <Link to="/accommodations" className="text-brand-cream text-sm hover:text-white transition focus-visible:ring-2 focus-visible:ring-brand-cream focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark rounded px-1">Hospedajes</Link>
            <Link to="/navegar" className="text-brand-cream text-sm hover:text-white transition focus-visible:ring-2 focus-visible:ring-brand-cream focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark rounded px-1">Navegar</Link>
            {currentUser && (
              <>
                <Link to="/dashboard" className="text-brand-cream text-sm hover:text-white transition">Mi Panel</Link>
                <Link to="/dashboard/cart" className="text-brand-cream text-sm hover:text-white transition">Carrito</Link>
                {isAdmin && (
                  <Link to="/admin" className="text-brand-beige text-sm font-semibold hover:text-white transition">
                    Admin
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Social Icons - Desktop only */}
            <div className="hidden lg:flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-cream hover:text-white transition focus-visible:ring-2 focus-visible:ring-brand-cream focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark rounded"
                aria-label="Instagram de Cartagena Tours (se abre en una pestaña nueva)"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-cream hover:text-white transition focus-visible:ring-2 focus-visible:ring-brand-cream focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark rounded"
                aria-label="TikTok de Cartagena Tours (se abre en una pestaña nueva)"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                </svg>
              </a>
            </div>

            {/* User Menu - Desktop/Tablet */}
            {currentUser ? (
              <div className="dropdown dropdown-end hidden sm:block">
                <label
                  tabIndex={0}
                  role="button"
                  aria-haspopup="menu"
                  aria-label={`Menú de cuenta de ${userProfile?.displayName?.split(' ')[0] || 'usuario'}`}
                  className="btn btn-sm bg-brand-cream text-brand-dark hover:bg-white border-0 gap-2 focus-visible:ring-2 focus-visible:ring-brand-cream focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark"
                >
                  <div className="avatar placeholder">
                    <div className="bg-brand-blue text-white rounded-full w-6">
                      {userProfile?.photoURL ? (
                        <img src={userProfile.photoURL} alt={`Foto de perfil de ${userProfile?.displayName || userProfile?.email || 'usuario'}`} className="w-6 h-6 rounded-full" />
                      ) : (
                        <span className="text-xs" aria-hidden="true">{(userProfile?.displayName || userProfile?.email || '?')[0].toUpperCase()}</span>
                      )}
                    </div>
                  </div>
                  <span className="hidden sm:inline">{userProfile?.displayName?.split(' ')[0] || 'Usuario'}</span>
                </label>
                <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-brand-cream rounded-box w-56">
                  <li className="menu-title"><span className="text-xs text-brand-dark/60">{userProfile?.email}</span></li>
                  <li><Link to="/dashboard">Mi Panel</Link></li>
                  <li><Link to="/dashboard/bookings">Mis Reservas</Link></li>
                  <li><Link to="/dashboard/cart">Carrito</Link></li>
                  <li><Link to="/dashboard/profile">Mi Perfil</Link></li>
                  {isAdmin && (
                    <>
                      <div className="divider my-1"></div>
                      <li className="menu-title"><span className="text-xs text-brand-blue">Administración</span></li>
                      <li><Link to="/admin">Dashboard Admin</Link></li>
                      <li><Link to="/admin/tours">Gestionar Tours</Link></li>
                      <li><Link to="/admin/bookings">Gestionar Reservas</Link></li>
                    </>
                  )}
                  <div className="divider my-1"></div>
                  <li><button onClick={handleLogout} className="text-error">Cerrar Sesión</button></li>
                </ul>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="btn btn-sm btn-ghost text-brand-cream text-sm hover:text-white focus-visible:ring-2 focus-visible:ring-brand-cream focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark">Iniciar Sesión</Link>
                <Link to="/register" className="btn btn-sm bg-brand-blue text-white hover:bg-brand-blue/80 border-0 rounded-full px-4 focus-visible:ring-2 focus-visible:ring-brand-cream focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark">
                  Registrarse
                </Link>
              </div>
            )}

            {/* Mobile Menu - Hamburger */}
            <div className="md:hidden relative">
              <button
                className="btn btn-ghost btn-sm text-brand-cream px-2 focus-visible:ring-2 focus-visible:ring-brand-cream focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label={isMobileMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>

              {isMobileMenuOpen && (
                <ul
                  id="mobile-menu"
                  role="menu"
                  aria-label="Menú móvil"
                  className="absolute right-0 mt-3 z-[50] p-3 shadow-lg menu menu-sm bg-brand-cream rounded-box w-64 max-h-[80vh] overflow-y-auto"
                >
                  {/* User info in mobile menu */}
                  {currentUser && userProfile && (
                    <li className="menu-title mb-1">
                      <div className="flex items-center gap-2">
                        <div className="avatar placeholder">
                          <div className="bg-brand-blue text-white rounded-full w-8">
                            {userProfile?.photoURL ? (
                              <img src={userProfile.photoURL} alt={`Foto de perfil de ${userProfile?.displayName || userProfile?.email || 'usuario'}`} className="w-8 h-8 rounded-full" />
                            ) : (
                              <span className="text-xs" aria-hidden="true">{(userProfile?.displayName || userProfile?.email || '?')[0].toUpperCase()}</span>
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-brand-dark font-semibold">{userProfile?.displayName?.split(' ')[0] || 'Usuario'}</span>
                      </div>
                    </li>
                  )}
                  {/* Navigation links */}
                  <li><Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Inicio</Link></li>
                  <li><Link to="/tours" onClick={() => setIsMobileMenuOpen(false)}>Tours</Link></li>
                  <li><Link to="/accommodations" onClick={() => setIsMobileMenuOpen(false)}>Hospedajes</Link></li>
                  <li><Link to="/navegar" onClick={() => setIsMobileMenuOpen(false)}>Navegar</Link></li>
                  {currentUser && (
                    <>
                      <div className="divider my-1"></div>
                      <li><Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>Mi Panel</Link></li>
                      <li><Link to="/dashboard/bookings" onClick={() => setIsMobileMenuOpen(false)}>Mis Reservas</Link></li>
                      <li><Link to="/dashboard/cart" onClick={() => setIsMobileMenuOpen(false)}>Carrito</Link></li>
                      <li><Link to="/dashboard/profile" onClick={() => setIsMobileMenuOpen(false)}>Mi Perfil</Link></li>
                      {isAdmin && <li><Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-brand-blue font-semibold">Administración</Link></li>}
                      <div className="divider my-1"></div>
                      <li><button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="text-error">Cerrar Sesión</button></li>
                    </>
                  )}
                  {!currentUser && (
                    <>
                      <div className="divider my-1"></div>
                      <li><Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>Iniciar Sesión</Link></li>
                      <li><Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="text-brand-blue font-semibold">Registrarse</Link></li>
                    </>
                  )}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

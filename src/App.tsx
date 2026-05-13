import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { AuthProvider } from '@/contexts/AuthContext';
import { CityProvider } from '@/contexts/CityContext';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MaintenancePage } from '@/components/layout/MaintenancePage';
import { Home } from '@/pages/Home';
import Tours from '@/pages/Tours';
import TourDetailPage from '@/pages/TourDetailPage';
import Accommodations from '@/pages/Accommodations';
import AccommodationDetail from '@/pages/AccommodationDetail';
import { Login } from '@/components/auth/Login';
import { Register } from '@/components/auth/Register';
import { AIChatbot } from '@/components/ai/AIChatbot';
import { db } from '@/services/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { lazy, Suspense } from 'react';

const PlanetExplorer = lazy(() => import('@/pages/PlanetExplorer'));

// Admin pages
import { AdminLayout } from '@/pages/admin/AdminLayout';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminUsers } from '@/pages/admin/AdminUsers';
import { AdminTours } from '@/pages/admin/AdminTours';
import { AdminAccommodations } from '@/pages/admin/AdminAccommodations';
import { AdminBookings } from '@/pages/admin/AdminBookings';
import { AdminPromotions } from '@/pages/admin/AdminPromotions';
import { AdminReviews } from '@/pages/admin/AdminReviews';
import { AdminMessages } from '@/pages/admin/AdminMessages';
import { AdminJoinRequests } from '@/pages/admin/AdminJoinRequests';
import { AdminVisited } from '@/pages/admin/AdminVisited';
import { AdminReports } from '@/pages/admin/AdminReports';
import { AdminSettings } from '@/pages/admin/AdminSettings';

// User pages
import { UserLayout } from '@/pages/user/UserLayout';
import { UserDashboard } from '@/pages/user/UserDashboard';
import { UserBookings } from '@/pages/user/UserBookings';
import { UserHistory } from '@/pages/user/UserHistory';
import { UserReviews } from '@/pages/user/UserReviews';
import { UserMessages } from '@/pages/user/UserMessages';
import { UserCart } from '@/pages/user/UserCart';
import { UserProfile } from '@/pages/user/UserProfile';

import './App.css';

const AppContent = () => {
  const { user, loading: authLoading } = useAuth();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const location = useLocation();
  const isFullscreen = location.pathname === '/navegar';

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'app_config', 'settings'));
        if (snap.exists()) {
          setMaintenanceMode(snap.data().maintenanceMode === true);
        } else {
          // Fallback to localStorage
          const local = localStorage.getItem('platform_settings');
          if (local) {
            const parsed = JSON.parse(local);
            setMaintenanceMode(parsed.maintenanceMode === true);
          }
        }
      } catch {
        // Fallback to localStorage
        try {
          const local = localStorage.getItem('platform_settings');
          if (local) {
            setMaintenanceMode(JSON.parse(local).maintenanceMode === true);
          }
        } catch {}
      } finally {
        setSettingsLoaded(true);
      }
    };
    loadSettings();
  }, []);

  // Show loading while checking settings
  if (!settingsLoaded || authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // If maintenance mode is on and user is not admin, show maintenance page
  const isAdmin = user?.role === 'admin';
  if (maintenanceMode && !isAdmin) {
    return <MaintenancePage />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {!isFullscreen && <Header />}
      {maintenanceMode && isAdmin && !isFullscreen && (
        <div className="bg-warning text-warning-content text-center py-2 text-sm font-medium mt-16">
          Modo mantenimiento activo — solo visible para administradores
        </div>
      )}
      <main className="flex-grow">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/tours" element={<Tours />} />
          <Route path="/tours/:slug" element={<TourDetailPage />} />
          <Route path="/accommodations" element={<Accommodations />} />
          <Route path="/accommodations/:slug" element={<AccommodationDetail />} />
          <Route path="/navegar" element={
            <Suspense fallback={<div className="flex justify-center items-center min-h-screen bg-[#181818]"><span className="loading loading-spinner loading-lg text-white"></span></div>}>
              <PlanetExplorer />
            </Suspense>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* User protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute><UserLayout /></ProtectedRoute>
          }>
            <Route index element={<UserDashboard />} />
            <Route path="bookings" element={<UserBookings />} />
            <Route path="history" element={<UserHistory />} />
            <Route path="reviews" element={<UserReviews />} />
            <Route path="messages" element={<UserMessages />} />
            <Route path="cart" element={<UserCart />} />
            <Route path="profile" element={<UserProfile />} />
          </Route>

          {/* Admin protected routes */}
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="tours" element={<AdminTours />} />
            <Route path="accommodations" element={<AdminAccommodations />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="promotions" element={<AdminPromotions />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="join-requests" element={<AdminJoinRequests />} />
            <Route path="visited" element={<AdminVisited />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </main>
      {!isFullscreen && <Footer />}
      {!isFullscreen && <AIChatbot />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CityProvider>
          <AppContent />
        </CityProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

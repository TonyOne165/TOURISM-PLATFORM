import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TourDetail from '../components/tours/TourDetail';
import { useAuth } from '../hooks/useAuth';

const TourDetailPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleBookingAttempt = () => {
    if (!user) {
      setShowLoginModal(true);
    }
  };

  return (
    <div className="pt-16 bg-brand-cream">
      <TourDetail onBookingAttempt={handleBookingAttempt} />

      {/* Login Modal */}
      {showLoginModal && (
        <div className="modal modal-open">
          <div className="modal-box bg-brand-cream">
            <h3 className="font-bold text-lg text-brand-dark">Inicio de Sesión Requerido</h3>
            <p className="py-4 text-brand-dark/70">
              Necesitas iniciar sesión para reservar un tour. ¿Deseas iniciar sesión o crear una cuenta?
            </p>
            <div className="modal-action">
              <button
                className="btn btn-ghost text-brand-dark"
                onClick={() => setShowLoginModal(false)}
              >
                Cancelar
              </button>
              <button
                className="btn bg-brand-blue text-white hover:bg-brand-dark border-0"
                onClick={() => {
                  setShowLoginModal(false);
                  sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
                  navigate('/login');
                }}
              >
                Iniciar Sesión
              </button>
              <button
                className="btn bg-brand-brown text-white hover:bg-brand-brown/80 border-0"
                onClick={() => {
                  setShowLoginModal(false);
                  sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
                  navigate('/register');
                }}
              >
                Registrarse
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Button - positioned to avoid chatbot overlap */}
      <button
        onClick={() => {
          if (navigator.share) {
            navigator.share({
              title: document.title,
              url: window.location.href,
            });
          } else {
            navigator.clipboard.writeText(window.location.href);
          }
        }}
        className="fixed bottom-6 right-4 sm:right-20 btn btn-circle bg-brand-brown text-white hover:bg-brand-brown/80 border-0 shadow-lg z-40"
        aria-label="Compartir"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      </button>
    </div>
  );
};

export default TourDetailPage;

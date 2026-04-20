import React from 'react';

export const MaintenancePage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark text-white">
      <div className="text-center px-6 max-w-lg">
        <div className="text-6xl mb-6">🔧</div>
        <h1 className="text-4xl font-bold mb-4">Sitio en Mantenimiento</h1>
        <p className="text-lg text-brand-cream/80 mb-6">
          Estamos realizando mejoras para brindarte una mejor experiencia.
          Por favor regresa en unos momentos.
        </p>
        <p className="text-sm text-brand-cream/50">
          Si necesitas ayuda urgente, contáctanos a info@cartagena-tours.com
        </p>
      </div>
    </div>
  );
};

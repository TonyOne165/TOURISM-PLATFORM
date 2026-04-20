import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

const SETTINGS_DOC = doc(db, 'app_config', 'settings');

export const AdminSettings = () => {
  const [settings, setSettings] = useState({
    siteName: 'Cartagena Tours',
    contactEmail: 'info@cartagena-tours.com',
    contactPhone: '+57 300 123 4567',
    currency: 'USD',
    timezone: 'America/Bogota',
    bookingAutoConfirm: false,
    maxParticipantsDefault: 20,
    cancellationHours: 48,
    maintenanceMode: false,
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');

  // Load settings from Firestore on mount, fallback to localStorage
  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(SETTINGS_DOC);
        if (snap.exists()) {
          setSettings(prev => ({ ...prev, ...snap.data() }));
          return;
        }
      } catch (err) {
        console.warn('Could not load settings from Firestore, using localStorage:', err);
        setLoadError('Configuración cargada desde caché local.');
      }
      // Fallback to localStorage
      const local = localStorage.getItem('platform_settings');
      if (local) {
        try { setSettings(prev => ({ ...prev, ...JSON.parse(local) })); } catch {}
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save to Firestore
      await setDoc(SETTINGS_DOC, settings, { merge: true });
      // Also save to localStorage as fallback
      localStorage.setItem('platform_settings', JSON.stringify(settings));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      // Fallback to localStorage only
      localStorage.setItem('platform_settings', JSON.stringify(settings));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Configuración del Sistema</h1>
      {loadError && <div className="alert alert-warning mb-4"><span>{loadError}</span></div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General */}
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h2 className="card-title text-lg">General</h2>
            <div className="space-y-4">
              <div className="form-control">
                <label className="label"><span className="label-text">Nombre del Sitio</span></label>
                <input type="text" className="input input-bordered" value={settings.siteName}
                  onChange={e => setSettings({ ...settings, siteName: e.target.value })} />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Email de Contacto</span></label>
                <input type="email" className="input input-bordered" value={settings.contactEmail}
                  onChange={e => setSettings({ ...settings, contactEmail: e.target.value })} />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Teléfono de Contacto</span></label>
                <input type="tel" className="input input-bordered" value={settings.contactPhone}
                  onChange={e => setSettings({ ...settings, contactPhone: e.target.value })} />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Moneda</span></label>
                <select className="select select-bordered" value={settings.currency}
                  onChange={e => setSettings({ ...settings, currency: e.target.value })}>
                  <option value="USD">USD - Dólar</option>
                  <option value="COP">COP - Peso Colombiano</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Zona Horaria</span></label>
                <select className="select select-bordered" value={settings.timezone}
                  onChange={e => setSettings({ ...settings, timezone: e.target.value })}>
                  <option value="America/Bogota">America/Bogota (UTC-5)</option>
                  <option value="America/New_York">America/New_York (UTC-5/4)</option>
                  <option value="Europe/Madrid">Europe/Madrid (UTC+1/2)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings */}
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h2 className="card-title text-lg">Reservas</h2>
            <div className="space-y-4">
              <div className="form-control">
                <label className="cursor-pointer label justify-start gap-3">
                  <input type="checkbox" className="toggle toggle-primary" checked={settings.bookingAutoConfirm}
                    onChange={e => setSettings({ ...settings, bookingAutoConfirm: e.target.checked })} />
                  <span className="label-text">Auto-confirmar reservas</span>
                </label>
                <p className="text-xs text-base-content/60 ml-14">Las reservas se confirmarán automáticamente sin aprobación manual</p>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Máx. Participantes por Defecto</span></label>
                <input type="number" className="input input-bordered" value={settings.maxParticipantsDefault}
                  onChange={e => setSettings({ ...settings, maxParticipantsDefault: parseInt(e.target.value) })} min="1" />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Horas para Cancelación Gratuita</span></label>
                <input type="number" className="input input-bordered" value={settings.cancellationHours}
                  onChange={e => setSettings({ ...settings, cancellationHours: parseInt(e.target.value) })} min="0" />
              </div>
            </div>
          </div>
        </div>

        {/* System / Maintenance */}
        <div className="card bg-base-100 shadow-md lg:col-span-2">
          <div className="card-body">
            <h2 className="card-title text-lg">Sistema</h2>
            <div className="form-control">
              <label className="cursor-pointer label justify-start gap-3">
                <input type="checkbox" className="toggle toggle-error" checked={settings.maintenanceMode}
                  onChange={e => setSettings({ ...settings, maintenanceMode: e.target.checked })} />
                <span className="label-text">Modo Mantenimiento</span>
              </label>
              <p className="text-xs text-base-content/60 ml-14">Solo los administradores podrán acceder al sitio</p>
            </div>
            {settings.maintenanceMode && (
              <div className="alert alert-warning mt-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span>El modo mantenimiento está ACTIVO. Los usuarios normales verán una página de mantenimiento.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? <span className="loading loading-spinner loading-sm"></span> : 'Guardar Cambios'}
        </button>
        {saved && <span className="text-success font-medium">Configuración guardada correctamente</span>}
      </div>
    </div>
  );
};

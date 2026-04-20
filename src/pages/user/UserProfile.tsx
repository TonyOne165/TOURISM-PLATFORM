import { useState, useEffect } from 'react';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db, COLLECTIONS } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useBookings } from '../../hooks/useBookings';
import { useVisitedDestinations } from '../../hooks/useVisitedDestinations';
import { useReviews } from '../../hooks/useReviews';

export const UserProfile = () => {
  const { user } = useAuth();
  const { getUserBookings } = useBookings();
  const { getUserVisited } = useVisitedDestinations();
  const { getUserReviews } = useReviews();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ displayName: '', phone: '', photoURL: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [stats, setStats] = useState({ trips: 0, spent: 0, destinations: 0, reviews: 0 });

  useEffect(() => {
    if (user) {
      setForm({ displayName: user.displayName || '', phone: user.phone || '', photoURL: user.photoURL || '' });
    }
    const loadStats = async () => {
      const [bookings, visited, reviews] = await Promise.all([getUserBookings(), getUserVisited(), getUserReviews()]);
      const spent = bookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + (b.totalPrice || 0), 0);
      setStats({ trips: bookings.length, spent, destinations: visited.length, reviews: reviews.length });
    };
    loadStats();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, COLLECTIONS.USERS, user.uid), {
        displayName: form.displayName,
        phone: form.phone,
        photoURL: form.photoURL || null,
        updatedAt: Timestamp.now(),
      });
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } finally { setSaving(false); }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Mi Perfil</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="card bg-base-100 shadow-md">
          <div className="card-body items-center text-center">
            <div className="avatar placeholder mb-3">
              <div className="bg-primary text-primary-content rounded-full w-24">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || ''} />
                ) : (
                  <span className="text-3xl">{(user?.displayName || user?.email || '?')[0].toUpperCase()}</span>
                )}
              </div>
            </div>
            <h2 className="text-xl font-bold">{user?.displayName || 'Usuario'}</h2>
            <p className="text-sm text-base-content/60">{user?.email}</p>
            <span className="badge badge-primary mt-1">{user?.role === 'admin' ? 'Administrador' : 'Usuario'}</span>
            {user?.loyaltyPoints !== undefined && (
              <p className="text-sm mt-2"><span className="font-bold text-secondary">{user.loyaltyPoints}</span> puntos de lealtad</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="card bg-base-100 shadow-md lg:col-span-2">
          <div className="card-body">
            <h2 className="card-title text-lg">Estadísticas Personales</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
              <div className="text-center p-3 bg-base-200 rounded-lg">
                <p className="text-2xl font-bold text-primary">{stats.trips}</p>
                <p className="text-xs text-base-content/60">Viajes Realizados</p>
              </div>
              <div className="text-center p-3 bg-base-200 rounded-lg">
                <p className="text-2xl font-bold text-secondary">${stats.spent.toLocaleString()}</p>
                <p className="text-xs text-base-content/60">Dinero Gastado</p>
              </div>
              <div className="text-center p-3 bg-base-200 rounded-lg">
                <p className="text-2xl font-bold text-accent">{stats.destinations}</p>
                <p className="text-xs text-base-content/60">Destinos Visitados</p>
              </div>
              <div className="text-center p-3 bg-base-200 rounded-lg">
                <p className="text-2xl font-bold">{stats.reviews}</p>
                <p className="text-xs text-base-content/60">Reseñas Escritas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile */}
        <div className="card bg-base-100 shadow-md lg:col-span-3">
          <div className="card-body">
            <div className="flex justify-between items-center">
              <h2 className="card-title text-lg">Información Personal</h2>
              {!editing && <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>Editar</button>}
            </div>
            {editing ? (
              <div className="space-y-4 mt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label"><span className="label-text">Nombre</span></label>
                    <input type="text" className="input input-bordered" value={form.displayName}
                      onChange={e => setForm({ ...form, displayName: e.target.value })} />
                  </div>
                  <div className="form-control">
                    <label className="label"><span className="label-text">Teléfono</span></label>
                    <input type="tel" className="input input-bordered" value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <div className="form-control md:col-span-2">
                    <label className="label"><span className="label-text">URL de Foto de Perfil</span></label>
                    <input type="url" className="input input-bordered" value={form.photoURL}
                      onChange={e => setForm({ ...form, photoURL: e.target.value })}
                      placeholder="https://example.com/photo.jpg" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                    {saving ? <span className="loading loading-spinner loading-sm"></span> : 'Guardar'}
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancelar</button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div><p className="text-sm text-base-content/60">Nombre</p><p className="font-medium">{user?.displayName || '-'}</p></div>
                <div><p className="text-sm text-base-content/60">Email</p><p className="font-medium">{user?.email || '-'}</p></div>
                <div><p className="text-sm text-base-content/60">Teléfono</p><p className="font-medium">{user?.phone || '-'}</p></div>
                <div><p className="text-sm text-base-content/60">Miembro desde</p><p className="font-medium">{user?.createdAt?.toDate().toLocaleDateString() || '-'}</p></div>
              </div>
            )}
            {saved && <p className="text-success text-sm mt-2">Perfil actualizado correctamente</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

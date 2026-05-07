import { useState } from 'react';
import { useAccommodations } from '../../hooks/useAccommodations';
import { ACCOMMODATION_TYPES, AMENITIES, CITIES } from '../../utils/constants';
import { useCity } from '../../contexts/CityContext';
import type { CreateAccommodationInput } from '../../types';

const emptyForm: CreateAccommodationInput = {
  name: '', description: '', type: 'hotel', pricePerNight: 0,
  coords: { lat: 10.4236, lng: -75.5366 }, address: '', amenities: [],
  rooms: 1, maxGuests: 2, checkInTime: '14:00', checkOutTime: '12:00',
  featured: false, associatedTourIds: [],
  city: '',
};

export const AdminAccommodations = () => {
  const { accommodations, createAccommodation, updateAccommodation, deleteAccommodation, loading } = useAccommodations();
  const { selectedCity } = useCity();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateAccommodationInput>(emptyForm);
  const [imageUrls, setImageUrls] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const resetForm = () => { setForm(emptyForm); setImageUrls(''); setEditingId(null); setShowForm(false); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const images = imageUrls.split(',').map(u => u.trim()).filter(Boolean);
      const data = { ...form, city: form.city || selectedCity || '' };
      if (editingId) {
        await updateAccommodation(editingId, data, images);
      } else {
        await createAccommodation(data, images);
      }
      resetForm();
    } catch { alert('Error al guardar'); } finally { setSubmitting(false); }
  };

  const handleEdit = (id: string) => {
    const acc = accommodations.find(a => a.id === id);
    if (!acc) return;
    setForm({
      name: acc.name, description: acc.description, type: acc.type,
      pricePerNight: acc.pricePerNight, coords: acc.coords, address: acc.address,
      amenities: acc.amenities, rooms: acc.rooms, maxGuests: acc.maxGuests,
      checkInTime: acc.checkInTime, checkOutTime: acc.checkOutTime,
      featured: acc.featured, associatedTourIds: acc.associatedTourIds,
      city: acc.city,
    });
    setImageUrls(acc.images?.join(', ') || '');
    setEditingId(id);
    setShowForm(true);
  };

  const toggleAmenity = (amenity: string) => {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const filtered = accommodations.filter(a =>
    !search || a.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Gestión de Hospedajes</h1>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>+ Nuevo Hospedaje</button>
      </div>

      {showForm && (
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title">{editingId ? 'Editar' : 'Crear'} Hospedaje</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="form-control">
                  <label className="label"><span className="label-text">Nombre *</span></label>
                  <input type="text" className="input input-bordered" value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Tipo *</span></label>
                  <select className="select select-bordered" value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value as CreateAccommodationInput['type'] })}>
                    {ACCOMMODATION_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Precio/Noche (USD) *</span></label>
                  <input type="number" className="input input-bordered" value={form.pricePerNight}
                    onChange={e => setForm({ ...form, pricePerNight: parseFloat(e.target.value) })} required min="0" />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Dirección *</span></label>
                  <input type="text" className="input input-bordered" value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })} required />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Habitaciones</span></label>
                  <input type="number" className="input input-bordered" value={form.rooms}
                    onChange={e => setForm({ ...form, rooms: parseInt(e.target.value) })} min="1" />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Máx. Huéspedes</span></label>
                  <input type="number" className="input input-bordered" value={form.maxGuests}
                    onChange={e => setForm({ ...form, maxGuests: parseInt(e.target.value) })} min="1" />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Check-in</span></label>
                  <input type="time" className="input input-bordered" value={form.checkInTime}
                    onChange={e => setForm({ ...form, checkInTime: e.target.value })} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Check-out</span></label>
                  <input type="time" className="input input-bordered" value={form.checkOutTime}
                    onChange={e => setForm({ ...form, checkOutTime: e.target.value })} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Latitud</span></label>
                  <input type="number" step="any" className="input input-bordered" value={form.coords.lat}
                    onChange={e => setForm({ ...form, coords: { ...form.coords, lat: parseFloat(e.target.value) } })} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Longitud</span></label>
                  <input type="number" step="any" className="input input-bordered" value={form.coords.lng}
                    onChange={e => setForm({ ...form, coords: { ...form.coords, lng: parseFloat(e.target.value) } })} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Ciudad *</span></label>
                  <select className="select select-bordered" value={form.city || selectedCity || ''}
                    onChange={e => setForm({ ...form, city: e.target.value })} required>
                    <option value="">Seleccionar</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Descripción *</span></label>
                <textarea className="textarea textarea-bordered h-24" value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })} required />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">URLs de Imágenes (separadas por coma)</span></label>
                <textarea className="textarea textarea-bordered" value={imageUrls} onChange={e => setImageUrls(e.target.value)} />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Amenidades</span></label>
                <div className="flex flex-wrap gap-2">
                  {AMENITIES.map(a => (
                    <label key={a} className="cursor-pointer">
                      <input type="checkbox" className="checkbox checkbox-sm checkbox-primary mr-1"
                        checked={form.amenities.includes(a)} onChange={() => toggleAmenity(a)} />
                      <span className="text-sm">{a}</span>
                    </label>
                  ))}
                </div>
              </div>
              <label className="cursor-pointer label justify-start gap-3">
                <input type="checkbox" className="checkbox checkbox-primary" checked={form.featured || false}
                  onChange={e => setForm({ ...form, featured: e.target.checked })} />
                <span className="label-text">Destacado</span>
              </label>
              <div className="flex gap-3">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <span className="loading loading-spinner loading-sm"></span> : 'Guardar'}
                </button>
                <button type="button" className="btn btn-ghost" onClick={resetForm}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mb-4">
        <input type="text" placeholder="Buscar hospedajes..." className="input input-bordered w-full max-w-md"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card bg-base-100 shadow-md">
        <div className="card-body p-0">
          {loading ? (
            <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg"></span></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead><tr><th>Imagen</th><th>Nombre</th><th>Tipo</th><th>Precio/Noche</th><th>Ciudad</th><th>Rating</th><th>Acciones</th></tr></thead>
                <tbody>
                  {filtered.map(acc => (
                    <tr key={acc.id}>
                      <td><div className="avatar"><div className="mask mask-squircle w-12 h-12">
                        <img src={acc.images?.[0] || 'https://placehold.co/100x100'} alt={acc.name} />
                      </div></div></td>
                      <td><div className="font-medium">{acc.name}</div>{acc.featured && <span className="badge badge-secondary badge-sm">Destacado</span>}</td>
                      <td><span className="badge badge-outline badge-sm">{acc.type}</span></td>
                      <td className="font-semibold">${acc.pricePerNight}/noche</td>
                      <td>{acc.city && <span className="badge badge-primary badge-sm">{acc.city}</span>}</td>
                      <td>{acc.rating.toFixed(1)} ⭐</td>
                      <td>
                        <div className="flex gap-2">
                          <button className="btn btn-sm btn-ghost" onClick={() => handleEdit(acc.id!)}>Editar</button>
                          <button className="btn btn-sm btn-error btn-outline" onClick={() => {
                            if (confirm('¿Eliminar este hospedaje?')) deleteAccommodation(acc.id!);
                          }}>Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && <p className="text-center py-8 text-base-content/60">No se encontraron hospedajes</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

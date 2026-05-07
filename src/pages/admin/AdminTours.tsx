import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTours } from '../../hooks/useTours';
import { TOUR_CATEGORIES, DIFFICULTY_LEVELS, CITIES } from '../../utils/constants';
import { useCity } from '../../contexts/CityContext';
import type { CreateTourInput } from '../../types';

const emptyForm: CreateTourInput = {
  title: '', description: '', price: 0,
  coords: { lat: 10.4236, lng: -75.5366 },
  duration: '', category: '', featured: false,
  maxParticipants: 20, difficulty: 'easy', meetingPoint: '', includes: [],
  city: '',
};

export const AdminTours = () => {
  const { user } = useAuth();
  const { tours, createTour, updateTour, deleteTour, loading } = useTours();
  const { selectedCity } = useCity();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateTourInput>(emptyForm);
  const [imageUrls, setImageUrls] = useState('');
  const [includesText, setIncludesText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const resetForm = () => {
    setForm(emptyForm);
    setImageUrls('');
    setIncludesText('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const images = imageUrls.split(',').map(u => u.trim()).filter(Boolean);
      const includes = includesText.split(',').map(i => i.trim()).filter(Boolean);
      const data = { ...form, includes };
      if (editingId) {
        await updateTour(editingId, { ...data, images });
      } else {
        await createTour(data, user!.uid, images);
      }
      resetForm();
    } catch {
      alert('Error al guardar el tour');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (tourId: string) => {
    const tour = tours.find(t => t.id === tourId);
    if (!tour) return;
    setForm({
      title: tour.title, description: tour.description, price: tour.price,
      coords: tour.coords, duration: tour.duration, category: tour.category,
      featured: tour.featured, maxParticipants: tour.maxParticipants,
      difficulty: tour.difficulty, meetingPoint: tour.meetingPoint, includes: tour.includes,
      city: tour.city,
    });
    setImageUrls(tour.images?.join(', ') || '');
    setIncludesText(tour.includes?.join(', ') || '');
    setEditingId(tourId);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este tour?')) {
      await deleteTour(id);
    }
  };

  const filtered = tours.filter(t =>
    !search || t.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Gestión de Tours</h1>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
          + Nuevo Tour
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title">{editingId ? 'Editar Tour' : 'Crear Nuevo Tour'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="form-control">
                  <label className="label"><span className="label-text">Título *</span></label>
                  <input type="text" className="input input-bordered" value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Precio (USD) *</span></label>
                  <input type="number" className="input input-bordered" value={form.price}
                    onChange={e => setForm({ ...form, price: parseFloat(e.target.value) })} required min="0" />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Duración *</span></label>
                  <input type="text" placeholder="ej: 3 horas" className="input input-bordered" value={form.duration}
                    onChange={e => setForm({ ...form, duration: e.target.value })} required />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Categoría</span></label>
                  <select className="select select-bordered" value={form.category || ''}
                    onChange={e => setForm({ ...form, category: e.target.value })}>
                    <option value="">Seleccionar</option>
                    {TOUR_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Dificultad</span></label>
                  <select className="select select-bordered" value={form.difficulty || 'easy'}
                    onChange={e => setForm({ ...form, difficulty: e.target.value as 'easy' | 'moderate' | 'hard' })}>
                    {DIFFICULTY_LEVELS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Máx. Participantes</span></label>
                  <input type="number" className="input input-bordered" value={form.maxParticipants || 20}
                    onChange={e => setForm({ ...form, maxParticipants: parseInt(e.target.value) })} min="1" />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Latitud</span></label>
                  <input type="number" step="any" className="input input-bordered" value={form.coords.lat}
                    onChange={e => setForm({ ...form, coords: { ...form.coords, lat: parseFloat(e.target.value) } })} required />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Longitud</span></label>
                  <input type="number" step="any" className="input input-bordered" value={form.coords.lng}
                    onChange={e => setForm({ ...form, coords: { ...form.coords, lng: parseFloat(e.target.value) } })} required />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Punto de Encuentro</span></label>
                  <input type="text" className="input input-bordered" value={form.meetingPoint || ''}
                    onChange={e => setForm({ ...form, meetingPoint: e.target.value })} />
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
                <textarea className="textarea textarea-bordered h-32" value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })} required />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">URLs de Imágenes (separadas por coma)</span></label>
                <textarea className="textarea textarea-bordered" value={imageUrls} onChange={e => setImageUrls(e.target.value)}
                  placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg" />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Incluye (separado por coma)</span></label>
                <input type="text" className="input input-bordered" value={includesText}
                  onChange={e => setIncludesText(e.target.value)} placeholder="Guía, Transporte, Almuerzo" />
              </div>
              <div className="form-control">
                <label className="cursor-pointer label justify-start gap-3">
                  <input type="checkbox" className="checkbox checkbox-primary" checked={form.featured || false}
                    onChange={e => setForm({ ...form, featured: e.target.checked })} />
                  <span className="label-text">Tour Destacado</span>
                </label>
              </div>
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

      {/* Search */}
      <div className="mb-4">
        <input type="text" placeholder="Buscar tours..." className="input input-bordered w-full max-w-md"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Tours Table */}
      <div className="card bg-base-100 shadow-md">
        <div className="card-body p-0">
          {loading ? (
            <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg"></span></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr><th>Imagen</th><th>Título</th><th>Precio</th><th>Duración</th><th>Categoría</th><th>Ciudad</th><th>Rating</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                  {filtered.map(tour => (
                    <tr key={tour.id}>
                      <td>
                        <div className="avatar"><div className="mask mask-squircle w-12 h-12">
                          <img src={tour.images?.[0] || 'https://placehold.co/100x100'} alt={tour.title} />
                        </div></div>
                      </td>
                      <td>
                        <div className="font-medium">{tour.title}</div>
                        {tour.featured && <span className="badge badge-secondary badge-sm">Destacado</span>}
                      </td>
                      <td className="font-semibold">${tour.price}</td>
                      <td>{tour.duration}</td>
                      <td><span className="badge badge-outline badge-sm">{tour.category || 'General'}</span></td>
                      <td>{tour.city && <span className="badge badge-primary badge-sm">{tour.city}</span>}</td>
                      <td>{tour.rating.toFixed(1)} ⭐</td>
                      <td>
                        <div className="flex gap-2">
                          <button className="btn btn-sm btn-ghost" onClick={() => handleEdit(tour.id!)}>Editar</button>
                          <button className="btn btn-sm btn-error btn-outline" onClick={() => handleDelete(tour.id!)}>Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && <p className="text-center py-8 text-base-content/60">No se encontraron tours</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

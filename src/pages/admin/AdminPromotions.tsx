import { useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import { usePromotions } from '../../hooks/usePromotions';
import { PROMOTION_TYPES } from '../../utils/constants';
import type { Promotion } from '../../types';

export const AdminPromotions = () => {
  const { promotions, createPromotion, updatePromotion, deletePromotion, loading } = usePromotions();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    code: '', description: '', type: 'percentage' as Promotion['type'],
    value: 0, minPurchase: 0, minParticipants: 2, maxUses: 100,
    applicableTo: 'all' as Promotion['applicableTo'],
    startDate: '', endDate: '', active: true,
  });

  const resetForm = () => {
    setForm({ code: '', description: '', type: 'percentage', value: 0, minPurchase: 0, minParticipants: 2, maxUses: 100, applicableTo: 'all', startDate: '', endDate: '', active: true });
    setEditingId(null); setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = {
        code: form.code, description: form.description, type: form.type,
        value: form.value, minPurchase: form.minPurchase, minParticipants: form.minParticipants,
        maxUses: form.maxUses, applicableTo: form.applicableTo, active: form.active,
        startDate: Timestamp.fromDate(new Date(form.startDate)),
        endDate: Timestamp.fromDate(new Date(form.endDate)),
      };
      if (editingId) { await updatePromotion(editingId, data); }
      else { await createPromotion(data); }
      resetForm();
    } catch { alert('Error al guardar'); } finally { setSubmitting(false); }
  };

  const handleEdit = (id: string) => {
    const p = promotions.find(x => x.id === id);
    if (!p) return;
    setForm({
      code: p.code, description: p.description, type: p.type,
      value: p.value, minPurchase: p.minPurchase || 0, minParticipants: p.minParticipants || 2,
      maxUses: p.maxUses, applicableTo: p.applicableTo, active: p.active,
      startDate: p.startDate.toDate().toISOString().split('T')[0],
      endDate: p.endDate.toDate().toISOString().split('T')[0],
    });
    setEditingId(id); setShowForm(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Promociones</h1>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>+ Nueva Promoción</button>
      </div>

      {showForm && (
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title">{editingId ? 'Editar' : 'Crear'} Promoción</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="form-control">
                  <label className="label"><span className="label-text">Código *</span></label>
                  <input type="text" className="input input-bordered uppercase" value={form.code}
                    onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} required />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Tipo *</span></label>
                  <select className="select select-bordered" value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value as Promotion['type'] })}>
                    {PROMOTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Valor ({form.type === 'fixed' ? 'USD' : '%'}) *</span></label>
                  <input type="number" className="input input-bordered" value={form.value}
                    onChange={e => setForm({ ...form, value: parseFloat(e.target.value) })} required min="0" />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Compra Mínima</span></label>
                  <input type="number" className="input input-bordered" value={form.minPurchase}
                    onChange={e => setForm({ ...form, minPurchase: parseFloat(e.target.value) })} min="0" />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Usos Máximos</span></label>
                  <input type="number" className="input input-bordered" value={form.maxUses}
                    onChange={e => setForm({ ...form, maxUses: parseInt(e.target.value) })} min="1" />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Aplica a</span></label>
                  <select className="select select-bordered" value={form.applicableTo}
                    onChange={e => setForm({ ...form, applicableTo: e.target.value as Promotion['applicableTo'] })}>
                    <option value="all">Todo</option>
                    <option value="tours">Solo Tours</option>
                    <option value="accommodations">Solo Hospedajes</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Fecha Inicio *</span></label>
                  <input type="date" className="input input-bordered" value={form.startDate}
                    onChange={e => setForm({ ...form, startDate: e.target.value })} required />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Fecha Fin *</span></label>
                  <input type="date" className="input input-bordered" value={form.endDate}
                    onChange={e => setForm({ ...form, endDate: e.target.value })} required />
                </div>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Descripción *</span></label>
                <textarea className="textarea textarea-bordered" value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })} required />
              </div>
              <label className="cursor-pointer label justify-start gap-3">
                <input type="checkbox" className="toggle toggle-primary" checked={form.active}
                  onChange={e => setForm({ ...form, active: e.target.checked })} />
                <span className="label-text">Activa</span>
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

      <div className="card bg-base-100 shadow-md">
        <div className="card-body p-0">
          {loading ? <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg"></span></div> : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead><tr><th>Código</th><th>Tipo</th><th>Valor</th><th>Usos</th><th>Vigencia</th><th>Estado</th><th>Acciones</th></tr></thead>
                <tbody>
                  {promotions.map(p => (
                    <tr key={p.id}>
                      <td className="font-mono font-bold">{p.code}</td>
                      <td><span className="badge badge-outline badge-sm">{p.type}</span></td>
                      <td className="font-semibold">{p.type === 'fixed' ? `$${p.value}` : `${p.value}%`}</td>
                      <td>{p.currentUses}/{p.maxUses}</td>
                      <td className="text-sm">{p.startDate.toDate().toLocaleDateString()} - {p.endDate.toDate().toLocaleDateString()}</td>
                      <td><span className={`badge ${p.active ? 'badge-success' : 'badge-error'}`}>{p.active ? 'Activa' : 'Inactiva'}</span></td>
                      <td>
                        <div className="flex gap-2">
                          <button className="btn btn-sm btn-ghost" onClick={() => handleEdit(p.id!)}>Editar</button>
                          <button className="btn btn-sm btn-error btn-outline" onClick={() => { if (confirm('¿Eliminar?')) deletePromotion(p.id!); }}>Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {promotions.length === 0 && <p className="text-center py-8 text-base-content/60">No hay promociones</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

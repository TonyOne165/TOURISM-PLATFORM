import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

interface JoinRequest {
  id: string;
  name: string;
  phone: string;
  comment: string;
  read: boolean;
  responded: boolean;
  adminResponse?: string;
  createdAt: { toDate: () => Date };
}

export const AdminJoinRequests = () => {
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        let snapshot;
        try {
          snapshot = await getDocs(query(collection(db, 'join_requests'), orderBy('createdAt', 'desc')));
        } catch {
          snapshot = await getDocs(collection(db, 'join_requests'));
        }
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as JoinRequest[];
        data.sort((a, b) => {
          const aTime = a.createdAt?.toDate?.()?.getTime() || 0;
          const bTime = b.createdAt?.toDate?.()?.getTime() || 0;
          return bTime - aTime;
        });
        setRequests(data);
      } catch (err) {
        console.error('Error loading join requests:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'join_requests', id), { read: true });
      setRequests(prev => prev.map(r => r.id === id ? { ...r, read: true } : r));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleRespond = async (id: string) => {
    if (!responseText.trim()) return;
    try {
      await updateDoc(doc(db, 'join_requests', id), {
        responded: true,
        read: true,
        adminResponse: responseText.trim(),
      });
      setRequests(prev => prev.map(r => r.id === id ? { ...r, responded: true, read: true, adminResponse: responseText.trim() } : r));
      setRespondingTo(null);
      setResponseText('');
    } catch (err) {
      console.error('Error responding:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta solicitud?')) return;
    try {
      await deleteDoc(doc(db, 'join_requests', id));
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Error deleting request:', err);
    }
  };

  const filtered = requests.filter(r => {
    if (filter === 'unread') return !r.read;
    if (filter === 'read') return r.read;
    return true;
  });

  const unreadCount = requests.filter(r => !r.read).length;

  if (loading) {
    return <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Solicitudes de Contacto</h1>
          {unreadCount > 0 && <p className="text-sm text-primary mt-1">{unreadCount} sin leer</p>}
        </div>
        <span className="badge badge-lg badge-primary">{requests.length} solicitud(es)</span>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <div className="btn-group">
          <button className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter('all')}>
            Todas ({requests.length})
          </button>
          <button className={`btn btn-sm ${filter === 'unread' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter('unread')}>
            Sin leer ({unreadCount})
          </button>
          <button className={`btn btn-sm ${filter === 'read' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter('read')}>
            Leídas ({requests.length - unreadCount})
          </button>
        </div>
      </div>

      {/* Requests List */}
      {filtered.length === 0 ? (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body text-center text-base-content/60">No hay solicitudes</div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(req => (
            <div
              key={req.id}
              className={`card bg-base-100 shadow-sm ${!req.read ? 'border-l-4 border-primary' : ''}`}
            >
              <div className="card-body p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {!req.read && <span className="badge badge-primary badge-sm">Nuevo</span>}
                      {req.responded && <span className="badge badge-success badge-sm">Respondido</span>}
                      <span className="font-semibold">{req.name}</span>
                      <span className="text-sm text-base-content/50">{req.phone}</span>
                    </div>
                    {req.comment && <p className="text-sm text-base-content/80 mt-1">{req.comment}</p>}
                    {req.adminResponse && (
                      <div className="bg-base-200 rounded-lg p-3 mt-2">
                        <p className="text-xs text-base-content/50 mb-1">Respuesta del admin:</p>
                        <p className="text-sm">{req.adminResponse}</p>
                      </div>
                    )}
                    <p className="text-xs text-base-content/40 mt-2">{req.createdAt?.toDate?.()?.toLocaleString() || ''}</p>
                  </div>
                  <div className="flex gap-1">
                    {!req.read && (
                      <button className="btn btn-ghost btn-sm" onClick={() => markAsRead(req.id)}>Marcar leído</button>
                    )}
                    <button className="btn btn-ghost btn-sm text-primary" onClick={() => { setRespondingTo(respondingTo === req.id ? null : req.id); setResponseText(req.adminResponse || ''); }}>
                      {respondingTo === req.id ? 'Cancelar' : 'Responder'}
                    </button>
                    <button className="btn btn-ghost btn-sm text-error" onClick={() => handleDelete(req.id)}>Eliminar</button>
                  </div>
                </div>

                {/* Response form */}
                {respondingTo === req.id && (
                  <div className="mt-3 flex gap-2">
                    <textarea
                      className="textarea textarea-bordered flex-1 text-sm"
                      placeholder="Escribir respuesta..."
                      value={responseText}
                      onChange={e => setResponseText(e.target.value)}
                      rows={2}
                    />
                    <button className="btn btn-primary btn-sm self-end" onClick={() => handleRespond(req.id)} disabled={!responseText.trim()}>
                      Enviar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

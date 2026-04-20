import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db, COLLECTIONS } from '../../services/firebase';
import { useMessages } from '../../hooks/useMessages';
import type { User, Message } from '../../types';

export const AdminMessages = () => {
  const { messages, sendMessage, markAsRead, loading } = useMessages();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [showCompose, setShowCompose] = useState(false);
  const [form, setForm] = useState({ receiverId: '', subject: '', body: '' });
  const [sending, setSending] = useState(false);
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);
  const [modalMessage, setModalMessage] = useState<Message | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        let snap;
        try {
          snap = await getDocs(query(collection(db, COLLECTIONS.USERS), orderBy('createdAt', 'desc')));
        } catch {
          snap = await getDocs(collection(db, COLLECTIONS.USERS));
        }
        setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() })) as User[]);
      } catch (err) {
        console.error('Error loading users for messages:', err);
      }
    };
    loadUsers();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const receiver = users.find(u => u.uid === form.receiverId);
    if (!receiver) return;
    setSending(true);
    try {
      await sendMessage({
        receiverId: form.receiverId,
        receiverName: receiver.displayName || receiver.email || 'Usuario',
        subject: form.subject,
        body: form.body,
      });
      setForm({ receiverId: '', subject: '', body: '' });
      setShowCompose(false);
    } finally { setSending(false); }
  };

  const filteredMessages = selectedUser
    ? messages.filter(m => m.senderId === selectedUser || m.receiverId === selectedUser)
    : messages;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mensajería</h1>
        <button className="btn btn-primary" onClick={() => setShowCompose(!showCompose)}>
          {showCompose ? 'Cancelar' : '+ Nuevo Mensaje'}
        </button>
      </div>

      {showCompose && (
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title">Enviar Mensaje</h2>
            <form onSubmit={handleSend} className="space-y-4">
              <div className="form-control">
                <label className="label"><span className="label-text">Destinatario *</span></label>
                <select className="select select-bordered" value={form.receiverId}
                  onChange={e => setForm({ ...form, receiverId: e.target.value })} required>
                  <option value="">Seleccionar usuario</option>
                  {users.map(u => (
                    <option key={u.uid} value={u.uid}>{u.displayName || u.email} ({u.role})</option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Asunto *</span></label>
                <input type="text" className="input input-bordered" value={form.subject}
                  onChange={e => setForm({ ...form, subject: e.target.value })} required />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Mensaje *</span></label>
                <textarea className="textarea textarea-bordered h-32" value={form.body}
                  onChange={e => setForm({ ...form, body: e.target.value })} required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={sending}>
                {sending ? <span className="loading loading-spinner loading-sm"></span> : 'Enviar'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Filter by user */}
      <div className="mb-4">
        <select className="select select-bordered" value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
          <option value="">Todos los mensajes</option>
          {users.map(u => <option key={u.uid} value={u.uid}>{u.displayName || u.email}</option>)}
        </select>
      </div>

      {/* Messages list */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg"></span></div>
        ) : filteredMessages.length === 0 ? (
          <div className="card bg-base-100 shadow-sm"><div className="card-body text-center text-base-content/60">No hay mensajes</div></div>
        ) : (
          filteredMessages.map(msg => {
            const isExpanded = expandedMessage === msg.id;
            const isLong = msg.body.length > 120;
            return (
              <div
                key={msg.id}
                className={`card bg-base-100 shadow-sm cursor-pointer hover:shadow-md transition ${!msg.read ? 'border-l-4 border-primary' : ''}`}
                onClick={() => !msg.read && markAsRead(msg.id!)}
              >
                <div className="card-body p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`badge badge-sm ${msg.senderRole === 'admin' ? 'badge-primary' : 'badge-ghost'}`}>
                          {msg.senderRole === 'admin' ? 'Admin' : 'Usuario'}
                        </span>
                        <span className="font-semibold">{msg.senderName}</span>
                        <span className="text-base-content/40">→</span>
                        <span>{msg.receiverName}</span>
                      </div>
                      <h3 className="font-medium mt-1">{msg.subject}</h3>
                      <p className={`text-sm text-base-content/60 whitespace-pre-wrap ${!isExpanded && isLong ? 'line-clamp-2' : ''}`}>
                        {msg.body}
                      </p>
                      {isLong && (
                        <div className="flex gap-2 mt-1">
                          <button
                            className="text-xs text-primary hover:underline"
                            onClick={(e) => { e.stopPropagation(); setExpandedMessage(isExpanded ? null : msg.id!); }}
                          >
                            {isExpanded ? 'Ver menos' : 'Ver más'}
                          </button>
                          <button
                            className="text-xs text-secondary hover:underline"
                            onClick={(e) => { e.stopPropagation(); setModalMessage(msg); }}
                          >
                            Leer completo
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-xs text-base-content/40">{msg.createdAt.toDate().toLocaleString()}</p>
                      {!msg.read && <span className="badge badge-primary badge-sm mt-1">Nuevo</span>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Full message modal */}
      {modalMessage && (
        <div className="modal modal-open" onClick={() => setModalMessage(null)}>
          <div className="modal-box max-w-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`badge badge-sm ${modalMessage.senderRole === 'admin' ? 'badge-primary' : 'badge-ghost'}`}>
                {modalMessage.senderRole === 'admin' ? 'Admin' : 'Usuario'}
              </span>
              <span className="font-semibold">{modalMessage.senderName}</span>
              <span className="text-base-content/40">→</span>
              <span>{modalMessage.receiverName}</span>
            </div>
            <h3 className="font-bold text-lg">{modalMessage.subject}</h3>
            <p className="text-xs text-base-content/40 mb-4">{modalMessage.createdAt.toDate().toLocaleString()}</p>
            <div className="whitespace-pre-wrap text-base-content/80 leading-relaxed">{modalMessage.body}</div>
            <div className="modal-action">
              <button className="btn btn-sm" onClick={() => setModalMessage(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

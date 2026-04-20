import { useState } from 'react';
import { useMessages } from '../../hooks/useMessages';
import { useAuth } from '../../contexts/AuthContext';
import type { Message } from '../../types';

export const UserMessages = () => {
  const { user } = useAuth();
  const { messages, sendMessage, markAsRead, loading, unreadCount } = useMessages();
  const [showCompose, setShowCompose] = useState(false);
  const [form, setForm] = useState({ subject: '', body: '' });
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await sendMessage({
        receiverId: 'admin',
        receiverName: 'Soporte',
        subject: replyTo ? `Re: ${replyTo.subject}` : form.subject,
        body: form.body,
      });
      setForm({ subject: '', body: '' });
      setShowCompose(false);
      setReplyTo(null);
    } finally { setSending(false); }
  };

  const handleReply = (msg: Message) => {
    setReplyTo(msg);
    setForm({ subject: '', body: '' });
    setShowCompose(true);
  };

  const myMessages = messages.filter(m => m.senderId === user?.uid || m.receiverId === user?.uid);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Mensajes</h1>
          {unreadCount > 0 && <p className="text-sm text-primary">{unreadCount} mensaje(s) sin leer</p>}
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => { setShowCompose(!showCompose); setReplyTo(null); }}>
          {showCompose ? 'Cancelar' : 'Contactar Soporte'}
        </button>
      </div>

      {showCompose && (
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title text-lg">
              {replyTo ? `Responder a: ${replyTo.subject}` : 'Enviar Mensaje a Soporte'}
            </h2>
            {replyTo && (
              <div className="bg-base-200 p-3 rounded-lg text-sm mb-2">
                <p className="text-base-content/60">Mensaje original de {replyTo.senderName}:</p>
                <p className="mt-1 whitespace-pre-wrap">{replyTo.body}</p>
              </div>
            )}
            <form onSubmit={handleSend} className="space-y-4">
              {!replyTo && (
                <div className="form-control">
                  <label className="label"><span className="label-text">Asunto</span></label>
                  <input type="text" className="input input-bordered" value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })} required />
                </div>
              )}
              <div className="form-control">
                <label className="label"><span className="label-text">Mensaje</span></label>
                <textarea className="textarea textarea-bordered h-24" value={form.body}
                  onChange={e => setForm({ ...form, body: e.target.value })} required />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary btn-sm" disabled={sending}>
                  {sending ? <span className="loading loading-spinner loading-sm"></span> : 'Enviar'}
                </button>
                {replyTo && (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setReplyTo(null); setShowCompose(false); }}>
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg"></span></div>
      ) : myMessages.length === 0 ? (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body text-center">
            <p className="text-base-content/60 mb-3">No tienes mensajes</p>
            <button className="btn btn-primary btn-sm mx-auto" onClick={() => setShowCompose(true)}>
              Enviar tu primer mensaje
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {myMessages.map(msg => {
            const isExpanded = expandedMessage === msg.id;
            const isLong = msg.body.length > 150;
            const isFromAdmin = msg.senderRole === 'admin';
            return (
              <div
                key={msg.id}
                className={`card bg-base-100 shadow-sm hover:shadow-md transition ${!msg.read && msg.receiverId === user?.uid ? 'border-l-4 border-primary' : ''}`}
              >
                <div className="card-body p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`badge badge-sm ${msg.senderId === user?.uid ? 'badge-primary' : 'badge-ghost'}`}>
                          {msg.senderId === user?.uid ? 'Enviado' : 'Recibido'}
                        </span>
                        <span className="font-medium text-sm">
                          {msg.senderId === user?.uid ? `Para: ${msg.receiverName}` : `De: ${msg.senderName}`}
                        </span>
                      </div>
                      <h3 className="font-semibold mt-1">{msg.subject}</h3>
                      <p className={`text-sm text-base-content/60 whitespace-pre-wrap ${!isExpanded && isLong ? 'line-clamp-3' : ''}`}>
                        {msg.body}
                      </p>
                      <div className="flex gap-2 mt-2">
                        {isLong && (
                          <button
                            className="text-xs text-primary hover:underline"
                            onClick={() => setExpandedMessage(isExpanded ? null : msg.id!)}
                          >
                            {isExpanded ? 'Ver menos' : 'Ver más'}
                          </button>
                        )}
                        {isFromAdmin && msg.receiverId === user?.uid && (
                          <button
                            className="text-xs text-secondary hover:underline"
                            onClick={() => handleReply(msg)}
                          >
                            Responder
                          </button>
                        )}
                        {!msg.read && msg.receiverId === user?.uid && (
                          <button
                            className="text-xs text-accent hover:underline"
                            onClick={() => markAsRead(msg.id!)}
                          >
                            Marcar como leído
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-xs text-base-content/40">{msg.createdAt.toDate().toLocaleString()}</p>
                      {!msg.read && msg.receiverId === user?.uid && <span className="badge badge-primary badge-sm">Nuevo</span>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

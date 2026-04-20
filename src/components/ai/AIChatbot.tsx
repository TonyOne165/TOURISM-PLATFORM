import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendChatMessage } from '../../services/aiService';
import { useTours } from '../../hooks/useTours';
import { useAccommodations } from '../../hooks/useAccommodations';
import { useChatHistory } from '../../hooks/useChatHistory';
import { ChatCardComponent } from './ChatCard';
import { VoiceInput } from './VoiceInput';
import type { ChatMessage } from '../../types';

type View = 'chat' | 'history';

export const AIChatbot = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [view, setView] = useState<View>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { tours } = useTours();
  const { accommodations } = useAccommodations();

  const {
    conversations,
    activeConversationId,
    createConversation,
    getActiveMessages,
    saveMessages,
    deleteConversation,
    switchConversation,
    setActiveConversationId,
  } = useChatHistory();

  const messages = getActiveMessages();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && view === 'chat') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, view]);

  // Ensure a conversation exists when opening
  const handleOpen = () => {
    setIsOpen(true);
    setView('chat');
    if (!activeConversationId) {
      createConversation();
    }
  };

  const handleSend = async (text?: string) => {
    const msgText = (text || input).trim();
    if (!msgText || sending) return;

    // Ensure we have an active conversation
    let convId = activeConversationId;
    if (!convId) {
      convId = createConversation();
    }

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: msgText,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMsg];
    saveMessages(convId, updatedMessages);
    setInput('');
    setSending(true);

    try {
      const response = await sendChatMessage(updatedMessages, { tours, accommodations });
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.text,
        timestamp: new Date(),
        cards: response.cards,
        actions: response.actions,
        quickReplies: response.quickReplies,
      };
      saveMessages(convId, [...updatedMessages, assistantMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Lo siento, ocurrió un error. Por favor intenta de nuevo.',
        timestamp: new Date(),
        quickReplies: ['Intentar de nuevo', '¿Qué tours tienen?'],
      };
      saveMessages(convId, [...updatedMessages, errorMsg]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewConversation = () => {
    createConversation();
    setView('chat');
  };

  const handleLoadConversation = (id: string) => {
    switchConversation(id);
    setView('chat');
  };

  const handleAction = (action: { type: string; payload: string }) => {
    switch (action.type) {
      case 'navigate':
        navigate(action.payload);
        setIsOpen(false);
        break;
      case 'set_input':
        setInput(action.payload);
        break;
      case 'add_to_cart':
        navigate('/dashboard/cart');
        setIsOpen(false);
        break;
      case 'start_booking':
        handleSend(action.payload);
        break;
    }
  };

  const handleQuickReply = (text: string) => {
    handleSend(text);
  };

  const handleCardAction = (text: string) => {
    handleSend(text);
  };

  const handleVoiceTranscript = (text: string) => {
    setInput(text);
  };

  const formatTime = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();

    if (isToday) return 'Hoy';
    if (isYesterday) return 'Ayer';
    return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
  };

  // Find the last assistant message with quick replies
  const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant');
  const quickReplies = lastAssistantMsg?.quickReplies;

  return (
    <>
      {/* Toggle Button */}
      <button
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 btn btn-circle btn-lg bg-brand-blue text-white hover:bg-brand-dark border-0 shadow-2xl group"
        onClick={() => isOpen ? setIsOpen(false) : handleOpen()}
        aria-label={isOpen ? 'Cerrar chat' : 'Abrir asistente virtual'}
      >
        {isOpen ? (
          <svg className="w-6 h-6 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            {/* Notification dot for unread */}
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-brand-brown rounded-full animate-pulse" />
          </>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[400px] bg-brand-cream rounded-2xl shadow-2xl border border-brand-beige flex flex-col h-[70vh] sm:h-[550px] overflow-hidden">

          {/* ===== HEADER ===== */}
          <div className="bg-brand-dark text-white rounded-t-2xl px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="avatar placeholder">
                <div className="bg-brand-blue text-white rounded-full w-9">
                  <span className="text-sm">AI</span>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-sm">Asistente Virtual</h3>
                <p className="text-[10px] text-brand-cream/70 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                  En línea • Cartagena Tours
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {/* History button */}
              <button
                onClick={() => setView(view === 'history' ? 'chat' : 'history')}
                className={`btn btn-xs btn-ghost text-white hover:bg-white/10 ${view === 'history' ? 'bg-white/20' : ''}`}
                title="Historial"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              {/* New conversation */}
              <button
                onClick={handleNewConversation}
                className="btn btn-xs btn-ghost text-white hover:bg-white/10"
                title="Nueva conversación"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          {/* ===== HISTORY VIEW ===== */}
          {view === 'history' && (
            <div className="flex-1 overflow-y-auto">
              <div className="p-3 border-b border-brand-beige bg-brand-beige/30">
                <h4 className="font-semibold text-sm text-brand-dark">Conversaciones anteriores</h4>
                <p className="text-xs text-brand-dark/50">{conversations.length} conversación(es)</p>
              </div>
              {conversations.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <p className="text-brand-dark/50 text-sm">No hay conversaciones guardadas</p>
                  <button
                    onClick={handleNewConversation}
                    className="btn btn-sm bg-brand-blue text-white border-0 mt-3"
                  >
                    Iniciar conversación
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-brand-beige/50">
                  {conversations.map(conv => (
                    <div
                      key={conv.id}
                      className={`flex items-center justify-between p-3 hover:bg-brand-beige/30 cursor-pointer transition ${
                        conv.id === activeConversationId ? 'bg-brand-blue/10 border-l-2 border-brand-blue' : ''
                      }`}
                      onClick={() => handleLoadConversation(conv.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-brand-dark truncate">{conv.title}</p>
                        <p className="text-xs text-brand-dark/40">
                          {formatDate(conv.updatedAt)} • {conv.messages.length} mensajes
                        </p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                        className="btn btn-xs btn-ghost text-brand-dark/30 hover:text-red-500 ml-2 shrink-0"
                        title="Eliminar"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== CHAT VIEW ===== */}
          {view === 'chat' && (
            <>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* Welcome message when no messages */}
                {messages.length === 0 && (
                  <div className="text-center py-6">
                    <div className="w-14 h-14 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-3xl">👋</span>
                    </div>
                    <p className="font-semibold text-brand-dark text-sm">¡Hola! Soy tu asistente virtual</p>
                    <p className="text-xs text-brand-dark/60 mt-1 max-w-[250px] mx-auto">
                      Pregúntame sobre tours, hospedajes, precios o déjame ayudarte a planificar tu viaje
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-4 justify-center">
                      {['¿Qué tours tienen?', 'Hospedajes disponibles', 'Planificar itinerario', 'Quiero reservar'].map(q => (
                        <button
                          key={q}
                          className="btn btn-xs btn-outline border-brand-brown/40 text-brand-dark hover:bg-brand-brown hover:text-white hover:border-brand-brown rounded-full px-3"
                          onClick={() => handleSend(q)}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message list */}
                {messages.map((msg, idx) => (
                  <div key={msg.id}>
                    {/* Timestamp separator */}
                    {idx === 0 || (
                      new Date(msg.timestamp).getTime() - new Date(messages[idx - 1].timestamp).getTime() > 300000
                    ) ? (
                      <div className="text-center my-2">
                        <span className="text-[10px] text-brand-dark/30 bg-brand-beige/50 px-2 py-0.5 rounded-full">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                    ) : null}

                    {/* Message bubble */}
                    <div className={`chat ${msg.role === 'user' ? 'chat-end' : 'chat-start'}`}>
                      <div className={`chat-bubble text-sm whitespace-pre-wrap max-w-[85%] ${
                        msg.role === 'user'
                          ? 'bg-brand-blue text-white'
                          : 'bg-brand-beige text-brand-dark'
                      }`}>
                        {msg.content}
                      </div>
                    </div>

                    {/* Cards (horizontal scroll) */}
                    {msg.cards && msg.cards.length > 0 && (
                      <div className="mt-2 -mx-1 px-1">
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                          {msg.cards.map(card => (
                            <ChatCardComponent
                              key={card.id}
                              card={card}
                              onAction={handleCardAction}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2 ml-10">
                        {msg.actions.map((action, i) => (
                          <button
                            key={i}
                            onClick={() => handleAction(action)}
                            className="btn btn-xs bg-brand-blue text-white hover:bg-brand-dark border-0 rounded-full gap-1"
                          >
                            {action.icon && <span>{action.icon}</span>}
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing indicator */}
                {sending && (
                  <div className="chat chat-start">
                    <div className="chat-bubble bg-brand-beige text-brand-dark py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-brand-dark/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-brand-dark/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-brand-dark/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies */}
              {quickReplies && quickReplies.length > 0 && !sending && messages.length > 0 && (
                <div className="px-3 pb-1 flex gap-1.5 overflow-x-auto scrollbar-none shrink-0">
                  {quickReplies.map(qr => (
                    <button
                      key={qr}
                      onClick={() => handleQuickReply(qr)}
                      className="btn btn-xs btn-outline border-brand-brown/40 text-brand-dark hover:bg-brand-brown hover:text-white hover:border-brand-brown rounded-full px-3 whitespace-nowrap shrink-0"
                    >
                      {qr}
                    </button>
                  ))}
                </div>
              )}

              {/* Input Area */}
              <div className="p-3 border-t border-brand-beige shrink-0">
                <div className="flex gap-2 items-center">
                  <VoiceInput
                    onTranscript={handleVoiceTranscript}
                    disabled={sending}
                  />
                  <input
                    ref={inputRef}
                    type="text"
                    className="input input-bordered input-sm flex-1 bg-white text-brand-dark border-brand-brown/30 rounded-full"
                    placeholder="Escribe tu pregunta..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={sending}
                  />
                  <button
                    className="btn bg-brand-blue text-white hover:bg-brand-dark border-0 btn-sm btn-circle"
                    onClick={() => handleSend()}
                    disabled={!input.trim() || sending}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

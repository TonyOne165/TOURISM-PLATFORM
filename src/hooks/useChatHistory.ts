import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { ChatMessage, ChatConversation } from '../types';

const HISTORY_KEY = 'tourism_chat_history';
const ACTIVE_KEY = 'tourism_chat_active';
const MAX_CONVERSATIONS = 10;

function loadConversations(): ChatConversation[] {
  try {
    const saved = localStorage.getItem(HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveConversations(conversations: ChatConversation[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(conversations.slice(0, MAX_CONVERSATIONS)));
}

function loadActiveId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_KEY);
  } catch {
    return null;
  }
}

function generateTitle(messages: ChatMessage[]): string {
  const firstUserMsg = messages.find(m => m.role === 'user');
  if (!firstUserMsg) return 'Nueva conversación';
  const text = firstUserMsg.content.trim();
  return text.length > 40 ? text.slice(0, 40) + '...' : text;
}

export const useChatHistory = () => {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Initialize state based on authentication
  useEffect(() => {
    if (currentUser) {
      setConversations(loadConversations());
      setActiveConversationId(loadActiveId());
    } else {
      setConversations([]);
      setActiveConversationId(null);
      localStorage.removeItem(HISTORY_KEY);
      localStorage.removeItem(ACTIVE_KEY);
    }
  }, [currentUser]);

  // Persist conversations
  useEffect(() => {
    if (currentUser && conversations.length > 0) {
      saveConversations(conversations);
    } else if (!currentUser) {
      localStorage.removeItem(HISTORY_KEY);
    }
  }, [conversations, currentUser]);

  // Persist active ID
  useEffect(() => {
    if (currentUser) {
      if (activeConversationId) {
        localStorage.setItem(ACTIVE_KEY, activeConversationId);
      } else {
        localStorage.removeItem(ACTIVE_KEY);
      }
    } else {
      localStorage.removeItem(ACTIVE_KEY);
    }
  }, [activeConversationId, currentUser]);

  const createConversation = useCallback((): string => {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newConversation: ChatConversation = {
      id,
      messages: [],
      createdAt: now,
      updatedAt: now,
      title: 'Nueva conversación',
    };
    setConversations(prev => [newConversation, ...prev].slice(0, MAX_CONVERSATIONS));
    setActiveConversationId(id);
    return id;
  }, []);

  const getActiveMessages = useCallback((): ChatMessage[] => {
    if (!activeConversationId) return [];
    const conv = conversations.find(c => c.id === activeConversationId);
    return conv?.messages || [];
  }, [activeConversationId, conversations]);

  const saveMessages = useCallback((convId: string, messages: ChatMessage[]) => {
    setConversations(prev => prev.map(c => {
      if (c.id !== convId) return c;
      return {
        ...c,
        messages,
        updatedAt: new Date().toISOString(),
        title: generateTitle(messages),
      };
    }));
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId(null);
    }
  }, [activeConversationId]);

  const switchConversation = useCallback((id: string) => {
    setActiveConversationId(id);
  }, []);

  const clearHistory = useCallback(() => {
    setConversations([]);
    setActiveConversationId(null);
    localStorage.removeItem(HISTORY_KEY);
    localStorage.removeItem(ACTIVE_KEY);
  }, []);

  return {
    conversations,
    activeConversationId,
    createConversation,
    getActiveMessages,
    saveMessages,
    deleteConversation,
    switchConversation,
    clearHistory,
    setActiveConversationId,
  };
};

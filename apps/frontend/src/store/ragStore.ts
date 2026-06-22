import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RAGDocument, Conversation, ChatMessage } from '@/types/rag';

export interface RAGState {
  documents: RAGDocument[];
  conversations: Conversation[];
  messages: Record<string, ChatMessage[]>; // Keyed by conversationId
  activeConversationId: string | null;

  // Actions
  uploadDocuments: (docs: RAGDocument[]) => void;
  updateDocumentStatus: (id: string, status: RAGDocument['status']) => void;
  deleteDocument: (id: string) => void;
  
  createConversation: (title: string) => string;
  setActiveConversation: (id: string | null) => void;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  
  addMessage: (conversationId: string, message: ChatMessage) => void;
}

export const useRagStore = create<RAGState>()(
  persist(
    (set) => ({
      documents: [],
      conversations: [],
      messages: {},
      activeConversationId: null,

      uploadDocuments: (docs) => set((state) => ({
        documents: [...docs, ...state.documents],
      })),

      updateDocumentStatus: (id, status) => set((state) => ({
        documents: state.documents.map((doc) =>
          doc.id === id ? { ...doc, status } : doc
        ),
      })),

      deleteDocument: (id) => set((state) => ({
        documents: state.documents.filter((doc) => doc.id !== id),
      })),

      createConversation: (title) => {
        const id = `conv-${Date.now()}`;
        const newConv: Conversation = {
          id,
          title,
          lastMessage: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messageCount: 0,
        };

        set((state) => ({
          conversations: [newConv, ...state.conversations],
          messages: { ...state.messages, [id]: [] },
          activeConversationId: id,
        }));

        return id;
      },

      setActiveConversation: (id) => set({ activeConversationId: id }),

      deleteConversation: (id) => set((state) => {
        const newConversations = state.conversations.filter((c) => c.id !== id);
        const newMessages = { ...state.messages };
        delete newMessages[id];
        
        return {
          conversations: newConversations,
          messages: newMessages,
          activeConversationId: state.activeConversationId === id 
            ? (newConversations[0]?.id || null) 
            : state.activeConversationId,
        };
      }),

      renameConversation: (id, title) => set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === id ? { ...c, title, updatedAt: new Date().toISOString() } : c
        ),
      })),

      addMessage: (conversationId, message) => set((state) => {
        const currentMessages = state.messages[conversationId] || [];
        const newMessages = [...currentMessages, message];
        
        return {
          messages: {
            ...state.messages,
            [conversationId]: newMessages,
          },
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  lastMessage: message.content.substring(0, 50),
                  messageCount: newMessages.length,
                  updatedAt: new Date().toISOString(),
                }
              : c
          ),
        };
      }),
    }),
    {
      name: 'rag-storage',
    }
  )
);

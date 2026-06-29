import { create } from 'zustand';
import { conversationApi } from '@/services/api';
import type { RAGDocument, Conversation, ChatMessage } from '@/types/rag';

export interface RAGState {
  documents: RAGDocument[];
  conversations: Conversation[];
  messages: Record<string, ChatMessage[]>; // Keyed by conversationId
  activeConversationId: string | null;
  isLoadingConversations: boolean;

  // Actions
  setDocuments: (docs: RAGDocument[]) => void;
  uploadDocuments: (docs: RAGDocument[]) => void;
  updateDocumentStatus: (id: string, status: RAGDocument['status']) => void;
  deleteDocument: (id: string) => void;

  loadConversations: () => Promise<void>;
  createConversation: (title: string, documentIds?: string[]) => Promise<string>;
  setActiveConversation: (id: string | null) => void;
  deleteConversation: (id: string) => Promise<void>;
  renameConversation: (id: string, title: string) => Promise<void>;
  clearSession: () => void;

  addMessage: (conversationId: string, message: ChatMessage) => void;
}

export const useRagStore = create<RAGState>()(
  (set, get) => ({
    documents: [],
    conversations: [],
    messages: {},
    activeConversationId: null,
    isLoadingConversations: false,

    setDocuments: (docs) => set({ documents: docs }),

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

    loadConversations: async () => {
      set({ isLoadingConversations: true });
      try {
        const apiConversations = await conversationApi.list();
        const conversations: Conversation[] = apiConversations.map((c) => ({
          id: c.id,
          title: c.title,
          lastMessage: c.lastMessage || '',
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
          messageCount: c.messageCount || 0,
          documentIds: c.documentIds || [],
        }));

        // Reconstruct messages map from backend data
        const messages: Record<string, ChatMessage[]> = {};
        apiConversations.forEach((c) => {
          if (c.messages && c.messages.length > 0) {
            messages[c.id] = c.messages.map((m) => ({
              id: m.id || `msg-${Date.now()}-${Math.random()}`,
              role: m.role,
              content: m.content,
              timestamp: m.timestamp || c.createdAt,
              sources: m.sources ? m.sources.map((s, idx) => ({
                sourceId: idx + 1,
                score: Math.max(0, Math.min(Number(s.score) || 0, 1)),
                documentId: s.documentId,
                chunkId: '',
                sectionId: '',
                filename: s.documentName,
                text: s.snippet,
                metadata: {}
              })) : [],
            }));
          } else {
            messages[c.id] = [];
          }
        });

        set({ conversations, messages });
      } catch (error) {
        console.error('Failed to load conversations:', error);
      } finally {
        set({ isLoadingConversations: false });
      }
    },

    createConversation: async (title, documentIds = []) => {
      try {
        const apiConv = await conversationApi.create(title, documentIds);
        const newConv: Conversation = {
          id: apiConv.id,
          title: apiConv.title,
          lastMessage: '',
          createdAt: apiConv.createdAt,
          updatedAt: apiConv.updatedAt,
          messageCount: 0,
          documentIds,
        };

        set((state) => ({
          conversations: [newConv, ...state.conversations],
          messages: { ...state.messages, [apiConv.id]: [] },
          activeConversationId: apiConv.id,
        }));

        return apiConv.id;
      } catch (error) {
        console.error('Failed to create conversation:', error);
        throw error;
      }
    },

    setActiveConversation: (id) => set({ activeConversationId: id }),

    deleteConversation: async (id) => {
      try {
        await conversationApi.delete(id);
      } catch (error) {
        console.error('Failed to delete conversation from backend:', error);
      }

      set((state) => {
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
      });
    },

    renameConversation: async (id, title) => {
      try {
        await conversationApi.rename(id, title);
      } catch (error) {
        console.error('Failed to rename conversation on backend:', error);
      }

      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === id ? { ...c, title, updatedAt: new Date().toISOString() } : c
        ),
      }));
    },

    clearSession: () => {
      set({
        documents: [],
        conversations: [],
        messages: {},
        activeConversationId: null,
        isLoadingConversations: false,
      });
    },

    addMessage: (conversationId, message) => set((state) => {
      const currentMessages = state.messages[conversationId] || [];
      const newMessages = [...currentMessages, message];

      // Fire-and-forget persist to backend (don't block UI)
      conversationApi.addMessage(conversationId, {
        id: message.id,
        role: message.role,
        content: message.content,
        sources: message.sources ? message.sources.map((s) => ({
          documentId: s.documentId,
          documentName: s.filename,
          snippet: s.text,
          score: s.score
        })) : [],
        timestamp: message.timestamp,
      }).catch((err) => console.warn('Could not persist message to backend:', err));

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
  })
);

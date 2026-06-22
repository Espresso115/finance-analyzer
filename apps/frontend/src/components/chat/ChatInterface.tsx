import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PanelLeftClose,
  PanelRightClose,
  Sparkles,
  MessageSquare,
  FileText,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { SourcePanel } from './SourcePanel';
import { ConversationList } from './ConversationList';
import { NewChatModal } from './NewChatModal';
import { useRagStore } from '@/store/ragStore';
import type { ChatMessage as ChatMessageType } from '@/types/rag';

// ── Prompt suggestions ──────────────────────────────────────────────
const PROMPT_SUGGESTIONS = [
  { icon: TrendingUp, text: 'Analyze revenue trends across quarters' },
  { icon: BarChart3, text: 'Compare operating margins year-over-year' },
  { icon: FileText, text: 'Summarize risk factors from the annual report' },
  { icon: MessageSquare, text: 'What are the key competitive advantages?' },
];

// ── Sidebar animation variants ──────────────────────────────────────
const sidebarVariants = {
  open: (width: number) => ({
    width,
    opacity: 1,
    transition: { duration: 0.25, ease: "easeInOut" as const },
  }),
  closed: {
    width: 0,
    opacity: 0,
    transition: { duration: 0.2, ease: "easeInOut" as const },
  },
};

export function ChatInterface() {
  const { conversations, messages, activeConversationId, setActiveConversation, addMessage, deleteConversation, renameConversation } = useRagStore();
  
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [selectedMessageSources, setSelectedMessageSources] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeMessages = activeConversationId ? (messages[activeConversationId] || []) : [];
  const activeConversation = conversations.find(c => c.id === activeConversationId);

  useEffect(() => {
    const handler = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setLeftSidebarOpen(false);
        setRightSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  const handleSend = useCallback(
    (text: string) => {
      if (!activeConversationId) return;

      const userMsg: ChatMessageType = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: text,
        timestamp: new Date().toISOString(),
      };
      
      addMessage(activeConversationId, userMsg);

      // Simulate assistant response after a short delay
      setTimeout(() => {
        const assistantMsg: ChatMessageType = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: 'This is a simulated response. In a real RAG application, I would retrieve context from your uploaded documents and generate an answer based on that information.',
          timestamp: new Date().toISOString(),
          sources: [], // Sources from backend
        };
        addMessage(activeConversationId, assistantMsg);
      }, 1200);
    },
    [activeConversationId, addMessage]
  );

  const handleMessageClick = useCallback(
    (msg: ChatMessageType) => {
      if (msg.sources && msg.sources.length > 0) {
        setSelectedMessageSources(msg.sources);
        setRightSidebarOpen(true);
      }
    },
    []
  );

  const hasMessages = activeMessages.length > 0;

  return (
    <div className="flex h-full overflow-hidden rounded-sm border border-border relative bg-background shadow-sm">
      <NewChatModal 
        isOpen={isNewChatModalOpen} 
        onClose={() => setIsNewChatModalOpen(false)} 
        onChatCreated={(id) => {
          setIsNewChatModalOpen(false);
          setActiveConversation(id);
          if (isMobile) setLeftSidebarOpen(false);
        }}
      />

      {/* ── Mobile overlay backdrop ── */}
      <AnimatePresence>
        {isMobile && (leftSidebarOpen || rightSidebarOpen) && (
          <motion.div
            key="backdrop"
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setLeftSidebarOpen(false);
              setRightSidebarOpen(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Left Sidebar: Conversations ── */}
      <AnimatePresence initial={false}>
        {leftSidebarOpen && (
          <motion.div
            key="left-sidebar"
            custom={280}
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className={cn(
              'flex-shrink-0 overflow-hidden bg-card border-r border-border',
              isMobile && 'fixed left-0 top-0 bottom-0 z-50 bg-background/95'
            )}
          >
            <div className="w-[280px] h-full">
              <ConversationList
                conversations={conversations}
                activeId={activeConversationId}
                onSelect={(id) => {
                  setActiveConversation(id);
                  if (isMobile) setLeftSidebarOpen(false);
                }}
                onNew={() => setIsNewChatModalOpen(true)}
                onRename={renameConversation}
                onDelete={deleteConversation}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Chat Area ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-background relative">
        {!activeConversationId ? (
          <div className="flex flex-col items-center justify-center h-full px-4 text-center animate-in fade-in zoom-in duration-500">
             <div className="w-16 h-16 rounded bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
                <Sparkles className="w-8 h-8 text-primary" />
             </div>
             <h2 className="text-2xl font-bold tracking-tight mb-2">Document Intelligence</h2>
             <p className="text-muted-foreground text-sm max-w-md mb-8">
               Query your uploaded financial documents, reports, and models. 
               Get instant, cited analytics based on your proprietary data.
             </p>
             <div className="flex gap-4">
               <Button onClick={() => setIsNewChatModalOpen(true)} className="gap-2 shadow-sm border border-transparent">
                 <MessageSquare className="w-4 h-4" />
                 New Analysis
               </Button>
             </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-card flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
              >
                <PanelLeftClose
                  className={cn(
                    'w-4 h-4 transition-transform',
                    !leftSidebarOpen && 'rotate-180'
                  )}
                />
              </Button>

              <div className="flex-1 min-w-0 text-center">
                <h2 className="text-sm font-semibold text-foreground truncate">
                  {activeConversation?.title || 'Conversation'}
                </h2>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
              >
                <PanelRightClose
                  className={cn(
                    'w-4 h-4 transition-transform',
                    !rightSidebarOpen && 'rotate-180'
                  )}
                />
              </Button>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto">
              {hasMessages ? (
                <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                  {activeMessages.map((msg) => (
                    <div
                      key={msg.id}
                      onClick={() => handleMessageClick(msg)}
                      className={cn(
                        msg.sources && msg.sources.length > 0 && 'cursor-pointer'
                      )}
                    >
                      <ChatMessage message={msg} />
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                /* Empty state for a new conversation */
                <div className="flex flex-col items-center justify-center h-full px-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="text-center max-w-md"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Start asking questions
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      The AI will retrieve relevant sections from your attached documents and provide cited answers.
                    </p>

                    {/* Suggestion chips */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {PROMPT_SUGGESTIONS.map(({ icon: Icon, text }) => (
                        <button
                          key={text}
                          onClick={() => handleSend(text)}
                          className="glass rounded-xl px-3 py-2.5 text-xs text-left text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all duration-200 flex items-center gap-2 group"
                        >
                          <Icon className="w-4 h-4 text-primary/60 group-hover:text-primary flex-shrink-0" />
                          {text}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </div>
              )}
            </div>

            {/* Input area */}
            <div className="border-t border-border bg-card px-4 py-3 flex-shrink-0">
              <div className="max-w-3xl mx-auto">
                <ChatInput
                  onSend={handleSend}
                  placeholder="Ask a question..."
                  // In a real app we would pass the actual attached documents names
                  selectedDocuments={[]} 
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Right Sidebar: Sources ── */}
      <AnimatePresence initial={false}>
        {rightSidebarOpen && (
          <motion.div
            key="right-sidebar"
            custom={320}
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className={cn(
              'flex-shrink-0 overflow-hidden border-l border-border bg-card',
              isMobile && 'fixed right-0 top-0 bottom-0 z-50 bg-background/95'
            )}
          >
            <div className="w-[320px] h-full">
              <SourcePanel
                sources={selectedMessageSources}
                onClose={() => setRightSidebarOpen(false)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


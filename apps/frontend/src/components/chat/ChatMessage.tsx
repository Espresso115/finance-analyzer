import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, User, ChevronDown, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { ChatMessage as ChatMessageType } from '@/types/rag';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
      className={cn('flex gap-3 max-w-[85%]', isUser ? 'ml-auto flex-row-reverse' : '')}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1',
          isUser ? 'bg-primary' : 'bg-primary/15'
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-primary-foreground" />
        ) : (
          <Bot className="w-4 h-4 text-primary" />
        )}
      </div>

      {/* Message bubble */}
      <div className="flex flex-col gap-1 min-w-0">
        <div
          className={cn(
            'rounded-sm px-4 py-3 text-[13px] leading-relaxed border',
            isUser
              ? 'bg-secondary border-border text-foreground'
              : 'bg-card border-border text-foreground shadow-sm'
          )}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>

          {/* Streaming cursor */}
          {message.isStreaming && (
            <span className="inline-flex ml-1">
              <span className="w-2 h-4 bg-current opacity-70 animate-pulse rounded-sm" />
            </span>
          )}
        </div>

        {/* Sources badge */}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-1">
            <button
              onClick={() => setSourcesOpen(!sourcesOpen)}
              className="inline-flex items-center gap-1.5 group"
            >
              <Badge variant="info" className="cursor-pointer gap-1 text-[11px]">
                <FileText className="w-3 h-3" />
                {message.sources.length} source{message.sources.length !== 1 ? 's' : ''}
                <ChevronDown
                  className={cn(
                    'w-3 h-3 transition-transform duration-200',
                    sourcesOpen && 'rotate-180'
                  )}
                />
              </Badge>
            </button>

            {/* Expanded sources */}
            {sourcesOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-2 space-y-2"
              >
                {message.sources.map((source) => (
                  <div
                    key={source.sourceId}
                    className="glass rounded-lg px-3 py-2 text-xs text-muted-foreground"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-3 h-3 text-primary" />
                      <span className="font-medium text-foreground">{source.filename}</span>
                      {source.pageNo && (
                        <span className="text-muted-foreground">p.{source.pageNo}</span>
                      )}
                      <Badge variant="outline" className="ml-auto text-[10px] px-1.5 py-0">
                        {Math.round(source.score * 100)}%
                      </Badge>
                    </div>
                    <p className="line-clamp-2 text-muted-foreground/80">{source.text}</p>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        )}

        {/* Timestamp */}
        <span
          className={cn(
            'text-[10px] text-muted-foreground/60 mt-0.5 px-1',
            isUser ? 'text-right' : 'text-left'
          )}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </motion.div>
  );
}

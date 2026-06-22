import { useState, useRef, useCallback, type KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { Send, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  selectedDocuments?: string[];
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Ask a question about your documents...',
  selectedDocuments = [],
}: ChatInputProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    // max 4 lines (~96px)
    el.style.height = Math.min(el.scrollHeight, 96) + 'px';
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [text, disabled, onSend]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = text.trim().length > 0 && !disabled;

  return (
    <div className="w-full">
      {/* Selected document chips */}
      {selectedDocuments.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2 px-1">
          {selectedDocuments.map((doc) => (
            <Badge key={doc} variant="info" className="text-[11px] gap-1">
              <Paperclip className="w-3 h-3" />
              {doc}
            </Badge>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="bg-card border border-border rounded-sm flex items-end gap-2 p-1.5 transition-all duration-200 focus-within:border-primary/50 shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-primary rounded-sm"
          disabled={disabled}
        >
          <Paperclip className="w-3.5 h-3.5" />
        </Button>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            adjustHeight();
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={cn(
            'flex-1 resize-none bg-transparent border-0 outline-none text-sm text-foreground placeholder:text-muted-foreground/60',
            'py-2 px-1 min-h-[36px] max-h-[96px] leading-relaxed'
          )}
        />

        <motion.div whileHover={canSend ? { scale: 1.02 } : {}} whileTap={canSend ? { scale: 0.98 } : {}}>
          <Button
            size="icon"
            className={cn(
              'h-8 w-8 rounded-sm flex-shrink-0 transition-all duration-200',
              canSend
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
                : 'bg-secondary text-muted-foreground cursor-not-allowed'
            )}
            disabled={!canSend}
            onClick={handleSend}
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </motion.div>
      </div>

      <p className="text-[10px] text-muted-foreground/50 text-center mt-1.5">
        Press Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}

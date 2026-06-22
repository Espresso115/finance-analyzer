import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Plus, Clock, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { Conversation } from '@/types/rag';

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onRename: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  onNew,
  onRename,
  onDelete,
}: ConversationListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const startEdit = (conv: Conversation) => {
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const saveEdit = (id: string) => {
    if (editTitle.trim()) {
      onRename(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="h-full flex flex-col glass-strong rounded-r-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Conversations</h3>
        </div>
        <Button
          size="sm"
          className="h-7 text-xs gap-1 rounded-lg"
          onClick={onNew}
        >
          <Plus className="w-3 h-3" />
          New
        </Button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {conversations.length === 0 ? (
          <div className="text-center py-6 text-sm text-muted-foreground">
            No conversations yet.
          </div>
        ) : (
          conversations.map((conv, index) => (
            <motion.div
              key={conv.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.04 }}
              className={cn(
                'w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 group flex flex-col relative',
                activeId === conv.id
                  ? 'bg-primary/10 border border-primary/20'
                  : 'hover:bg-secondary/50 border border-transparent'
              )}
            >
              {/* Title row */}
              <div className="flex items-center gap-2 mb-1 w-full cursor-pointer" onClick={() => onSelect(conv.id)}>
                {editingId === conv.id ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => saveEdit(conv.id)}
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit(conv.id)}
                    className="flex-1 bg-background text-sm rounded px-1 py-0.5 outline-none border border-primary/50"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span
                    className={cn(
                      'text-sm font-medium truncate flex-1',
                      activeId === conv.id ? 'text-primary' : 'text-foreground'
                    )}
                  >
                    {conv.title}
                  </span>
                )}
                
                {/* Actions Dropdown */}
                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreVertical className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); startEdit(conv); }} className="cursor-pointer text-xs">
                        <Edit2 className="w-3 h-3 mr-2" /> Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }} className="cursor-pointer text-xs text-destructive focus:text-destructive">
                        <Trash2 className="w-3 h-3 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Preview */}
              {conv.lastMessage && (
                <p className="text-xs text-muted-foreground truncate cursor-pointer" onClick={() => onSelect(conv.id)}>{conv.lastMessage}</p>
              )}

              {/* Timestamp */}
              <div className="flex items-center justify-between mt-1.5 text-[10px] text-muted-foreground/50">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>
                    {new Date(conv.updatedAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                {conv.messageCount > 0 && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    {conv.messageCount} msg
                  </Badge>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

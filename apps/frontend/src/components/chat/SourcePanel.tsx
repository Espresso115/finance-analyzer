import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Hash, BookOpen, ChevronDown, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { RetrievedSource } from '@/types/rag';

// ── Mock data for display removed ──

// ── Helpers ─────────────────────────────────────────────────────────
function getScoreColor(score: number) {
  if (score >= 0.8) return { text: 'text-emerald-400', bg: 'bg-emerald-500', label: 'High' };
  if (score >= 0.5) return { text: 'text-amber-400', bg: 'bg-amber-500', label: 'Medium' };
  return { text: 'text-red-400', bg: 'bg-red-500', label: 'Low' };
}

// ── Source card ──────────────────────────────────────────────────────
function SourceCard({ source }: { source: RetrievedSource }) {
  const [expanded, setExpanded] = useState(false);
  const scoreInfo = getScoreColor(source.score);
  const percentage = Math.round(source.score * 100);

  return (
    <Card className="glass border-border/40 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-3 flex items-start gap-3 hover:bg-secondary/30 transition-colors"
      >
        {/* Expand chevron */}
        <div className="mt-0.5 flex-shrink-0 text-muted-foreground">
          {expanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Heading & file info */}
          <div className="flex items-center gap-2 flex-wrap">
            {source.heading && (
              <span className="text-sm font-medium text-foreground">{source.heading}</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <FileText className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{source.filename}</span>
            {source.pageNo && (
              <>
                <Hash className="w-3 h-3 flex-shrink-0 ml-1" />
                <span>p.{source.pageNo}</span>
              </>
            )}
          </div>
        </div>

        {/* Score */}
        <div className="flex-shrink-0 flex flex-col items-end gap-1">
          <Badge
            variant={
              scoreInfo.label === 'High'
                ? 'success'
                : scoreInfo.label === 'Medium'
                ? 'warning'
                : 'destructive'
            }
            className="text-[10px] px-1.5 py-0"
          >
            {percentage}%
          </Badge>
        </div>
      </button>

      {/* Score bar */}
      <div className="px-3 pb-2">
        <Progress
          value={percentage}
          className={cn('h-1', scoreInfo.bg.replace('bg-', '[&>div]:bg-'))}
        />
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-1 border-t border-border/30">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                <BookOpen className="w-3 h-3" />
                <span className="font-medium">Source excerpt</span>
              </div>
              <p className="text-xs text-muted-foreground/90 leading-relaxed">
                {source.text}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

// ── Source Panel ─────────────────────────────────────────────────────
interface SourcePanelProps {
  sources?: RetrievedSource[];
  onClose?: () => void;
}

export function SourcePanel({ sources = [], onClose }: SourcePanelProps) {
  return (
    <div className="h-full flex flex-col glass-strong rounded-l-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Sources</h3>
          <Badge variant="secondary" className="text-[10px]">
            {sources.length}
          </Badge>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-secondary/60"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Source list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {sources.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground/60">No sources retrieved</p>
          </div>
        ) : (
          sources.map((source) => <SourceCard key={source.sourceId} source={source} />)
        )}
      </div>

      {/* Legend */}
      <div className="px-4 py-2 border-t border-border/50 flex-shrink-0">
        <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground/60">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> High
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Medium
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" /> Low
          </span>
        </div>
      </div>
    </div>
  );
}

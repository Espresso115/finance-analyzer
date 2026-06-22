import { motion } from 'framer-motion';
import { FileText, MoreVertical, Trash2, Eye, Download } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import type { RAGDocument } from '@/types/rag';
import { cn } from '@/lib/utils';

interface DocumentTableProps {
  documents: RAGDocument[];
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

const statusConfig = {
  indexed: { color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', label: 'Indexed' },
  processing: { color: 'bg-blue-500/10 text-blue-500 border-blue-500/20 animate-pulse', label: 'Processing' },
  pending: { color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', label: 'Pending' },
  failed: { color: 'bg-destructive/10 text-destructive border-destructive/20', label: 'Failed' },
  uploading: { color: 'bg-primary/10 text-primary border-primary/20', label: 'Uploading' },
};

export function DocumentTable({ documents, onDelete, onView }: DocumentTableProps) {
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full border border-border rounded-sm overflow-hidden bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="text-[11px] text-muted-foreground uppercase tracking-wider bg-secondary border-b border-border">
            <tr>
              <th scope="col" className="px-4 py-2 font-semibold">Name</th>
              <th scope="col" className="px-4 py-2 font-semibold">Size</th>
              <th scope="col" className="px-4 py-2 font-semibold">Status</th>
              <th scope="col" className="px-4 py-2 font-semibold">Uploaded</th>
              <th scope="col" className="px-4 py-2 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {documents.map((doc, index) => {
              const status = statusConfig[doc.status];
              return (
                <motion.tr
                  key={doc.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15, delay: index * 0.03 }}
                  className="hover:bg-secondary/40 transition-colors group text-[13px]"
                >
                  <td className="px-4 py-2 align-middle">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground leading-tight">{doc.filename}</span>
                        <span className="text-[10px] text-muted-foreground uppercase leading-tight mt-0.5">{doc.fileType}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-muted-foreground align-middle">
                    {formatSize(doc.fileSize)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap align-middle">
                    <Badge variant="outline" className={cn("font-medium text-[10px] px-1.5 py-0 rounded-sm leading-relaxed", status.color)}>
                      {status.label}
                    </Badge>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-muted-foreground align-middle">
                    {format(new Date(doc.uploadedAt), 'MMM d, yyyy HH:mm')}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-right align-middle">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity rounded-sm">
                          <MoreVertical className="w-3.5 h-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 rounded-sm">
                        <DropdownMenuItem onClick={() => onView(doc.id)} className="cursor-pointer text-xs">
                          <Eye className="w-3.5 h-3.5 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-xs">
                          <Download className="w-3.5 h-3.5 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(doc.id)} className="text-destructive focus:text-destructive cursor-pointer text-xs">
                          <Trash2 className="w-3.5 h-3.5 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

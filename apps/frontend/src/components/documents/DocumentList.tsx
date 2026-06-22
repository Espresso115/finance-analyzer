import { Inbox } from 'lucide-react';
import { DocumentTable } from './DocumentTable';
import { useRagStore } from '@/store/ragStore';

export function DocumentList() {
  const documents = useRagStore(state => state.documents);
  const deleteDocument = useRagStore(state => state.deleteDocument);

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center glass rounded-xl border-dashed">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <Inbox className="w-10 h-10 text-primary opacity-80" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No documents found</h3>
        <p className="text-muted-foreground max-w-sm mb-6">
          You haven't uploaded any documents yet, or none match your current filters.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <DocumentTable 
        documents={documents}
        onDelete={(id) => deleteDocument(id)}
        onView={(id) => console.log('View document details', id)}
      />
    </div>
  );
}

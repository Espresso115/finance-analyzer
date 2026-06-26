import { useEffect, useState } from 'react';
import { Inbox, AlertTriangle, RefreshCw } from 'lucide-react';
import { DocumentTable } from './DocumentTable';
import { useRagStore } from '@/store/ragStore';
import { documentApi, getApiErrorMessage } from '@/services/api';
import { Button } from '@/components/ui/button';

export function DocumentList() {
  const documents = useRagStore(state => state.documents);
  const setDocuments = useRagStore(state => state.setDocuments);
  const deleteDocument = useRagStore(state => state.deleteDocument);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = () => {
    setIsLoading(true);
    setError(null);
    let isMounted = true;

    documentApi.list()
      .then((serverDocuments) => {
        if (isMounted) {
          setDocuments(serverDocuments);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(getApiErrorMessage(err));
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => { isMounted = false; };
  };

  useEffect(() => {
    return fetchDocuments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setDocuments]);

  const handleDelete = async (id: string) => {
    await documentApi.delete(id);
    deleteDocument(id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
        Loading documents...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center glass rounded-xl border-dashed border-destructive/30">
        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-10 h-10 text-destructive opacity-80" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Failed to load documents</h3>
        <p className="text-muted-foreground max-w-sm mb-6">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchDocuments} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Retry
        </Button>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center glass rounded-xl border-dashed">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <Inbox className="w-10 h-10 text-primary opacity-80" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No documents found</h3>
        <p className="text-muted-foreground max-w-sm mb-6">
          You haven't uploaded any documents yet.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <DocumentTable 
        documents={documents}
        onDelete={handleDelete}
      />
    </div>
  );
}

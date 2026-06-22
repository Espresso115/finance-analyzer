import { AppShell } from '../components/AppShell';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { DocumentUpload } from '../components/documents/DocumentUpload';
import { DocumentList } from '../components/documents/DocumentList';
import { DocumentFilters } from '../components/documents/DocumentFilters';

export function DocumentsPage() {
  return (
    <AppShell>
      <div className="space-y-8 animate-in fade-in duration-500 pb-10">
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
              Document Management
            </h2>
            <p className="text-muted-foreground mt-1.5 flex items-center gap-2">
              Upload, process, and manage documents for AI analysis.
            </p>
          </div>
        </section>

        <div className="w-full">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-8">
              <TabsTrigger value="all">All Documents</TabsTrigger>
              <TabsTrigger value="upload">Upload New</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-6">
              <DocumentFilters />
              <DocumentList />
            </TabsContent>
            
            <TabsContent value="upload">
              <DocumentUpload />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppShell>
  );
}

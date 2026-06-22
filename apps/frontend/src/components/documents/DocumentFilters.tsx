import { Search, Filter } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

export function DocumentFilters() {
  return (
    <div className="flex flex-col md:flex-row gap-4 w-full mb-6 glass p-4 rounded-xl">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search documents by name or content..." 
          className="pl-9 bg-background/50 border-border/50"
        />
      </div>
      
      <div className="flex items-center gap-3">
        <select className="h-10 px-3 py-2 rounded-md border border-input bg-background/50 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 w-[140px]">
          <option value="all">All Statuses</option>
          <option value="indexed">Indexed</option>
          <option value="processing">Processing</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
        
        <select className="h-10 px-3 py-2 rounded-md border border-input bg-background/50 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 w-[140px]">
          <option value="all">All File Types</option>
          <option value="pdf">PDF</option>
          <option value="docx">DOCX</option>
          <option value="txt">TXT</option>
          <option value="csv">CSV</option>
        </select>

        <Button variant="outline" size="icon" className="shrink-0 bg-background/50">
          <Filter className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

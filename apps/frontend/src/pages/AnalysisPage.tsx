import { AppShell } from '../components/AppShell';
import { ChatInterface } from '../components/chat/ChatInterface';

export function AnalysisPage() {
  return (
    <AppShell>
      <div className="animate-in fade-in duration-500 h-[calc(100vh-7.5rem)]">
        <ChatInterface />
      </div>
    </AppShell>
  );
}

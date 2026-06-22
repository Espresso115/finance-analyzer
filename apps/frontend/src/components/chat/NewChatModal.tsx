import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, FileText, CheckCircle2, Loader2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRagStore } from '@/store/ragStore';
import type { RAGDocument } from '@/types/rag';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChatCreated: (conversationId: string) => void;
}

export function NewChatModal({ isOpen, onClose, onChatCreated }: NewChatModalProps) {
  const { documents, uploadDocuments, createConversation } = useRagStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [processingState, setProcessingState] = useState<'idle' | 'parsing' | 'chunking' | 'embedding' | 'ready'>('idle');

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedDocs([]);
      setProcessingState('idle');
    }
  }, [isOpen]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newDocs: RAGDocument[] = Array.from(e.target.files).map((file) => ({
        id: `doc-${Date.now()}-${file.name}`,
        filename: file.name,
        fileType: file.name.split('.').pop() as any || 'txt',
        fileSize: file.size,
        status: 'indexed', // Simulate pre-indexed for simplicity here
        chunkCount: Math.floor(Math.random() * 50) + 10,
        uploadedAt: new Date().toISOString(),
        tags: [],
      }));
      
      uploadDocuments(newDocs);
      setSelectedDocs(prev => [...prev, ...newDocs.map(d => d.id)]);
    }
  };

  const startProcessing = () => {
    if (selectedDocs.length === 0) return;
    setStep(2);
    setProcessingState('parsing');
    
    setTimeout(() => setProcessingState('chunking'), 1000);
    setTimeout(() => setProcessingState('embedding'), 2200);
    setTimeout(() => {
      setProcessingState('ready');
      setTimeout(() => {
        // Create conversation
        const title = `Chat about ${documents.find(d => d.id === selectedDocs[0])?.filename || 'Documents'}`;
        const convId = createConversation(title);
        onChatCreated(convId);
      }, 800);
    }, 3500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg glass-strong rounded-2xl border border-border/50 shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
          <h2 className="text-lg font-semibold text-foreground">New Chat</h2>
          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full" onClick={onClose} disabled={step === 2}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-foreground">Select existing documents</h3>
                  {documents.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No documents available.</p>
                  ) : (
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                      {documents.map((doc) => (
                        <div
                          key={doc.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedDocs.includes(doc.id) ? 'border-primary bg-primary/10' : 'border-border/50 hover:bg-secondary/50'
                          }`}
                          onClick={() => {
                            setSelectedDocs(prev => 
                              prev.includes(doc.id) ? prev.filter(id => id !== doc.id) : [...prev, doc.id]
                            );
                          }}
                        >
                          <FileText className={`w-5 h-5 ${selectedDocs.includes(doc.id) ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span className="text-sm font-medium truncate flex-1">{doc.filename}</span>
                          {selectedDocs.includes(doc.id) && <CheckCircle2 className="w-4 h-4 text-primary" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-border/50"></div>
                  <span className="flex-shrink-0 mx-4 text-muted-foreground text-xs uppercase tracking-wider">or</span>
                  <div className="flex-grow border-t border-border/50"></div>
                </div>

                <div>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border/50 rounded-xl hover:bg-secondary/50 hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 text-muted-foreground mb-3" />
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold text-primary">Click to upload</span> new documents
                      </p>
                    </div>
                    <input type="file" className="hidden" multiple accept=".pdf,.docx,.txt,.csv" onChange={handleFileSelect} />
                  </label>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="py-8 flex flex-col items-center justify-center space-y-8"
              >
                <div className="relative flex items-center justify-center w-24 h-24">
                  {processingState === 'ready' ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center"
                    >
                      <CheckCircle2 className="w-8 h-8 text-primary" />
                    </motion.div>
                  ) : (
                    <>
                      <Loader2 className="w-12 h-12 text-primary animate-spin absolute" />
                      <FileText className="w-6 h-6 text-primary absolute" />
                    </>
                  )}
                </div>

                <div className="space-y-4 w-full max-w-xs mx-auto">
                  <ProcessingStep label="Parsing documents" active={processingState === 'parsing'} done={['chunking', 'embedding', 'ready'].includes(processingState)} />
                  <ProcessingStep label="Chunking content" active={processingState === 'chunking'} done={['embedding', 'ready'].includes(processingState)} />
                  <ProcessingStep label="Generating embeddings" active={processingState === 'embedding'} done={processingState === 'ready'} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {step === 1 && (
          <div className="p-4 border-t border-border/50 bg-secondary/20 flex justify-end">
            <Button onClick={startProcessing} disabled={selectedDocs.length === 0} className="w-full sm:w-auto glow-sm gap-2">
              <Play className="w-4 h-4" /> Start Chat
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function ProcessingStep({ label, active, done }: { label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${done ? 'bg-primary/20 text-primary' : active ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
        {done ? <CheckCircle2 className="w-3 h-3" /> : <div className={`w-2 h-2 rounded-full ${active ? 'bg-current animate-pulse' : 'bg-current'}`} />}
      </div>
      <span className={`text-sm ${active ? 'text-foreground font-medium' : done ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
    </div>
  );
}

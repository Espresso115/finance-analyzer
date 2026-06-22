// Document types
export type DocumentStatus = 'uploading' | 'pending' | 'processing' | 'indexed' | 'failed';

export type FileType = 'pdf' | 'docx' | 'txt' | 'md' | 'csv';

export interface RAGDocument {
  id: string;
  filename: string;
  fileType: FileType;
  fileSize: number;
  status: DocumentStatus;
  chunkCount: number;
  uploadedAt: string;
  processedAt?: string;
  tags: string[];
  description?: string;
  preview?: string;
}

// Query/Chat types
export interface RetrievedSource {
  sourceId: number;
  score: number;
  documentId: string;
  chunkId: string;
  sectionId: string;
  heading?: string;
  pageNo?: number;
  filename?: string;
  text: string;
  metadata: Record<string, unknown>;
}

export interface QueryRequest {
  question: string;
  topK?: number;
  documentIds?: string[];
  generateAnswer?: boolean;
  conversationId?: string;
}

export interface QueryResponse {
  question: string;
  answer: string;
  provider: string;
  sources: RetrievedSource[];
  prompt?: string;
  conversationId?: string;
  cached: boolean;
}

// Chat types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: RetrievedSource[];
  timestamp: string;
  isStreaming?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

// Index stats
export interface IndexStats {
  totalDocuments: number;
  totalChunks: number;
  lastUpdated: string;
}

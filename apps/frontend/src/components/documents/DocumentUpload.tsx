import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { documentApi, getApiErrorMessage } from '@/services/api';
import { useRagStore } from '@/store/ragStore';

export function DocumentUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<Array<{ file: File; progress: number; status: 'uploading' | 'done' | 'error'; error?: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadDocuments = useRagStore((state) => state.uploadDocuments);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (newFiles: File[]) => {
    const validTypes = ['application/pdf'];
    
    const fileObjects = newFiles.filter(file => validTypes.includes(file.type) || file.name.toLowerCase().endsWith('.pdf')).map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const
    }));

    if (!fileObjects.length) {
      return;
    }

    setFiles(prev => [...prev, ...fileObjects]);

    try {
      const uploadedDocuments = await documentApi.upload(
        fileObjects.map((fileObj) => fileObj.file),
        (progress) => {
          setFiles(prev => prev.map(f =>
            fileObjects.some(fileObj => fileObj.file === f.file)
              ? { ...f, progress }
              : f
          ));
        }
      );

      uploadDocuments(uploadedDocuments);
      setFiles(prev => prev.map(f =>
        fileObjects.some(fileObj => fileObj.file === f.file)
          ? { ...f, progress: 100, status: 'done' }
          : f
      ));
    } catch (error) {
      const message = getApiErrorMessage(error);
      setFiles(prev => prev.map(f =>
        fileObjects.some(fileObj => fileObj.file === f.file)
          ? { ...f, status: 'error', error: message }
          : f
      ));
    }
  };

  const removeFile = (fileToRemove: File) => {
    setFiles(prev => prev.filter(f => f.file !== fileToRemove));
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className={`glass p-8 transition-colors duration-200 border-2 border-dashed ${isDragging ? 'border-primary bg-primary/5' : 'border-border'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-1">Upload Documents</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop files here, or click to select files
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <Badge variant="outline">PDF</Badge>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              multiple 
              accept=".pdf,application/pdf" 
              onChange={handleFileInput}
            />
            <Button onClick={() => fileInputRef.current?.click()} className="glow-sm">
              Select Files
            </Button>
          </div>
        </div>
      </Card>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Upload Queue</h4>
            {files.map((fileObj, idx) => (
              <motion.div 
                key={`${fileObj.file.name}-${idx}`}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="p-4 flex items-center gap-4 glass-strong">
                  <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm truncate">{fileObj.file.name}</p>
                      <button onClick={() => removeFile(fileObj.file)} className="text-muted-foreground hover:text-foreground">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span>{formatSize(fileObj.file.size)}</span>
                      <div className="flex items-center gap-1">
                        {fileObj.status === 'uploading' && <span>{Math.round(fileObj.progress)}%</span>}
                        {fileObj.status === 'done' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                        {fileObj.status === 'error' && <AlertCircle className="w-3.5 h-3.5 text-destructive" />}
                      </div>
                    </div>
                    {fileObj.error && (
                      <p className="text-xs text-destructive mb-2">{fileObj.error}</p>
                    )}
                    <Progress value={fileObj.progress} className="h-1.5" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

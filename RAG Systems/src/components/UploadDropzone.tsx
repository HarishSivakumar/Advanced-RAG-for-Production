'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { UploadCloud, File as FileIcon, X, Loader2, CheckCircle2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const MAX_FILES = 50;
const MAX_TOTAL_SIZE = 25 * 1024 * 1024; // 25MB

export function UploadDropzone() {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>('');
  const [uploadedDocs, setUploadedDocs] = useState<any[]>([]);
  const [isFetchingDocs, setIsFetchingDocs] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    setIsFetchingDocs(true);
    try {
      const res = await fetch('/api/documents');
      const data = await res.json();
      if (data.documents) {
        setUploadedDocs(data.documents);
      }
    } catch (err) {
      console.error('Failed to fetch documents', err);
    } finally {
      setIsFetchingDocs(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const totalSize = files.reduce((acc, file) => acc + file.size, 0);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateAndAddFiles = (newFiles: File[]) => {
    if (files.length + newFiles.length > MAX_FILES) {
      toast.error(`You can only upload a maximum of ${MAX_FILES} files.`);
      return;
    }

    const newTotalSize = totalSize + newFiles.reduce((acc, file) => acc + file.size, 0);
    if (newTotalSize > MAX_TOTAL_SIZE) {
      toast.error('Total file size cannot exceed 25MB.');
      return;
    }

    // Filter to only allow PDFs for this pipeline
    const validFiles = newFiles.filter(file => file.type === 'application/pdf');
    if (validFiles.length !== newFiles.length) {
      toast.warning('Only PDF files are supported currently. Non-PDFs were skipped.');
    }

    setFiles(prev => [...prev, ...validFiles]);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      validateAndAddFiles(droppedFiles);
    }
  }, [files, totalSize]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      validateAndAddFiles(selectedFiles);
    }
    // Reset input so the same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (indexToRemove: number) => {
    setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setProgress(10);
    setStatus('Initializing upload...');

    const formData = new FormData();
    files.forEach(file => {
      formData.append('documents', file);
    });

    try {
      // Step 1: Uploading
      setStatus('Uploading to server...');
      setProgress(30);

      const response = await fetch('/api/ingest', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to ingest documents');
      }

      // We don't have true streaming progress for server-side processing yet, 
      // but we simulate the UX flow while waiting for the response.
      setProgress(100);
      setStatus('Ingestion complete!');
      toast.success('Documents successfully processed and indexed!');
      
      // Clear files after successful upload
      setTimeout(() => {
        setFiles([]);
        setIsUploading(false);
        setProgress(0);
        setStatus('');
        fetchDocuments(); // Refresh list
      }, 2000);

    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'An error occurred during upload.');
      setIsUploading(false);
      setProgress(0);
      setStatus('');
    }
  };

  const handleDeleteDoc = async (id: string, filename: string) => {
    if (!confirm(`Are you sure you want to delete ${filename}? This will remove it from the vector database.`)) return;
    
    setDeletingId(id);
    try {
      const res = await fetch('/api/documents', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, filename })
      });
      
      if (!res.ok) throw new Error('Failed to delete');
      
      toast.success(`${filename} deleted successfully`);
      fetchDocuments();
    } catch (err) {
      console.error(err);
      toast.error(`Failed to delete ${filename}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 space-y-6">
      <div 
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ease-in-out cursor-pointer flex flex-col items-center justify-center
          ${isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'}
          ${isUploading ? 'pointer-events-none opacity-60' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          multiple 
          accept=".pdf"
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileSelect}
        />
        
        <div className="p-4 bg-primary/10 rounded-full mb-4">
          <UploadCloud className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-foreground">Upload your documents</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-sm">
          Drag & drop your PDFs here, or click to browse. We'll parse, chunk, and index them for you.
        </p>
        
        <div className="flex gap-4 text-xs text-muted-foreground font-medium bg-background px-4 py-2 rounded-full shadow-sm border">
          <span>Max {MAX_FILES} files</span>
          <span>•</span>
          <span>Max 25MB total</span>
        </div>
      </div>

      {files.length > 0 && (
        <Card className="shadow-sm border-muted">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-foreground">Selected Files ({files.length})</h4>
              <span className="text-sm text-muted-foreground">
                {(totalSize / (1024 * 1024)).toFixed(2)} MB / 25 MB
              </span>
            </div>
            
            <div className="space-y-3 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
              {files.map((file, idx) => (
                <div key={`${file.name}-${idx}`} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileIcon className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm font-medium truncate text-foreground">{file.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                    {!isUploading && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                        className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {isUploading && (
              <div className="mt-6 space-y-2 p-4 bg-muted/50 rounded-lg border">
                <div className="flex items-center justify-between text-sm font-medium">
                  <span className="text-foreground flex items-center gap-2">
                    {progress === 100 ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                    {status}
                  </span>
                  <span className="text-muted-foreground">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <Button 
                onClick={handleUpload} 
                disabled={isUploading || files.length === 0}
                className="w-full sm:w-auto shadow-sm"
              >
                {isUploading ? 'Processing...' : 'Start Ingestion Pipeline'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Uploaded Documents List */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Indexed Documents</h3>
          <span className="text-sm text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">
            {uploadedDocs.length} Total
          </span>
        </div>
        
        {isFetchingDocs && uploadedDocs.length === 0 ? (
          <div className="flex items-center justify-center p-8 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...
          </div>
        ) : uploadedDocs.length === 0 ? (
          <div className="text-center p-8 border border-dashed rounded-xl text-muted-foreground bg-muted/20">
            No documents indexed yet. Upload your first PDF above!
          </div>
        ) : (
          <div className="space-y-3">
            {uploadedDocs.map((doc) => (
              <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border bg-card hover:border-primary/30 transition-all group shadow-sm">
                <div className="flex items-start sm:items-center gap-3 overflow-hidden mb-3 sm:mb-0">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary flex-shrink-0">
                    <FileIcon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium truncate text-foreground" title={doc.filename}>{doc.filename}</span>
                    <span className="text-xs text-muted-foreground">
                      {(doc.size_bytes / 1024).toFixed(1)} KB • {doc.chunk_count} chunks • {new Date(doc.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteDoc(doc.id, doc.filename)}
                  disabled={deletingId === doc.id}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity self-end sm:self-auto"
                >
                  {deletingId === doc.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 sm:mr-2" />
                      <span className="sm:hidden">Delete</span>
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Download, Copy, Check, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface YouTubeTranscriptProps {
  itemId: string;
  url: string;
  videoId?: string;
  existingTranscript?: string;
  onTranscriptFetch?: (transcript: string) => void;
  onClose?: () => void;
  className?: string;
}

export function YouTubeTranscript({ itemId, url, videoId, existingTranscript, onTranscriptFetch, onClose, className }: YouTubeTranscriptProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string | null>(existingTranscript || null);
  const [copied, setCopied] = useState(false);

  const fetchTranscript = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId,
          url,
          contentType: 'youtube'
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch transcript');
      }
      
      setTranscript(data.transcript);
      
      if (onTranscriptFetch) {
        onTranscriptFetch(data.transcript);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transcript';
      setError(errorMessage);
      
      // Handle specific error types
      if (errorMessage.includes('temporarily unavailable') || errorMessage.includes('interface')) {
        setError('YouTube transcript extraction is temporarily unavailable. Please try again later.');
      } else if (errorMessage.includes('not have captions')) {
        setError('This video does not have captions available.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const copyTranscript = async () => {
    if (!transcript) return;
    
    try {
      await navigator.clipboard.writeText(transcript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy transcript:', error);
    }
  };

  const downloadTranscript = () => {
    if (!transcript) return;
    
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${videoId || 'youtube'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    // Only fetch if we don't have an existing transcript
    if (!existingTranscript && itemId && url) {
      fetchTranscript();
    }
  }, [itemId, url, existingTranscript]);

  return (
    <div className={cn("h-full flex flex-col", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          <h3 className="font-semibold">Transcript</h3>
        </div>
        
        <div className="flex items-center gap-1">
          {transcript && (
            <>
              <button
                onClick={copyTranscript}
                className="p-2 hover:bg-muted rounded-md transition-colors"
                title={copied ? "Copied!" : "Copy transcript"}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={downloadTranscript}
                className="p-2 hover:bg-muted rounded-md transition-colors"
                title="Download transcript"
              >
                <Download className="w-4 h-4" />
              </button>
            </>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-md transition-colors ml-2"
              title="Close transcript"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="text-muted-foreground">Fetching transcript...</p>
          </div>
        )}
        
        {error && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-destructive mb-4">{error}</p>
            <button
              onClick={fetchTranscript}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
        
        {transcript && (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{transcript}</p>
          </div>
        )}
        
        {!isLoading && !error && !transcript && (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No transcript available</p>
          </div>
        )}
      </div>
    </div>
  );
}
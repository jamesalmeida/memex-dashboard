'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Download, Copy, Check, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface YouTubeTranscriptProps {
  itemId: string;
  url: string;
  videoId?: string;
  existingTranscript?: string;
  onTranscriptFetch?: (transcript: string, tldr_summary?: string) => void;
  existingSummary?: string;
  onClose?: () => void;
  className?: string;
}

export function YouTubeTranscript({ itemId, url, videoId, existingTranscript, existingSummary, onTranscriptFetch, onClose, className }: YouTubeTranscriptProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string | null>(existingTranscript || null);
  const [copied, setCopied] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [summary, setSummary] = useState<string | null>(existingSummary || null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showFullTranscript, setShowFullTranscript] = useState(false);

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

  const handleSummarize = async () => {
    if (!transcript) return;

    setIsSummarizing(true);
    setSummary(null);
    setError(null);

    try {
      const response = await fetch('/api/summarize-transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript, itemId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to summarize transcript');
      }

      setSummary(data.summary);
      if (onTranscriptFetch) {
        onTranscriptFetch(transcript, data.summary);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to summarize transcript';
      setError(errorMessage);
    } finally {
      setIsSummarizing(false);
    }
  };

  const copySummary = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    } catch (error) {
      console.error('Failed to copy summary:', error);
    }
  };

  useEffect(() => {
    // Only fetch if we don't have an existing transcript
    if (!existingTranscript && itemId && url) {
      fetchTranscript();
    }
    if (existingSummary) {
      setSummary(existingSummary);
    }
  }, [itemId, url, existingTranscript, existingSummary]);

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
                onClick={handleSummarize}
                className="p-2 hover:bg-muted rounded-md transition-colors"
                title="Summarize transcript"
                disabled={isSummarizing}
              >
                {isSummarizing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "TL;DR"
                )}
              </button>
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
        
        {summary ? (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="border border-gray-300 dark:border-gray-700 rounded-md p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold">TL;DR Summary:</h4>
                <button
                  onClick={copySummary}
                  className="p-1 hover:bg-muted rounded-md transition-colors text-sm"
                  title={copiedSummary ? "Copied!" : "Copy summary"}
                >
                  {copiedSummary ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{summary}</p>
            </div>
            {transcript && (
              <div className="mt-4">
                <button
                  onClick={() => setShowFullTranscript(!showFullTranscript)}
                  className="text-blue-500 hover:underline text-sm"
                >
                  {showFullTranscript ? "Hide Original Transcript" : "Show Original Transcript"}
                </button>
                {showFullTranscript && (
                  <div className="prose prose-sm dark:prose-invert max-w-none mt-2">
                    <h4 className="font-semibold mb-2">Original Transcript:</h4>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{transcript}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : transcript && (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{transcript}</p>
          </div>
        )}
        
        {!isLoading && !error && !transcript && !summary && (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No transcript available</p>
          </div>
        )}
      </div>
    </div>
  );
}
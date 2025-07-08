'use client';

import React, { useState } from 'react';
import { FileText, Download, Copy, Check, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TranscriptViewerProps {
  transcript: string | null;
  isLoading: boolean;
  error: string | null;
  onClose?: () => void;
  onRetry?: () => void;
  className?: string;
  title?: string;
}

export function TranscriptViewer({
  transcript,
  isLoading,
  error,
  onClose,
  onRetry,
  className,
  title = 'Transcript',
}: TranscriptViewerProps) {
  const [copied, setCopied] = useState(false);

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
    a.download = `transcript.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn("h-full flex flex-col", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          <h3 className="font-semibold">{title}</h3>
        </div>

        <div className="flex items-center gap-1">
          {transcript && (
            <>
              <button
                onClick={copyTranscript}
                className="p-2 hover:bg-muted rounded-md transition-colors"
                title={copied ? 'Copied!' : 'Copy transcript'}
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
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            )}
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

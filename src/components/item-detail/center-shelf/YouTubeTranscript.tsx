'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Download, Copy, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface YouTubeTranscriptProps {
  videoId: string;
  onTranscriptFetch?: (transcript: string) => void;
  className?: string;
}

interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

export function YouTubeTranscript({ videoId, onTranscriptFetch, className }: YouTubeTranscriptProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptSegment[] | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchTranscript = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: Implement actual transcript fetching
      // This would call your transcript API endpoint
      const response = await fetch(`/api/youtube-transcript?videoId=${videoId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch transcript');
      }
      
      const data = await response.json();
      setTranscript(data.segments);
      
      if (onTranscriptFetch) {
        const fullText = data.segments.map((s: TranscriptSegment) => s.text).join(' ');
        onTranscriptFetch(fullText);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transcript');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const copyTranscript = async () => {
    if (!transcript) return;
    
    const fullText = transcript.map(s => s.text).join('\n');
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy transcript:', error);
    }
  };

  const downloadTranscript = () => {
    if (!transcript) return;
    
    const fullText = transcript.map(s => `[${formatTime(s.start)}] ${s.text}`).join('\n');
    const blob = new Blob([fullText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${videoId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (videoId) {
      fetchTranscript();
    }
  }, [videoId]);

  return (
    <div className={cn("h-full flex flex-col", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          <h3 className="font-semibold">Transcript</h3>
        </div>
        
        {transcript && (
          <div className="flex items-center gap-1">
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
          </div>
        )}
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
        
        {transcript && transcript.length > 0 && (
          <div className="space-y-3">
            {transcript.map((segment, index) => (
              <div key={index} className="flex gap-3">
                <span className="text-xs text-muted-foreground whitespace-nowrap pt-0.5">
                  {formatTime(segment.start)}
                </span>
                <p className="text-sm flex-1">{segment.text}</p>
              </div>
            ))}
          </div>
        )}
        
        {transcript && transcript.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No transcript available for this video</p>
          </div>
        )}
      </div>
    </div>
  );
}
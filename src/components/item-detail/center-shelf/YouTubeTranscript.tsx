'use client';

import React, { useState, useEffect } from 'react';
import { TranscriptViewer } from './TranscriptViewer';
import { cn } from '@/lib/utils';

interface YouTubeTranscriptProps {
  itemId: string;
  url: string;
  existingTranscript?: string;
  onTranscriptFetch?: (transcript: string) => void;
  onClose?: () => void;
  className?: string;
}

export function YouTubeTranscript({ itemId, url, existingTranscript, onTranscriptFetch, onClose, className }: YouTubeTranscriptProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string | null>(existingTranscript || null);

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

      if (errorMessage.includes('temporarily unavailable') || errorMessage.includes('interface')) {
        setError('YouTube transcript extraction is temporarily unavailable. Please try again later.');
      } else if (errorMessage.includes('not have captions')) {
        setError('This video does not have captions available.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!existingTranscript && itemId && url) {
      fetchTranscript();
    }
  }, [itemId, url, existingTranscript]);

  return (
    <TranscriptViewer
      transcript={transcript}
      isLoading={isLoading}
      error={error}
      onClose={onClose}
      onRetry={fetchTranscript}
      className={className}
    />
  );
}

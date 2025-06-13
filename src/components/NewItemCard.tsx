'use client'

import { useState } from 'react';
import { MockItem } from '@/utils/mockData';

interface NewItemCardProps {
  onAdd: (item: Omit<MockItem, 'id' | 'created_at'>) => void;
}

export default function NewItemCard({ onAdd }: NewItemCardProps) {
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const detectContentType = (input: string): MockItem['content_type'] => {
    if (!input) return 'text';
    
    const lowerInput = input.toLowerCase();
    
    // Check if it's a URL
    if (input.startsWith('http') || input.includes('.')) {
      if (lowerInput.includes('youtube.com') || lowerInput.includes('youtu.be') || 
          lowerInput.includes('vimeo.com')) {
        return 'video';
      }
      
      if (lowerInput.includes('twitter.com') || lowerInput.includes('x.com')) {
        return 'tweet';
      }
      
      if (lowerInput.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
        return 'image';
      }
      
      if (lowerInput.includes('.pdf')) {
        return 'pdf';
      }
      
      return 'link';
    }
    
    return 'text';
  };

  const normalizeUrl = (input: string): string => {
    if (!input.startsWith('http') && input.includes('.')) {
      return `https://${input}`;
    }
    return input;
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setIsSubmitting(true);

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 300));

    const contentType = detectContentType(input);
    const isUrl = input.startsWith('http') || input.includes('.');
    const normalizedUrl = isUrl ? normalizeUrl(input) : undefined;

    // Generate mock thumbnail for URLs
    const generateThumbnail = (): string => {
      const thumbnails = [
        'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop',
        'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=200&fit=crop',
        'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=200&fit=crop'
      ];
      return thumbnails[Math.floor(Math.random() * thumbnails.length)];
    };

    const newItem: Omit<MockItem, 'id' | 'created_at'> = {
      title: isUrl ? 'Quick Link' : input.substring(0, 50) + (input.length > 50 ? '...' : ''),
      url: normalizedUrl,
      content_type: contentType,
      description: isUrl ? `Added via quick capture` : undefined,
      thumbnail: normalizedUrl ? generateThumbnail() : undefined,
      metadata: {
        domain: normalizedUrl ? new URL(normalizedUrl).hostname : undefined,
        tags: ['quick-add']
      }
    };

    onAdd(newItem); // Just add to grid, no modal
    setInput('');
    setIsSubmitting(false);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInput(text);
        // Auto-submit after a brief delay to show what was pasted
        setTimeout(() => {
          handleSubmit();
        }, 100);
      }
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleClear = () => {
    setInput('');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition-colors h-48 flex flex-col p-4">
      <div className="flex-1">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a note, paste a link, or drop anything here..."
          className="w-full h-full resize-none border-0 focus:outline-none text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 bg-transparent"
          disabled={isSubmitting}
          autoFocus
        />
      </div>
      
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          {input.trim() && (
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-1.5"
              disabled={isSubmitting}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear
            </button>
          )}
        </div>
        
        {input.trim() ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-1.5 text-sm bg-[rgb(255,77,6)] text-white rounded-md hover:bg-[rgb(230,69,5)] transition-colors flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Adding...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={handlePaste}
            className="px-4 py-1.5 text-sm bg-[rgb(255,77,6)] text-white rounded-md hover:bg-[rgb(230,69,5)] transition-colors flex items-center gap-1.5"
            disabled={isSubmitting}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            Paste
          </button>
        )}
      </div>
    </div>
  );
}
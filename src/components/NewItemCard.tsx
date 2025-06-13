'use client'

import { useState, useEffect, useRef } from 'react';
import { MockItem } from '@/utils/mockData';

interface NewItemCardProps {
  onAdd: (item: Omit<MockItem, 'id' | 'created_at'>) => void;
}

export default function NewItemCard({ onAdd }: NewItemCardProps) {
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [lastHeight, setLastHeight] = useState(48); // 3rem = 48px

  // Auto-resize textarea and trigger grid re-layout if needed
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to get proper scrollHeight
      textarea.style.height = '3rem';
      // Set height based on content, but cap at max height
      const newHeight = Math.min(textarea.scrollHeight, 128); // 8rem = 128px
      textarea.style.height = `${newHeight}px`;
      
      // If height changed significantly, trigger a window resize event to update masonry grid
      if (Math.abs(newHeight - lastHeight) > 10) {
        setLastHeight(newHeight);
        // Delay to ensure DOM has updated
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 50);
      }
    }
  }, [input, lastHeight]);

  const detectContentType = (input: string): MockItem['content_type'] => {
    if (!input) return 'note';
    
    const lowerInput = input.toLowerCase();
    
    // Check if it's a valid URL (must start with http or be a recognizable domain pattern)
    const urlPattern = /^(https?:\/\/)|(www\.)|([a-zA-Z0-9-]+\.(com|org|net|io|dev|app|co|edu|gov|mil|info|biz|me|tv|fm|ai|cloud|xyz|tech|site|online|store|shop|blog|news|media|social|network|community|platform|service|solutions|digital|global|world|international|[a-z]{2,3}))/i;
    
    if (input.startsWith('http') || urlPattern.test(input)) {
      // Social Media
      if (lowerInput.includes('twitter.com') || lowerInput.includes('x.com')) return 'x';
      if (lowerInput.includes('instagram.com')) return 'instagram';
      if (lowerInput.includes('youtube.com') || lowerInput.includes('youtu.be')) return 'youtube';
      if (lowerInput.includes('linkedin.com')) return 'linkedin';
      if (lowerInput.includes('tiktok.com')) return 'tiktok';
      if (lowerInput.includes('reddit.com')) return 'reddit';
      if (lowerInput.includes('facebook.com') || lowerInput.includes('fb.com')) return 'facebook';
      
      // Development
      if (lowerInput.includes('github.com')) return 'github';
      if (lowerInput.includes('gitlab.com')) return 'gitlab';
      if (lowerInput.includes('codepen.io')) return 'codepen';
      if (lowerInput.includes('stackoverflow.com')) return 'stackoverflow';
      if (lowerInput.includes('dev.to')) return 'devto';
      if (lowerInput.includes('npmjs.com')) return 'npm';
      
      // Commerce
      if (lowerInput.includes('amazon.com')) return 'amazon';
      if (lowerInput.includes('etsy.com')) return 'etsy';
      if (lowerInput.includes('apps.apple.com') || lowerInput.includes('play.google.com')) return 'app';
      
      // Knowledge
      if (lowerInput.includes('wikipedia.org')) return 'wikipedia';
      if (lowerInput.includes('arxiv.org')) return 'paper';
      if (lowerInput.includes('goodreads.com')) return 'book';
      if (lowerInput.includes('coursera.com') || lowerInput.includes('udemy.com') || 
          lowerInput.includes('edx.org') || lowerInput.includes('.edu/course')) return 'course';
      
      // Content & Media
      if (lowerInput.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image';
      if (lowerInput.includes('.pdf')) return 'pdf';
      if (lowerInput.match(/\.(mp3|wav|ogg|m4a)$/) || lowerInput.includes('podcast')) return 'audio';
      if (lowerInput.match(/\.(mp4|avi|mov|webm)$/)) return 'video';
      if (lowerInput.match(/\.(ppt|pptx|key)$/)) return 'presentation';
      
      // Recipe sites
      if (lowerInput.includes('recipe') || lowerInput.includes('cooking') || 
          lowerInput.includes('allrecipes.com') || lowerInput.includes('foodnetwork.com')) return 'recipe';
      
      // Documentation
      if (lowerInput.includes('/docs/') || lowerInput.includes('/documentation/') || 
          lowerInput.includes('docs.') || lowerInput.includes('developer.')) return 'documentation';
      
      // Default to article for news/blog sites
      if (lowerInput.includes('medium.com') || lowerInput.includes('substack.com') || 
          lowerInput.includes('blog') || lowerInput.includes('news')) return 'article';
      
      // Generic product page indicators
      if (lowerInput.includes('/product/') || lowerInput.includes('/shop/') || 
          lowerInput.includes('/item/')) return 'product';
      
      return 'bookmark';
    }
    
    return 'note';
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
    
    // Validate URL before using it
    let domain: string | undefined;
    if (normalizedUrl) {
      try {
        const url = new URL(normalizedUrl);
        domain = url.hostname;
      } catch (error) {
        // Not a valid URL, treat as note
        domain = undefined;
      }
    }

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
      title: isUrl && domain ? 'Quick Link' : input.substring(0, 50) + (input.length > 50 ? '...' : ''),
      url: normalizedUrl && domain ? normalizedUrl : undefined,
      content_type: contentType,
      description: isUrl && domain ? `Added via quick capture` : undefined,
      thumbnail: normalizedUrl && domain ? generateThumbnail() : undefined,
      metadata: {
        domain: domain,
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
    <div ref={cardRef} id="new-item-card" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition-colors flex flex-col p-4">
      <div className="flex-1">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a note or paste something here..."
          className="w-full resize-none border-0 focus:outline-none text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 bg-transparent overflow-y-auto"
          style={{
            minHeight: '3rem', // ~2 lines minimum
            maxHeight: '8rem', // ~5 lines maximum before scrolling
          }}
          disabled={isSubmitting}
          autoFocus
          rows={1}
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
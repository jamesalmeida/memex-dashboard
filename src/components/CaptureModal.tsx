'use client'

import { useState, useCallback } from 'react';
import { MockItem } from '@/utils/mockData';
import Modal from './Modal';
import UrlPreview from './UrlPreview';
import type { UrlAnalysisResult } from '@/lib/services/urlMetadata';

interface CaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Omit<MockItem, 'id' | 'created_at'>) => void;
}

export default function CaptureModal({ isOpen, onClose, onAdd }: CaptureModalProps) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [project, setProject] = useState('');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [extractedMetadata, setExtractedMetadata] = useState<UrlAnalysisResult | null>(null);
  const [isPasting, setIsPasting] = useState(false);

  const detectContentType = (url: string): MockItem['content_type'] => {
    if (!url) return 'note';
    
    const lowerUrl = url.toLowerCase();
    
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
      return 'youtube';
    }
    
    if (lowerUrl.includes('vimeo.com') || lowerUrl.includes('twitch.tv')) {
      return 'video';
    }
    
    if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) {
      return 'x';
    }
    
    if (lowerUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
      return 'image';
    }
    
    if (lowerUrl.includes('.pdf')) {
      return 'pdf';
    }
    
    if (url.startsWith('http')) {
      return 'bookmark';
    }
    
    return 'note';
  };

  const validateUrl = (url: string): boolean => {
    if (!url) return true; // Empty URL is valid for text entries
    
    try {
      new URL(url);
      return true;
    } catch {
      // Try with https:// prefix
      try {
        new URL(`https://${url}`);
        return true;
      } catch {
        return false;
      }
    }
  };

  const normalizeUrl = (url: string): string => {
    if (!url) return '';
    
    try {
      new URL(url);
      return url;
    } catch {
      return `https://${url}`;
    }
  };

  const handleMetadataExtracted = useCallback((result: UrlAnalysisResult) => {
    setExtractedMetadata(result);
    
    // Auto-fill form fields if they're empty
    if (!title && result.metadata.title) {
      setTitle(result.metadata.title);
    }
    if (!description && result.metadata.description) {
      setDescription(result.metadata.description);
    }
  }, []); // Remove dependencies to prevent re-execution

  const clearForm = () => {
    setUrl('');
    setTitle('');
    setDescription('');
    setExtractedMetadata(null);
    setError('');
  };

  const clearUrl = () => {
    setUrl('');
    setExtractedMetadata(null);
  };

  const handleClose = () => {
    clearForm();
    onClose();
  };

  const handleQuickAdd = async () => {
    if (!url.trim() && !title.trim()) {
      setError('Please enter a URL or title');
      return;
    }

    setError('');
    setIsSubmitting(true);

    const normalizedUrl = url ? normalizeUrl(url) : undefined;
    
    // Use extracted metadata if available, otherwise fallback to detection
    const contentType = extractedMetadata ? extractedMetadata.content_type : detectContentType(url);
    
    const newItem: Omit<MockItem, 'id' | 'created_at'> = {
      title: title || extractedMetadata?.metadata.title || url || 'New Item',
      url: normalizedUrl,
      content_type: contentType,
      description: description || extractedMetadata?.metadata.description || undefined,
      thumbnail_url: extractedMetadata?.metadata.thumbnail_url || undefined,
      metadata: {
        domain: extractedMetadata?.metadata.domain || (normalizedUrl ? new URL(normalizedUrl).hostname : undefined),
        author: extractedMetadata?.metadata.author,
        duration: extractedMetadata?.metadata.duration,
        published_date: extractedMetadata?.metadata.published_date,
        video_url: extractedMetadata?.metadata.video_url,
        video_type: extractedMetadata?.metadata.video_type,
        profile_image: extractedMetadata?.metadata.profile_image,
        likes: extractedMetadata?.metadata.likes,
        retweets: extractedMetadata?.metadata.retweets,
        replies: extractedMetadata?.metadata.replies,
        tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : undefined
      },
      space: project || undefined
    };

    onAdd(newItem);
    
    // Reset form
    setUrl('');
    setTitle('');
    setDescription('');
    setProject('');
    setTags('');
    setExtractedMetadata(null);
    setIsSubmitting(false);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleQuickAdd();
  };

  const handlePaste = async () => {
    setIsPasting(true);
    setError('');
    
    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        setError('Nothing to paste from clipboard');
        setIsPasting(false);
        return;
      }

      // Check if it's a URL
      const urlPattern = /^(https?:\/\/)|(www\.)|([a-zA-Z0-9-]+\.(com|org|net|io|dev|app|co|edu|gov|mil|info|biz|me|tv|fm|ai|cloud|xyz|tech|site|online|store|shop|blog|news|media|social|network|community|platform|service|solutions|digital|global|world|international|[a-z]{2,3}))/i;
      
      if (text.startsWith('http') || urlPattern.test(text)) {
        // It's a URL - put it in the URL field
        setUrl(text.trim());
      } else {
        // It's text - create a note
        const lines = text.trim().split('\n');
        const firstLine = lines[0].substring(0, 100);
        
        // Set title to first line (max 100 chars)
        setTitle(firstLine + (firstLine.length < lines[0].length ? '...' : ''));
        
        // Set description to full text
        setDescription(text);
      }
      
      setIsPasting(false);
    } catch (err) {
      console.error('Failed to read clipboard:', err);
      setError('Failed to paste from clipboard. Please check permissions.');
      setIsPasting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} modalId="capture-modal" title="Add New Item">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Paste Button */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handlePaste}
              disabled={isPasting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPasting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Pasting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Paste from clipboard
                </>
              )}
            </button>
          </div>

          <div className="text-center text-sm text-gray-500">or</div>

          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
              URL (optional)
            </label>
            <div className="relative">
              <input
                type="text"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com or paste any link"
              />
              {url && (
                <button
                  type="button"
                  onClick={clearUrl}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  title="Clear URL"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {url && !validateUrl(url) && (
              <p className="text-xs text-red-600 mt-1">Please enter a valid URL</p>
            )}
          </div>

          {/* URL Preview */}
          {url && validateUrl(url) && (
            <UrlPreview 
              url={url} 
              onMetadataExtracted={handleMetadataExtracted}
              className="mt-4"
            />
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Give it a descriptive title"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add any notes or thoughts..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-1">
                Project (optional)
              </label>
              <input
                type="text"
                id="project"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Project name"
              />
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                Tags (optional)
              </label>
              <input
                type="text"
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="tag1, tag2"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (!url.trim() && !title.trim()) || (url && !validateUrl(url))}
              className="flex-1 px-4 py-2 bg-[rgb(255,77,6)] text-white rounded-md hover:bg-[rgb(230,69,5)] disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </form>
    </Modal>
  );
}
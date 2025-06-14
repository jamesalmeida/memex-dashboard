'use client'

import { useState } from 'react';
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

  const handleMetadataExtracted = (result: UrlAnalysisResult) => {
    setExtractedMetadata(result);
    
    // Auto-fill form fields if they're empty
    if (!title && result.metadata.title) {
      setTitle(result.metadata.title);
    }
    if (!description && result.metadata.description) {
      setDescription(result.metadata.description);
    }
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} modalId="capture-modal" title="Add New Item">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
              URL (optional)
            </label>
            <input
              type="text"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com or paste any link"
            />
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
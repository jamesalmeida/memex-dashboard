'use client'

import { useState } from 'react';
import { MockItem } from '@/utils/mockData';

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

  const detectContentType = (url: string): MockItem['content_type'] => {
    if (!url) return 'text';
    
    const lowerUrl = url.toLowerCase();
    
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be') || 
        lowerUrl.includes('vimeo.com') || lowerUrl.includes('twitch.tv')) {
      return 'video';
    }
    
    if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) {
      return 'tweet';
    }
    
    if (lowerUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
      return 'image';
    }
    
    if (lowerUrl.includes('.pdf')) {
      return 'pdf';
    }
    
    if (url.startsWith('http')) {
      return 'link';
    }
    
    return 'text';
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

  const handleQuickAdd = async () => {
    if (!url.trim() && !title.trim()) {
      setError('Please enter a URL or title');
      return;
    }

    setError('');
    setIsSubmitting(true);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const normalizedUrl = url ? normalizeUrl(url) : undefined;
    const contentType = detectContentType(url);
    
    // Generate mock metadata based on content type
    const generateThumbnail = (): string => {
      const thumbnails = [
        'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop',
        'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=200&fit=crop',
        'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=200&fit=crop',
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=200&fit=crop'
      ];
      return thumbnails[Math.floor(Math.random() * thumbnails.length)];
    };

    const newItem: Omit<MockItem, 'id' | 'created_at'> = {
      title: title || url || 'New Item',
      url: normalizedUrl,
      content_type: contentType,
      description: description || undefined,
      thumbnail: normalizedUrl ? generateThumbnail() : undefined,
      metadata: {
        domain: normalizedUrl ? new URL(normalizedUrl).hostname : undefined,
        tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : undefined
      },
      project: project || undefined
    };

    onAdd(newItem);
    
    // Reset form
    setUrl('');
    setTitle('');
    setDescription('');
    setProject('');
    setTags('');
    setIsSubmitting(false);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleQuickAdd();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Add New Item</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

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
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (!url.trim() && !title.trim()) || (url && !validateUrl(url))}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
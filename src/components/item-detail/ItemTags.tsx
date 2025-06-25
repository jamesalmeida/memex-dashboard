'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Hash, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ContentType, CONTENT_TYPE_METADATA } from '@/lib/contentTypes/patterns';

interface ItemTagsProps {
  itemId: string;
  tags: string[];
  contentType: ContentType;
  onAddTag: (tag: string) => Promise<void>;
  onRemoveTag: (tag: string) => Promise<void>;
  className?: string;
}

export function ItemTags({
  itemId,
  tags = [],
  contentType,
  onAddTag,
  onRemoveTag,
  className,
}: ItemTagsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get content type metadata for the auto-tag
  const contentTypeMetadata = CONTENT_TYPE_METADATA[contentType] || CONTENT_TYPE_METADATA.unknown;
  const contentTypeTag = contentType !== 'unknown' ? contentType : null;

  // Combine user tags with content type tag
  const allTags = [...tags];
  const hasContentTypeTag = allTags.includes(contentTypeTag || '');

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const handleAddTag = async () => {
    const trimmedTag = newTag.trim().toLowerCase();
    if (!trimmedTag || allTags.includes(trimmedTag)) {
      setNewTag('');
      setIsAdding(false);
      return;
    }

    setIsProcessing(true);
    try {
      await onAddTag(trimmedTag);
      setNewTag('');
      setIsAdding(false);
    } catch (error) {
      console.error('Failed to add tag:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveTag = async (tag: string) => {
    if (tag === contentTypeTag) return; // Don't remove content type tag
    
    setIsProcessing(true);
    try {
      await onRemoveTag(tag);
    } catch (error) {
      console.error('Failed to remove tag:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === 'Escape') {
      setNewTag('');
      setIsAdding(false);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Tags</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="p-1 hover:bg-muted rounded transition-colors"
          aria-label="Add tag"
          disabled={isAdding}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-wrap gap-1">
        {/* Content Type Tag (non-removable) */}
        {contentTypeTag && !hasContentTypeTag && (
          <span
            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
            title={`Content type: ${contentTypeMetadata.displayName}`}
          >
            {contentTypeTag}
          </span>
        )}

        {/* User Tags */}
        {allTags.map((tag) => (
          <span
            key={tag}
            className={cn(
              "px-3 py-1 rounded-full text-sm flex items-center gap-1",
              tag === contentTypeTag
                ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                : "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
            )}
          >
            {tag}
            {tag !== contentTypeTag && (
              <button
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200"
                disabled={isProcessing}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </span>
        ))}

        {/* Add Tag Input */}
        {isAdding && (
          <div className="inline-flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value.toLowerCase())}
              onBlur={() => {
                if (!newTag.trim()) {
                  setIsAdding(false);
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder="Add tag..."
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-full outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              disabled={isProcessing}
            />
          </div>
        )}
      </div>
    </div>
  );
}
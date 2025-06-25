'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { ItemDetailLayout } from './ItemDetailLayout';
import { ContentViewer } from './viewers/ViewerRegistry';
import { MetadataPanel } from './MetadataPanel';
import { UserNotes } from './UserNotes';
import { ActionButtons } from './ActionButtons';
import { YouTubeTranscript } from './center-shelf/YouTubeTranscript';
import { ContentSkeleton } from './skeletons/ContentSkeleton';
import { MetadataSkeleton } from './skeletons/MetadataSkeleton';
import { SpaceSelector } from './SpaceSelector';
import { detectContentType } from '@/lib/contentTypes/detector';
import { ContentType } from '@/lib/contentTypes/patterns';
import { cn } from '@/lib/utils';
import type { Space } from '@/types/database';

interface ItemDetailModalRefactoredProps {
  item: any; // TODO: Type this properly
  isOpen: boolean;
  onClose: () => void;
  onUpdateItem?: (itemId: string, updates: any) => void;
  onDeleteItem?: (itemId: string) => void;
  onArchiveItem?: (itemId: string) => void;
  onChangeSpace?: (itemId: string, spaceId: string | null) => void;
  spaces?: Space[];
  className?: string;
}

export function ItemDetailModalRefactored({
  item,
  isOpen,
  onClose,
  onUpdateItem,
  onDeleteItem,
  onArchiveItem,
  onChangeSpace,
  spaces = [],
  className,
}: ItemDetailModalRefactoredProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [contentType, setContentType] = useState<ContentType>('unknown');
  const [showTranscript, setShowTranscript] = useState(false);
  const [userNotes, setUserNotes] = useState(item?.user_notes || '');

  // Initialize contentType on mount if item exists
  useEffect(() => {
    if (item && !contentType) {
      setContentType('unknown');
    }
  }, []);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (item?.content_type) {
      // Use the existing content_type from the item
      console.log('Item content_type:', item.content_type);
      console.log('Item metadata:', item.metadata);
      // Map legacy content types to our new types
      const mappedType = mapLegacyContentType(item.content_type);
      console.log('Mapped to:', mappedType);
      setContentType(mappedType);
    } else if (item?.url) {
      // Fallback to detection if no content_type is set
      const detection = detectContentType(item.url);
      console.log('Detected content type:', detection.type);
      setContentType(detection.type);
    }
  }, [item]);

  // Map legacy content types to our new content type system
  const mapLegacyContentType = (legacyType: string): ContentType => {
    const mapping: Record<string, ContentType> = {
      'x': 'twitter',
      'twitter/x': 'twitter',
      // Add other mappings as needed
    };
    
    return (mapping[legacyType] || legacyType) as ContentType;
  };

  if (!isOpen || !item) return null;

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // Call the API to refresh metadata
      const response = await fetch('/api/extract-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: item.url }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh metadata');
      }

      const freshMetadata = await response.json();
      
      // Update the item with fresh metadata
      if (onUpdateItem) {
        await onUpdateItem(item.id, {
          title: freshMetadata.title,
          description: freshMetadata.description,
          thumbnail_url: freshMetadata.thumbnail_url,
          // Add other metadata fields as needed
        });
      }
    } catch (error) {
      console.error('Error refreshing metadata:', error);
      // TODO: Show error toast
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (onDeleteItem) {
      await onDeleteItem(item.id);
      onClose();
    }
  };

  const handleArchive = async () => {
    if (onArchiveItem) {
      await onArchiveItem(item.id);
      onClose();
    }
  };

  const handleSaveNotes = async (notes: string) => {
    setUserNotes(notes);
    if (onUpdateItem) {
      await onUpdateItem(item.id, { user_notes: notes });
    }
  };

  const handleTranscriptFetch = (transcript: string) => {
    // Update the item with the fetched transcript
    if (onUpdateItem) {
      onUpdateItem(item.id, {
        metadata: {
          ...item.metadata,
          extra_data: {
            ...item.metadata?.extra_data,
            transcript,
          },
        },
      });
    }
  };

  // Determine if we should show the transcript button/shelf
  const canShowTranscript = contentType === 'youtube';
  const hasExistingTranscript = item.metadata?.extra_data?.transcript;

  // Left column content
  const leftColumn = isLoading ? (
    <ContentSkeleton type={contentType === 'unknown' ? 'default' : contentType as any} />
  ) : (
    <ContentViewer 
      item={item} 
      contentType={contentType}
      onTranscriptToggle={canShowTranscript ? () => setShowTranscript(!showTranscript) : undefined}
      isTranscriptOpen={showTranscript}
    />
  );

  // Right column content
  const rightColumn = (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <MetadataSkeleton />
        ) : (
          <>
            <MetadataPanel item={item} contentType={contentType} />
            <div className="p-4 border-t">
              <h3 className="text-sm font-medium mb-3">Space</h3>
              <SpaceSelector
                spaces={spaces}
                currentSpaceId={item.space_id}
                onSelect={(spaceId) => {
                  if (onChangeSpace) {
                    onChangeSpace(item.id, spaceId);
                  }
                }}
              />
            </div>
            <div className="p-4 border-t">
              <UserNotes
                itemId={item.id}
                initialNotes={userNotes}
                onSave={handleSaveNotes}
              />
            </div>
          </>
        )}
      </div>
      
      <ActionButtons
        itemId={item.id}
        itemUrl={item.url}
        isArchived={item.is_archived}
        onRefresh={handleRefresh}
        onChangeSpace={undefined}
        onDelete={handleDelete}
        onArchive={handleArchive}
      />
    </div>
  );

  // Center shelf content (YouTube transcript only for now)
  const centerShelf = canShowTranscript ? (
    <YouTubeTranscript
      itemId={item.id}
      url={item.url}
      videoId={item.video_id}
      existingTranscript={hasExistingTranscript}
      onTranscriptFetch={handleTranscriptFetch}
      onClose={() => setShowTranscript(false)}
    />
  ) : undefined;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm",
        className
      )}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="fixed inset-4 md:inset-8 bg-white dark:bg-gray-900 rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <ItemDetailLayout
          leftColumn={leftColumn}
          rightColumn={rightColumn}
          centerShelf={centerShelf}
          showCenterShelf={showTranscript}
          onCenterShelfToggle={setShowTranscript}
          className="h-full"
        />
      </div>
    </div>
  );
}
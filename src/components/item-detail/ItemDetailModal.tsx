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
import { EditableTitle } from './EditableTitle';
import { ItemTags } from './ItemTags';
import { detectContentType } from '@/lib/contentTypes/detector';
import { ContentType } from '@/lib/contentTypes/patterns';
import { extractPlatformId } from '@/lib/contentTypes/detector';
import { cn } from '@/lib/utils';
import type { Space } from '@/types/database';

interface ItemDetailModalProps {
  item: any; // TODO: Type this properly
  isOpen: boolean;
  onClose: () => void;
  onUpdateItem?: (itemId: string, updates: any) => void;
  onDeleteItem?: (itemId: string) => void;
  onArchiveItem?: (itemId: string) => void;
  onChangeSpace?: (itemId: string, spaceId: string | null) => void;
  onAddTag?: (itemId: string, tag: string) => void;
  onRemoveTag?: (itemId: string, tag: string) => void;
  spaces?: Space[];
  className?: string;
}

export function ItemDetailModal({
  item,
  isOpen,
  onClose,
  onUpdateItem,
  onDeleteItem,
  onArchiveItem,
  onChangeSpace,
  onAddTag,
  onRemoveTag,
  spaces = [],
  className,
}: ItemDetailModalProps) {
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

  // Update userNotes when item changes
  useEffect(() => {
    setUserNotes(item?.user_notes || '');
  }, [item?.id]); // Use item.id to trigger update when switching items

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

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Store the original overflow value
      const originalOverflow = document.body.style.overflow;
      
      // Prevent scrolling on the body
      document.body.style.overflow = 'hidden';
      
      // Cleanup function to restore scroll
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

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

  const [selectedContentType, setSelectedContentType] = useState<ContentType>(contentType);

  useEffect(() => {
    setSelectedContentType(contentType);
  }, [contentType]);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // Call the refresh-metadata API which properly updates both item and metadata
      const response = await fetch('/api/refresh-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          itemId: item.id,
          url: item.url,
          contentType: selectedContentType
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh metadata');
      }

      const result = await response.json();
      
      // Force a refetch of the item to get updated metadata
      if (onUpdateItem) {
        // Trigger an update to force React Query to refetch
        await onUpdateItem(item.id, {});
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

  const handleSaveTitle = async (newTitle: string) => {
    if (onUpdateItem && newTitle !== item.title) {
      await onUpdateItem(item.id, { title: newTitle });
    }
  };

  const handleAddTag = async (tag: string) => {
    if (onAddTag) {
      await onAddTag(item.id, tag);
    }
  };

  const handleRemoveTag = async (tag: string) => {
    if (onRemoveTag) {
      await onRemoveTag(item.id, tag);
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
      onUpdateMetadata={async (metadata) => {
        try {
          // Import itemsService at the top of the file
          const { itemsService } = await import('@/lib/supabase/services');
          await itemsService.updateItemMetadata(item.id, metadata);
          
          // Force a refetch of the item to get updated metadata
          if (onUpdateItem) {
            // Trigger an update to force React Query to refetch
            await onUpdateItem(item.id, {});
          }
        } catch (error) {
          console.error('Error updating metadata:', error);
        }
      }}
    />
  );

  // Right column content
  const rightColumn = (
    <div className="h-full flex flex-col">
      {/* Title section - outside scrollable area */}
      <div className="p-4 border-b">
        {isLoading ? (
          <div className="h-7 w-3/4 bg-muted rounded animate-pulse" />
        ) : (
          <EditableTitle
            title={item.title}
            onSave={handleSaveTitle}
          />
        )}
      </div>
      
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <MetadataSkeleton />
        ) : (
          <>
            <MetadataPanel item={item} contentType={selectedContentType} onContentTypeChange={setSelectedContentType} />
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
              <ItemTags
                itemId={item.id}
                tags={item.tags?.map((tag: any) => typeof tag === 'string' ? tag : tag.name) || []}
                contentType={contentType}
                onAddTag={handleAddTag}
                onRemoveTag={handleRemoveTag}
                item={{
                  title: item.title,
                  content: item.content,
                  description: item.description,
                  url: item.url,
                  thumbnailUrl: item.thumbnail_url,
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
      videoId={item.video_id || item.metadata?.extra_data?.video_id || 
               (item.url ? extractPlatformId(item.url, 'youtube') : null)}
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
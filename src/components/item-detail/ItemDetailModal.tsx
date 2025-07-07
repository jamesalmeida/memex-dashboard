'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { ItemDetailLayout } from './ItemDetailLayout';
import { ContentViewer } from './viewers/ViewerRegistry';
import { MetadataPanel } from './MetadataPanel';
import { UserNotes } from './UserNotes';
import { ActionButtons } from './ActionButtons';
import { YouTubeTranscript } from './center-shelf/YouTubeTranscript';
import { TranscriptViewer } from './center-shelf/TranscriptViewer';
import { Chat } from './center-shelf/Chat';
import { ContentSkeleton } from './skeletons/ContentSkeleton';
import { MetadataSkeleton } from './skeletons/MetadataSkeleton';
import { SpaceSelector } from './SpaceSelector';
import { EditableTitle } from './EditableTitle';
import { ItemTags } from './ItemTags';
import { ToolsSection } from './ToolsSection';
import { XToolsSection } from './XToolsSection';
import { detectContentType, extractPlatformId } from '@/lib/contentDetection/unifiedDetector';
import { ContentType } from '@/types/database';
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
  const [centerShelfView, setCenterShelfView] = useState<'transcript' | 'image-description' | 'chat' | null>(null);
  const [userNotes, setUserNotes] = useState(item?.user_notes || '');
  const [selectedContentType, setSelectedContentType] = useState<ContentType>(contentType);
  const [xTranscript, setXTranscript] = useState<string | null>(null);
  const [xImageDescription, setXImageDescription] = useState<string | null>(null);

  useEffect(() => {
    setSelectedContentType(contentType);
  }, [contentType]);

  useEffect(() => {
    if (item && !contentType) {
      setContentType('unknown');
    }
  }, []);

  useEffect(() => {
    setUserNotes(item?.user_notes || '');
    setCenterShelfView(null); // Close chat when item changes
  }, [item?.id]);

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
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (item?.content_type) {
      const mappedType = mapLegacyContentType(item.content_type);
      setContentType(mappedType);
    } else if (item?.url) {
      const detection = detectContentType(item.url);
      setContentType(detection.type);
    }
  }, [item]);

  const mapLegacyContentType = (legacyType: string): ContentType => {
    const mapping: Record<string, ContentType> = {
      'x': 'twitter',
      'twitter/x': 'twitter',
    };
    return (mapping[legacyType] || legacyType) as ContentType;
  };

  if (!isOpen || !item) return null;

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/refresh-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          itemId: item.id,
          url: item.url,
          contentType: selectedContentType
        }),
      });
      if (!response.ok) throw new Error('Failed to refresh metadata');
      if (onUpdateItem) await onUpdateItem(item.id, {});
    } catch (error) {
      console.error('Error refreshing metadata:', error);
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
    if (onAddTag) await onAddTag(item.id, tag);
  };

  const handleRemoveTag = async (tag: string) => {
    if (onRemoveTag) await onRemoveTag(item.id, tag);
  };

  const handleYouTubeTranscriptFetch = (transcript: string) => {
    if (onUpdateItem) {
      onUpdateItem(item.id, {
        metadata: { ...item.metadata, extra_data: { ...item.metadata?.extra_data, transcript } },
      });
    }
  };

  const handleXTranscript = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/transcribe-x-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: item.metadata.video_url }),
      });
      if (!response.ok) throw new Error('Failed to transcribe video');
      const data = await response.json();
      setXTranscript(data.transcript);
      setCenterShelfView('transcript');
    } catch (error) {
      console.error('Error transcribing X video:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleXImageDescription = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/describe-x-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: item.thumbnail_url, text: item.content }),
      });
      if (!response.ok) throw new Error('Failed to describe image');
      const data = await response.json();
      setXImageDescription(data.description);
      setCenterShelfView('image-description');
    } catch (error) {
      console.error('Error describing X image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyXText = () => {
    navigator.clipboard.writeText(item.content);
  };

  const leftColumn = isLoading ? (
    <ContentSkeleton type={contentType === 'unknown' ? 'default' : contentType as any} />
  ) : (
    <ContentViewer 
      item={item} 
      contentType={contentType}
      onUpdateMetadata={async (metadata) => {
        try {
          const { itemsService } = await import('@/lib/supabase/services');
          await itemsService.updateItemMetadata(item.id, metadata);
          if (onUpdateItem) await onUpdateItem(item.id, {});
        } catch (error) {
          console.error('Error updating metadata:', error);
        }
      }}
    />
  );

  const getChatContext = () => {
    let context = `Title: ${item.title}\nURL: ${item.url}\n`;
    if (item.metadata?.author) context += `Author: ${item.metadata.author}\n`;
    if (item.metadata?.timestamp) context += `Timestamp: ${item.metadata.timestamp}\n`;

    if (contentType === 'youtube' && item.metadata?.extra_data?.transcript) {
      context += `\nTranscript:\n${item.metadata.extra_data.transcript}`;
    } else if (contentType === 'twitter') {
      if (item.postType === 'video' && xTranscript) {
        context += `\nTranscript:\n${xTranscript}`;
      } else if (item.postType === 'image' && xImageDescription) {
        context += `\nImage Description:\n${xImageDescription}`;
      } else {
        context += `\nPost Text:\n${item.content}`;
      }
    }
    return context;
  };

  const rightColumn = (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        {isLoading ? (
          <div className="h-7 w-3/4 bg-muted rounded animate-pulse" />
        ) : (
          <EditableTitle title={item.title} onSave={handleSaveTitle} />
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
                  if (onChangeSpace) onChangeSpace(item.id, spaceId);
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
                item={{...item}}
              />
            </div>
            {contentType === 'youtube' && (
              <ToolsSection
                contentType={contentType}
                item={item}
                isTranscriptOpen={centerShelfView === 'transcript'}
                onTranscriptToggle={() => setCenterShelfView(centerShelfView === 'transcript' ? null : 'transcript')}
                onChat={(context) => setCenterShelfView('chat')}
                chatContext={getChatContext()}
              />
            )}
            {contentType === 'twitter' && (
              <XToolsSection
                postType={item.postType}
                onChat={(context) => setCenterShelfView('chat')}
                onCopy={handleCopyXText}
                onShowTranscript={handleXTranscript}
                onShowImageDescription={handleXImageDescription}
                chatContext={getChatContext()}
              />
            )}
            <div className="p-4 border-t">
              <UserNotes itemId={item.id} initialNotes={userNotes} onSave={handleSaveNotes} />
            </div>
          </>
        )}
      </div>
      <ActionButtons
        itemId={item.id}
        itemUrl={item.url}
        isArchived={item.is_archived}
        onRefresh={handleRefresh}
        onDelete={handleDelete}
        onArchive={handleArchive}
      />
    </div>
  );

  let centerShelfContent;
  if (centerShelfView === 'transcript') {
    if (contentType === 'youtube') {
      centerShelfContent = (
        <YouTubeTranscript
          itemId={item.id}
          url={item.url}
          existingTranscript={item.metadata?.extra_data?.transcript}
          onTranscriptFetch={handleYouTubeTranscriptFetch}
          onClose={() => setCenterShelfView(null)}
        />
      );
    } else if (contentType === 'twitter') {
      centerShelfContent = (
        <TranscriptViewer
          transcript={xTranscript}
          isLoading={isLoading}
          error={null}
          onClose={() => setCenterShelfView(null)}
          title="X Video Transcript"
        />
      );
    }
  } else if (centerShelfView === 'image-description') {
    centerShelfContent = (
      <TranscriptViewer
        transcript={xImageDescription}
        isLoading={isLoading}
        error={null}
        onClose={() => setCenterShelfView(null)}
        title="Image Description"
      />
    );
  } else if (centerShelfView === 'chat') {
    centerShelfContent = <Chat initialContext={getChatContext()} itemId={item.id} spaceId={null} onClose={() => setCenterShelfView(null)} />;
  }

  return (
    <div
      className={cn("fixed inset-0 z-50 bg-black/80 backdrop-blur-sm", className)}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="fixed inset-4 md:inset-8 bg-white dark:bg-gray-900 rounded-lg shadow-xl overflow-hidden">
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <ItemDetailLayout
          leftColumn={leftColumn}
          rightColumn={rightColumn}
          centerShelf={centerShelfContent}
          showCenterShelf={!!centerShelfView}
          onCenterShelfToggle={() => setCenterShelfView(null)}
          className="h-full"
        />
      </div>
    </div>
  );
}
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

  // Determine Twitter post type based on metadata
  const twitterPostType = useMemo(() => {
    if (item?.metadata?.video_url) {
      return 'video';
    } else if (item?.thumbnail_url) {
      return 'image';
    } else {
      return 'text';
    }
  }, [item?.metadata?.video_url, item?.thumbnail_url]);

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
    // Load X transcript from metadata if it exists
    if (item?.metadata?.extra_data?.x_transcript) {
      setXTranscript(item.metadata.extra_data.x_transcript);
    } else {
      setXTranscript(null);
    }
    // Load X image description from metadata if it exists
    if (item?.metadata?.extra_data?.x_image_description) {
      setXImageDescription(item.metadata.extra_data.x_image_description);
    } else {
      setXImageDescription(null);
    }
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

  const handleYouTubeTranscriptFetch = async (transcript: string) => {
    try {
      const response = await fetch('/api/update-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: item.id,
          metadata: {
            ...item.metadata,
            extra_data: { ...item.metadata?.extra_data, transcript }
          }
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update metadata');
      }
      
      if (onUpdateItem) await onUpdateItem(item.id, {});
    } catch (error) {
      console.error('Error saving YouTube transcript:', error);
    }
  };

  const handleXTranscript = async () => {
    setIsLoading(true);
    setCenterShelfView('transcript'); // Open center shelf immediately

    // Check if transcript already exists in metadata
    if (item.metadata?.extra_data?.x_transcript) {
      setXTranscript(item.metadata.extra_data.x_transcript);
      setIsLoading(false);
      return;
    }

    try {
      // Check video file size before sending to API
      const videoUrl = item.metadata.video_url;
      if (!videoUrl) {
        throw new Error('Video URL not found in item metadata.');
      }

      const headResponse = await fetch(videoUrl, { method: 'HEAD' });
      const contentLength = headResponse.headers.get('Content-Length');
      const videoSizeMB = contentLength ? parseInt(contentLength, 10) / (1024 * 1024) : 0;

      if (videoSizeMB > 25) {
        alert(`Video file size (${videoSizeMB.toFixed(2)} MB) exceeds the 25 MB limit for transcription.`);
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/transcribe-x-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: item.metadata.video_url }),
      });
      if (!response.ok) throw new Error('Failed to transcribe video');
      const data = await response.json();
      setXTranscript(data.transcript);
      // Use the API endpoint with service role key to update metadata
      try {
        const metadataResponse = await fetch('/api/update-metadata', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            itemId: item.id,
            metadata: {
              ...item.metadata,
              extra_data: { ...item.metadata?.extra_data, x_transcript: data.transcript }
            }
          }),
        });
        
        if (!metadataResponse.ok) {
          const errorData = await metadataResponse.json();
          throw new Error(errorData.error || 'Failed to update metadata');
        }
        
        // Refresh the item data
        if (onUpdateItem) await onUpdateItem(item.id, {});
      } catch (updateError) {
        console.error('Error saving transcript to database:', updateError);
      }
    } catch (error) {
      console.error('Error transcribing X video:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleXImageDescription = async () => {
    setIsLoading(true);
    setCenterShelfView('image-description'); // Open center shelf immediately

    // Check if image description already exists in metadata
    if (item.metadata?.extra_data?.x_image_description) {
      setXImageDescription(item.metadata.extra_data.x_image_description);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/describe-x-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: item.thumbnail_url, text: item.content }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.error || 'Failed to describe image');
      }
      const data = await response.json();
      setXImageDescription(data.description);
      
      // Save the image description to metadata using API with service role key
      try {
        const metadataResponse = await fetch('/api/update-metadata', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            itemId: item.id,
            metadata: {
              ...item.metadata,
              extra_data: { ...item.metadata?.extra_data, x_image_description: data.description }
            }
          }),
        });
        
        if (!metadataResponse.ok) {
          const errorData = await metadataResponse.json();
          throw new Error(errorData.error || 'Failed to update metadata');
        }
        
        // Refresh the item data
        if (onUpdateItem) await onUpdateItem(item.id, {});
      } catch (updateError) {
        console.error('Error saving image description to database:', updateError);
      }
    } catch (error) {
      console.error('Error describing X image:', error);
      alert('Failed to describe image. Please check the console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyXText = () => {
    navigator.clipboard.writeText(item.content);
  };

  const leftColumn = (
    <ContentViewer 
      item={item} 
      contentType={contentType}
      onUpdateMetadata={async (metadata) => {
        try {
          const response = await fetch('/api/update-metadata', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              itemId: item.id,
              metadata: metadata
            }),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update metadata');
          }
          
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
      if (twitterPostType === 'video' && xTranscript) {
        context += `\nTranscript:\n${xTranscript}`;
      } else if (twitterPostType === 'image' && xImageDescription) {
        context += `\nImage Description:\n${xImageDescription}`;
      } else {
        context += `\nPost Text:\n${item.content}`;
      }
    }
    return context;
  };

  const handleOpenChat = async () => {
    // Open chat immediately
    setCenterShelfView('chat');
    setIsLoading(true);
    
    try {
      // For YouTube videos, fetch transcript if not already available
      if (contentType === 'youtube' && !item.metadata?.extra_data?.transcript) {
        try {
          const response = await fetch('/api/transcript', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: item.url }),
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.transcript) {
              // Save the transcript to metadata
              await fetch('/api/update-metadata', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  itemId: item.id,
                  metadata: {
                    ...item.metadata,
                    extra_data: { ...item.metadata?.extra_data, transcript: data.transcript }
                  }
                }),
              });
              // Refresh the item data
              if (onUpdateItem) await onUpdateItem(item.id, {});
            }
          }
        } catch (error) {
          console.error('Error fetching YouTube transcript for chat:', error);
        }
      }
      
      // For X posts, fetch transcript or image description if not already available
      if (contentType === 'twitter') {
        if (twitterPostType === 'video' && !xTranscript && !item.metadata?.extra_data?.x_transcript) {
          // Fetch video transcript inline without opening transcript view
          try {
            const videoUrl = item.metadata.video_url;
            if (videoUrl) {
              const headResponse = await fetch(videoUrl, { method: 'HEAD' });
              const contentLength = headResponse.headers.get('Content-Length');
              const videoSizeMB = contentLength ? parseInt(contentLength, 10) / (1024 * 1024) : 0;

              if (videoSizeMB <= 25) {
                const response = await fetch('/api/transcribe-x-video', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ videoUrl: item.metadata.video_url }),
                });
                
                if (response.ok) {
                  const data = await response.json();
                  setXTranscript(data.transcript);
                  
                  // Save to metadata
                  await fetch('/api/update-metadata', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      itemId: item.id,
                      metadata: {
                        ...item.metadata,
                        extra_data: { ...item.metadata?.extra_data, x_transcript: data.transcript }
                      }
                    }),
                  });
                  if (onUpdateItem) await onUpdateItem(item.id, {});
                }
              }
            }
          } catch (error) {
            console.error('Error fetching X video transcript for chat:', error);
          }
        } else if (twitterPostType === 'image' && !xImageDescription && !item.metadata?.extra_data?.x_image_description) {
          // Fetch image description inline without opening description view
          try {
            const response = await fetch('/api/describe-x-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ imageUrl: item.thumbnail_url, text: item.content }),
            });
            
            if (response.ok) {
              const data = await response.json();
              setXImageDescription(data.description);
              
              // Save to metadata
              await fetch('/api/update-metadata', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  itemId: item.id,
                  metadata: {
                    ...item.metadata,
                    extra_data: { ...item.metadata?.extra_data, x_image_description: data.description }
                  }
                }),
              });
              if (onUpdateItem) await onUpdateItem(item.id, {});
            }
          } catch (error) {
            console.error('Error fetching X image description for chat:', error);
          }
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const rightColumn = (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <EditableTitle title={item.title} onSave={handleSaveTitle} />
      </div>
      <div className="flex-1 overflow-auto">
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
            onChat={handleOpenChat}
            chatContext={getChatContext()}
          />
        )}
        {contentType === 'twitter' && (
          <XToolsSection
            postType={twitterPostType as 'video' | 'image' | 'text'}
            onChat={handleOpenChat}
            onCopy={handleCopyXText}
            onShowTranscript={handleXTranscript}
            onShowImageDescription={handleXImageDescription}
            chatContext={getChatContext()}
          />
        )}
        <div className="p-4 border-t">
          <UserNotes itemId={item.id} initialNotes={userNotes} onSave={handleSaveNotes} />
        </div>
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
    if (isLoading) {
      // Show loading spinner while fetching transcript/description data
      centerShelfContent = (
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Chat</h2>
            <button
              onClick={() => setCenterShelfView(null)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">Loading transcript data...</p>
            </div>
          </div>
        </div>
      );
    } else {
      centerShelfContent = <Chat initialContext={getChatContext()} itemId={item.id} spaceId={null} onClose={() => setCenterShelfView(null)} />;
      console.log('Chat component rendered with itemId:', item.id, 'and spaceId:', null);
    }
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
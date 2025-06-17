'use client'

import { useState, useEffect, useRef } from 'react';
import { MockItem } from '@/utils/mockData';
import { Space, ItemWithMetadata } from '@/types/database';
import Modal from './Modal';
import Image from 'next/image';

interface ItemDetailModalProps {
  item: MockItem | ItemWithMetadata | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (item: MockItem) => void;
  onDelete?: (id: string) => void;
  onArchive?: (id: string) => void;
  onUpdateItem?: (id: string, updates: Partial<MockItem>) => void;
  onAddTag?: (itemId: string, tagName: string) => void;
  onRemoveTag?: (itemId: string, tagId: string) => void;
  spaces?: Space[];
}

const ContentTypeIcon = ({ type }: { type: MockItem['content_type'] }) => {
  const iconClass = "w-5 h-5 flex-shrink-0";
  
  switch (type) {
    case 'link':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      );
    case 'video':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    case 'image':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    case 'pdf':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case 'text':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case 'tweet':
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      );
    case 'movie':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16l13-8L7 4z" />
        </svg>
      );
    case 'tv-show':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    default:
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
  }
};

export default function ItemDetailModal({ 
  item, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete, 
  onArchive,
  onUpdateItem,
  onAddTag,
  onRemoveTag,
  spaces = []
}: ItemDetailModalProps) {
  const [newTag, setNewTag] = useState('');
  const [selectedSpace, setSelectedSpace] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [showTagInput, setShowTagInput] = useState(false);
  const [currentItem, setCurrentItem] = useState<MockItem | ItemWithMetadata | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isDownloadingVideo, setIsDownloadingVideo] = useState(false);
  const [directVideoUrl, setDirectVideoUrl] = useState<string | null>(null);
  const [isLoadingDirectUrl, setIsLoadingDirectUrl] = useState(false);
  const [showSpaceSelector, setShowSpaceSelector] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const spaceSelectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (item && isOpen) {
      setCurrentItem(item);
      setEditedTitle(item.title || '');
      setEditedDescription(item.description || '');
      
      // Load transcript if available
      if ('metadata' in item && item.metadata?.extra_data?.transcript) {
        setTranscript(item.metadata.extra_data.transcript);
      } else {
        setTranscript(null);
      }
      setShowTranscript(false);
      
      // Handle tags from both mock data (metadata.tags) and real data (tags array)
      const tagNames = item.tags && Array.isArray(item.tags) 
        ? item.tags.map(tag => typeof tag === 'string' ? tag : tag.name)
        : item.metadata?.tags || [];
      setTags(tagNames);
      
      // Handle both string (mock) and object (real) space data
      const spaceId = typeof item.space === 'string' 
        ? item.space 
        : item.space?.id || 'none';
      setSelectedSpace(spaceId);
    }
  }, [item, isOpen]);

  // Update local state when item changes (after operations like adding tags or moving spaces)
  useEffect(() => {
    if (item && currentItem && item.id === currentItem.id) {
      // Update tags if they've changed - only update if the tag arrays are actually different
      const newTagNames = item.tags && Array.isArray(item.tags) 
        ? item.tags.map(tag => typeof tag === 'string' ? tag : tag.name)
        : item.metadata?.tags || [];
      
      // Only update tags if they're actually different to prevent unnecessary re-renders
      const currentTagsStr = tags.slice().sort().join(',');
      const newTagsStr = newTagNames.slice().sort().join(',');
      if (currentTagsStr !== newTagsStr) {
        setTags(newTagNames);
      }
      
      // Update selected space if it's changed
      const newSpaceId = typeof item.space === 'string' 
        ? item.space 
        : item.space?.id || 'none';
      if (selectedSpace !== newSpaceId) {
        setSelectedSpace(newSpaceId);
      }
      
      // Update current item and edited title/description
      setCurrentItem(item);
      setEditedTitle(item.title || '');
      setEditedDescription(item.description || '');
      
      // Update transcript if it's been added to the item metadata
      const itemTranscript = 'metadata' in item ? item.metadata?.extra_data?.transcript : null;
      if (itemTranscript && itemTranscript !== transcript) {
        setTranscript(itemTranscript);
      }
    }
  }, [item, currentItem, tags, selectedSpace, transcript]);

  // Close space selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (spaceSelectorRef.current && !spaceSelectorRef.current.contains(event.target as Node)) {
        setShowSpaceSelector(false);
      }
    };

    if (showSpaceSelector) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSpaceSelector]);

  // Don't render if never opened or no item data
  if (!currentItem) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const formatTweetDate = (dateString: string | undefined) => {
    if (!dateString) return formatDate(currentItem.created_at);
    
    // If it's already formatted like "10:30 AM · Nov 15, 2024", return as is
    if (dateString.includes('·')) return dateString;
    
    // Otherwise parse and format
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; // Return original if parsing fails
      
      // Format to match Twitter style: "10:30 AM · Nov 15, 2024"
      const timeOptions: Intl.DateTimeFormatOptions = { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      };
      const dateOptions: Intl.DateTimeFormatOptions = { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      };
      
      const time = date.toLocaleTimeString('en-US', timeOptions);
      const dateStr = date.toLocaleDateString('en-US', dateOptions);
      
      return `${time} · ${dateStr}`;
    } catch {
      return dateString;
    }
  };


  const handleOpenUrl = () => {
    if (currentItem.url) {
      window.open(currentItem.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleAddTag = async () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      if (onAddTag) {
        try {
          await onAddTag(currentItem.id, newTag.trim());
          // Don't optimistically update - let the parent update the item prop
        } catch (error) {
          console.error('Failed to add tag:', error);
        }
      }
      setNewTag('');
      setShowTagInput(false);
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    if (onRemoveTag && currentItem && 'tags' in currentItem && Array.isArray(currentItem.tags)) {
      // Find the tag object with the matching name to get its ID
      const tagToDelete = currentItem.tags.find(tag => 
        typeof tag === 'object' && tag.name === tagToRemove
      );
      
      if (tagToDelete && typeof tagToDelete === 'object' && 'id' in tagToDelete) {
        try {
          await onRemoveTag(currentItem.id, tagToDelete.id);
          // Don't optimistically update - let the parent update the item prop
        } catch (error) {
          console.error('Failed to remove tag:', error);
        }
      }
    }
  };

  const handleSpaceChange = (newSpaceId: string) => {
    setSelectedSpace(newSpaceId);
    setShowSpaceSelector(false); // Close the dropdown
    
    // Find the space name by ID for the update
    const spaceName = newSpaceId === 'none' ? undefined : spaces.find(s => s.id === newSpaceId)?.name;
    
    onUpdateItem?.(currentItem.id, { 
      space: spaceName 
    });
  };

  const handleCopyUrl = async () => {
    if (currentItem.url) {
      try {
        await navigator.clipboard.writeText(currentItem.url);
        // Could add a toast notification here in the future
      } catch (error) {
        console.error('Failed to copy URL:', error);
      }
    }
  };

  const handleGenerateTranscript = async () => {
    if (!currentItem) {
      return;
    }
    
    // If transcript already exists, toggle show/hide
    if (transcript) {
      setShowTranscript(!showTranscript);
      return;
    }
    setIsLoadingTranscript(true);
    
    try {
      let mediaId: string | undefined;
      let mediaType: 'youtube' | 'audio' = 'youtube';
      
      if (currentItem.content_type === 'youtube') {
        // Extract video ID from YouTube URL
        const videoIdMatch = currentItem.url?.match(/(?:v=|youtu\.be\/|shorts\/)([a-zA-Z0-9_-]+)/);
        mediaId = videoIdMatch?.[1];
        
        if (!mediaId) {
          throw new Error('Invalid YouTube URL');
        }
      } else if (currentItem.content_type === 'audio') {
        // For podcasts/audio, we'd use the URL or some other identifier
        mediaType = 'audio';
        mediaId = currentItem.url || currentItem.id;
      }
      
      // Call API to get transcript
      const response = await fetch('/api/transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: currentItem.id,
          url: currentItem.url,
          contentType: currentItem.content_type
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate transcript');
      }
      
      setTranscript(data.transcript);
      setShowTranscript(true);
      
      // Update local state if transcript was newly generated
      if (!data.cached && 'metadata' in currentItem) {
        // Update the current item's metadata with the transcript
        const updatedItem = {
          ...currentItem,
          metadata: {
            ...currentItem.metadata,
            extra_data: {
              ...currentItem.metadata?.extra_data,
              transcript: data.transcript
            }
          }
        };
        setCurrentItem(updatedItem);
        
        // Notify parent component to refresh the item data
        // This ensures when modal reopens, it has the transcript
        if (onUpdateItem) {
          onUpdateItem(currentItem.id, {});
        }
      }
      
    } catch (error) {
      console.error('Failed to generate transcript:', error);
      
      // Show error message to user
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate transcript';
      
      if (errorMessage.includes('temporarily unavailable') || errorMessage.includes('interface')) {
        alert(`⚠️ ${errorMessage}\n\nYouTube frequently updates their interface which can temporarily break transcript extraction. The YouTube.js library maintainers usually fix these issues quickly.`);
      } else {
        alert(`❌ ${errorMessage}\n\nThis video may not have captions available, or captions may be auto-generated only.`);
      }
    } finally {
      setIsLoadingTranscript(false);
    }
  };

  const handleDownloadVideo = async () => {
    if (!currentItem || currentItem.content_type !== 'youtube' || !currentItem.url) {
      return;
    }
    
    setIsDownloadingVideo(true);
    
    try {
      // Get the direct download URL from YouTube - server just provides the URL
      const response = await fetch('/api/get-download-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: currentItem.url
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get download URL');
      }
      
      const data = await response.json();
      
      // Create a download link that downloads directly from YouTube's servers
      const link = document.createElement('a');
      link.href = data.downloadUrl;
      link.download = data.filename;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.style.display = 'none';
      
      // Add to DOM, trigger download, and cleanup
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success message with video details
      alert(`✅ Download started!\n\nFile: ${data.filename}\nQuality: ${data.quality}\n${data.size ? `Size: ${Math.round(parseInt(data.size) / 1024 / 1024)}MB` : ''}\n\nCheck your Downloads folder.`);
      
    } catch (error) {
      console.error('Failed to download video:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to download video';
      alert(`❌ ${errorMessage}\n\nPossible reasons:\n• Video is private or restricted\n• Video requires sign-in\n• Video is too large\n• YouTube blocked the request`);
    } finally {
      setIsDownloadingVideo(false);
    }
  };

  const handleGetDirectUrl = async () => {
    if (!currentItem || currentItem.content_type !== 'youtube' || !currentItem.url) {
      return;
    }
    
    setIsLoadingDirectUrl(true);
    
    try {
      const response = await fetch('/api/get-download-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: currentItem.url
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get direct URL');
      }
      
      const data = await response.json();
      setDirectVideoUrl(data.downloadUrl);
      
      // Show success message
      alert(`✅ Direct URL generated!\n\nQuality: ${data.quality}\n${data.size ? `Size: ${Math.round(parseInt(data.size) / 1024 / 1024)}MB` : ''}\n\nNote: This URL is temporary and will expire in a few hours.`);
      
    } catch (error) {
      console.error('Failed to get direct URL:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get direct URL';
      alert(`❌ ${errorMessage}\n\nThis is often due to YouTube's restrictions or the video being private/restricted.`);
    } finally {
      setIsLoadingDirectUrl(false);
    }
  };

  const handleTitleEdit = () => {
    setIsEditingTitle(true);
  };

  const handleTitleSave = () => {
    if (editedTitle.trim() !== currentItem.title) {
      onUpdateItem?.(currentItem.id, { title: editedTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setEditedTitle(currentItem.title || '');
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTitleSave();
    } else if (e.key === 'Escape') {
      handleTitleCancel();
    }
  };

  const handleDescriptionEdit = () => {
    setIsEditingDescription(true);
  };

  const handleDescriptionSave = () => {
    if (editedDescription.trim() !== currentItem.description) {
      onUpdateItem?.(currentItem.id, { description: editedDescription.trim() });
    }
    setIsEditingDescription(false);
  };

  const handleDescriptionCancel = () => {
    setEditedDescription(currentItem.description || '');
    setIsEditingDescription(false);
  };

  const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleDescriptionSave();
    } else if (e.key === 'Escape') {
      handleDescriptionCancel();
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      modalId="item-detail-modal"
      isFullscreen={isFullscreen}
    >
      <div id="modal-container" className="flex flex-col h-full">
        {/* Two-Column Layout */}
        <div id="modal-content" className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {/* Left Column - Main Content */}
          <div id="modal-left-column" className="flex-1 flex flex-col items-center overflow-y-auto p-6">
            <div className={`w-full max-w-[1000px] flex flex-col ${
              currentItem?.content_type === 'note' ? '' : 'justify-center'
            }`}>
          {/* Thumbnail - Hide for X/Twitter, YouTube, images, Instagram, TikTok, and movies since they have special displays, but show for TV shows */}
          {currentItem.thumbnail_url && currentItem.content_type !== 'x' && currentItem.content_type !== 'youtube' && currentItem.content_type !== 'image' && currentItem.content_type !== 'instagram' && currentItem.content_type !== 'tiktok' && currentItem.content_type !== 'movie' && !(currentItem.content_type === 'video' && (currentItem.url?.includes('imdb.com/title/') || currentItem.metadata?.imdb_id) && !currentItem.metadata?.is_tv_show) && (
            <div className="mb-6">
              <img 
                src={currentItem.thumbnail_url} 
                alt={currentItem.title}
                className={
                  currentItem.content_type === 'tv-show' || (currentItem.content_type === 'video' && currentItem.metadata?.is_tv_show)
                    ? "w-full max-h-[60vh] object-contain rounded-lg bg-gray-100 !h-auto"
                    : "w-full h-48 object-cover rounded-lg bg-gray-100"
                }
              />
            </div>
          )}

          {/* Instagram Thumbnail - Fit modal height */}
          {currentItem.content_type === 'instagram' && currentItem.thumbnail_url && (
            <div className="mb-6">
              <img 
                src={currentItem.thumbnail_url} 
                alt={currentItem.title}
                className="w-full max-h-[500px] object-contain rounded-lg bg-gray-100"
              />
            </div>
          )}

          {/* TikTok Thumbnail or Mobile Phone Placeholder */}
          {currentItem.content_type === 'tiktok' && (
            <div className="mb-6 flex justify-center">
              {currentItem.thumbnail_url ? (
                <img 
                  src={currentItem.thumbnail_url} 
                  alt={currentItem.title}
                  className="max-w-[300px] max-h-[500px] object-contain rounded-2xl bg-gray-100"
                />
              ) : (
                <div 
                  className="w-[200px] h-[355px] bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow-lg"
                  onClick={() => currentItem.url && window.open(currentItem.url, '_blank')}
                  title="Open TikTok video"
                >
                  <svg className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
                    Tap to view<br />TikTok video
                  </p>
                  {currentItem.metadata?.username && (
                    <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
                      @{currentItem.metadata.username}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Movie Poster */}
          {(currentItem.content_type === 'movie' || (currentItem.content_type === 'video' && (currentItem.url?.includes('imdb.com/title/') || currentItem.metadata?.imdb_id) && !currentItem.metadata?.is_tv_show)) && (
            <div className="mb-6 flex justify-center">
              {currentItem.thumbnail_url ? (
                <img 
                  src={currentItem.thumbnail_url} 
                  alt={currentItem.title}
                  className="max-w-[300px] max-h-[450px] object-contain rounded-lg bg-gray-100 shadow-lg"
                />
              ) : (
                <div className="w-[200px] h-[300px] bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center shadow-lg">
                  <svg className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V3a1 1 0 011 1v4M7 4H5a1 1 0 00-1 1v10a1 1 0 001 1h2m0-12V4m0 0h8m-8 0v12m8-12v4m0 0v8a1 1 0 01-1 1H7" />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400 text-sm text-center font-medium">
                    {currentItem.title}
                  </p>
                  {currentItem.metadata?.published_date && (
                    <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                      ({currentItem.metadata.published_date})
                    </p>
                  )}
                </div>
              )}
            </div>
          )}


          {/* Content-Type Specific Sections */}
          
          {currentItem.content_type === 'youtube' && (
            <div className="mb-6">
              {/* YouTube Video Embed */}
              <div className="aspect-video rounded-lg overflow-hidden bg-black">
                {(() => {
                  const videoIdMatch = currentItem.url?.match(/(?:v=|youtu\.be\/|shorts\/)([a-zA-Z0-9_-]+)/);
                  const videoId = videoIdMatch?.[1];
                  
                  if (videoId) {
                    return (
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&showinfo=0&controls=1&disablekb=0&fs=1&iv_load_policy=3&cc_load_policy=0&playsinline=1`}
                        title={currentItem.title}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    );
                  }
                  return (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <p>Unable to load video</p>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Transcript Display for YouTube and Audio */}
          {(currentItem.content_type === 'youtube' || currentItem.content_type === 'audio') && showTranscript && transcript && (
            <div className="mb-6">
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Transcript
                  </h3>
                  <button
                    onClick={() => navigator.clipboard.writeText(transcript)}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Copy
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                    {transcript}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Image Display */}
          {currentItem.content_type === 'image' && currentItem.thumbnail_url && (
            <div className="mb-6">
              <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img 
                  src={currentItem.thumbnail_url} 
                  alt={currentItem.title}
                  className="w-full h-auto max-h-[70vh] object-contain"
                />
              </div>
            </div>
          )}

          {currentItem.content_type === 'github' && (
            <div className="mb-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub Repository
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {currentItem.metadata?.stars && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Stars:</span>
                      <span className="ml-2 font-medium">{currentItem.metadata.stars.toLocaleString()}</span>
                    </div>
                  )}
                  {currentItem.metadata?.forks && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Forks:</span>
                      <span className="ml-2 font-medium">{currentItem.metadata.forks.toLocaleString()}</span>
                    </div>
                  )}
                  {currentItem.metadata?.language && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Language:</span>
                      <span className="ml-2 font-medium">{currentItem.metadata.language}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Clone Repo
                  </button>
                  <button className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    Star
                  </button>
                </div>
              </div>
            </div>
          )}

          {(currentItem.content_type === 'amazon' || currentItem.content_type === 'product') && (
            <div className="mb-6 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <h3 className="font-medium text-orange-900 dark:text-orange-100 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Product
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {currentItem.metadata?.price && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Price:</span>
                      <span className="ml-2 font-medium text-green-600 dark:text-green-400">{currentItem.metadata.price}</span>
                    </div>
                  )}
                  {currentItem.metadata?.rating && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Rating:</span>
                      <span className="ml-2 font-medium">{currentItem.metadata.rating}/5 ⭐</span>
                    </div>
                  )}
                  {currentItem.metadata?.reviews && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Reviews:</span>
                      <span className="ml-2 font-medium">{currentItem.metadata.reviews.toLocaleString()}</span>
                    </div>
                  )}
                  {currentItem.metadata?.in_stock !== undefined && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Stock:</span>
                      <span className={`ml-2 font-medium ${currentItem.metadata.in_stock ? 'text-green-600' : 'text-red-600'}`}>
                        {currentItem.metadata.in_stock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.5 12.5l6 6 9-13.5" />
                    </svg>
                    Price Alert
                  </button>
                  <button className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Wishlist
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentItem.content_type === 'article' && (
            <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                Article
              </h3>
              <div className="space-y-3">
                <div className="text-sm">
                  {currentItem.metadata?.published_date && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Published:</span>
                      <span className="ml-2 font-medium">{new Date(currentItem.metadata.published_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Summarize
                  </button>
                  <button className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Mark Read
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* X/Twitter Post */}
          {currentItem.content_type === 'x' && (
            <div className="mb-6 flex justify-center">
              <div className="max-w-md w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
                {/* Tweet Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center overflow-hidden relative">
                    {currentItem.metadata?.extra_data?.profile_image ? (
                      <>
                        <img 
                          src={currentItem.metadata.extra_data.profile_image}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Hide the image and show fallback icon
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                        <svg 
                          className="w-6 h-6 text-gray-600 dark:text-gray-400 absolute inset-0 m-auto hidden" 
                          fill="currentColor" 
                          viewBox="0 0 24 24"
                          style={{ display: 'none' }}
                        >
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                      </>
                    ) : (
                      <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 dark:text-gray-100">
                        {currentItem.metadata?.extra_data?.display_name || currentItem.metadata?.username || currentItem.metadata?.author?.replace('@', '') || 'User'}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        @{currentItem.metadata?.username || currentItem.metadata?.author?.replace('@', '') || 'user'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTweetDate(currentItem.metadata?.extra_data?.tweet_date)}
                    </div>
                  </div>
                  <div className="w-5 h-5">
                    <svg className="w-5 h-5 text-black dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </div>
                </div>

                {/* Tweet Content */}
                <div className="mb-3">
                  {isEditingDescription ? (
                    <div className="space-y-2">
                      <textarea
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        onKeyDown={handleDescriptionKeyDown}
                        className="w-full min-h-20 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                        placeholder="Enter tweet content..."
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={handleDescriptionCancel}
                          className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 border border-gray-300 dark:border-gray-600 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDescriptionSave}
                          className="px-2 py-1 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="group">
                      <div className="flex items-start gap-2">
                        <p className="text-gray-900 dark:text-gray-100 leading-relaxed flex-1">
                          {currentItem.description || currentItem.title}
                        </p>
                        <button
                          onClick={handleDescriptionEdit}
                          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 transition-opacity flex-shrink-0"
                          title="Edit tweet content"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tweet Media - Video or Image */}
                {currentItem.thumbnail_url && (
                  <div className="mb-3 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                    {(currentItem.metadata?.extra_data?.video_url || 
                      currentItem.metadata?.extra_data?.video_type || 
                      currentItem.title?.toLowerCase().includes('video') ||
                      currentItem.description?.toLowerCase().includes('video') ||
                      currentItem.url?.includes('/video/')) ? (
                      <div className="relative">
                        {/* Video thumbnail with play button overlay */}
                        <div className="relative group cursor-pointer" onClick={() => window.open(currentItem.url, '_blank')}>
                          <img 
                            src={currentItem.thumbnail_url}
                            alt="Video thumbnail"
                            className="w-full h-auto"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                          {/* Play button overlay */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 group-hover:bg-opacity-50 transition-all">
                            <div className="w-16 h-16 bg-black bg-opacity-60 rounded-full flex items-center justify-center">
                              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </div>
                          </div>
                          {/* Video indicator */}
                          <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                            Video
                          </div>
                        </div>
                      </div>
                    ) : (
                      <img 
                        src={currentItem.thumbnail_url}
                        alt="Tweet media"
                        className="w-full h-auto"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    )}
                  </div>
                )}

                {/* Tweet Actions */}
                <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-1 hover:text-blue-500 cursor-pointer transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-xs">{currentItem.metadata?.extra_data?.replies || currentItem.metadata?.replies || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 hover:text-green-500 cursor-pointer transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="text-xs">{currentItem.metadata?.extra_data?.retweets || currentItem.metadata?.retweets || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 hover:text-red-500 cursor-pointer transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-xs">{currentItem.metadata?.extra_data?.likes || currentItem.metadata?.likes || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 hover:text-blue-500 cursor-pointer transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Description - Hide for X/Twitter, images, Instagram, TikTok, movies, and TV shows since they're shown in right column */}
          {(currentItem.description || currentItem.content_type === 'note') && currentItem.content_type !== 'x' && currentItem.content_type !== 'image' && currentItem.content_type !== 'instagram' && currentItem.content_type !== 'tiktok' && currentItem.content_type !== 'movie' && currentItem.content_type !== 'tv-show' && !(currentItem.content_type === 'video' && (currentItem.url?.includes('imdb.com/title/') || currentItem.metadata?.imdb_id)) && (
            <div className={currentItem.content_type === 'note' ? "flex-1 flex flex-col" : "mb-4"}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              {isEditingDescription ? (
                <div className={currentItem.content_type === 'note' ? "flex-1 flex flex-col space-y-2" : "space-y-2"}>
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    onKeyDown={handleDescriptionKeyDown}
                    className={
                      currentItem.content_type === 'note' 
                        ? "w-full flex-1 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        : "w-full min-h-24 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                    }
                    placeholder="Enter description..."
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={handleDescriptionCancel}
                      className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 border border-gray-300 dark:border-gray-600 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDescriptionSave}
                      className="px-3 py-1 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                    >
                      Save (Ctrl+Enter)
                    </button>
                  </div>
                </div>
              ) : (
                <div className={currentItem.content_type === 'note' ? "group flex-1 flex flex-col" : "group"}>
                  <div className={currentItem.content_type === 'note' ? "flex items-start gap-2 flex-1" : "flex items-start gap-2"}>
                    <p className={
                      currentItem.content_type === 'note' 
                        ? "text-gray-600 dark:text-gray-300 leading-relaxed flex-1 h-full overflow-y-auto"
                        : "text-gray-600 dark:text-gray-300 leading-relaxed flex-1"
                    }>
                      {currentItem.description || 'No description'}
                    </p>
                    <button
                      onClick={handleDescriptionEdit}
                      className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 transition-opacity flex-shrink-0"
                      title="Edit description"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
            </div>
          </div>

          {/* Right Column - Metadata & Actions */}
          <div id="modal-right-column" className="w-full md:w-96 flex-shrink-0 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 relative flex flex-col">
            {/* Close button - positioned in top right corner */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors modal-close-button"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto p-6 pb-20">
              
              {/* Title Section */}
              <div className="title-section mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    {isEditingTitle ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editedTitle}
                          onChange={(e) => setEditedTitle(e.target.value)}
                          onKeyDown={handleTitleKeyDown}
                          onBlur={handleTitleSave}
                          className="flex-1 text-lg font-semibold text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter title..."
                          autoFocus
                        />
                        <button
                          onClick={handleTitleSave}
                          className="text-green-600 hover:text-green-700 p-1"
                          title="Save"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          onClick={handleTitleCancel}
                          className="text-red-600 hover:text-red-700 p-1"
                          title="Cancel"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 group">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-1 flex-1">
                          {currentItem.title || 'Untitled'}
                        </h2>
                        <button
                          onClick={handleTitleEdit}
                          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 transition-opacity"
                          title="Edit title"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                    )}
                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize mt-1">
                      {currentItem.content_type}
                      {currentItem.metadata?.domain && (
                        <>
                          <span className="mx-1">•</span>
                          {currentItem.metadata.domain}
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>

            {/* Metadata */}
            <div className="space-y-4 mb-4">

            {/* Instagram Metadata */}
            {currentItem.content_type === 'instagram' && (
              <>
                {/* Instagram Post Type */}
                {currentItem.metadata?.instagram_post_type && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Post Type
                    </label>
                    <span className="text-gray-600 dark:text-gray-300 text-sm capitalize">
                      {currentItem.metadata.instagram_post_type}
                      {currentItem.metadata.instagram_post_type === 'carousel' && ' (Multiple Images)'}
                    </span>
                  </div>
                )}

                {/* Instagram Username */}
                {(currentItem.metadata?.instagram_username || currentItem.metadata?.instagram_engagement?.username) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Username
                    </label>
                    <span className="text-gray-600 dark:text-gray-300 text-sm">
                      @{currentItem.metadata?.instagram_username || currentItem.metadata?.instagram_engagement?.username}
                    </span>
                  </div>
                )}

                {/* Instagram Engagement */}
                {currentItem.metadata?.instagram_engagement?.likes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Likes
                    </label>
                    <span className="text-gray-600 dark:text-gray-300 text-sm">
                      {currentItem.metadata.instagram_engagement.likes.toLocaleString()}
                    </span>
                  </div>
                )}

                {currentItem.metadata?.instagram_engagement?.comments && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Comments
                    </label>
                    <span className="text-gray-600 dark:text-gray-300 text-sm">
                      {currentItem.metadata.instagram_engagement.comments.toLocaleString()}
                    </span>
                  </div>
                )}

                {currentItem.metadata?.instagram_engagement?.post_date && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Posted
                    </label>
                    <span className="text-gray-600 dark:text-gray-300 text-sm">
                      {currentItem.metadata.instagram_engagement.post_date}
                    </span>
                  </div>
                )}

                {/* Instagram Description */}
                {currentItem.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      {currentItem.description}
                    </p>
                  </div>
                )}

                {/* Carousel Indicator */}
                {currentItem.metadata?.instagram_post_type === 'carousel' && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md p-3">
                    <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      <span className="text-xs font-medium">Multiple Images</span>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* TikTok Metadata */}
            {currentItem.content_type === 'tiktok' && (
              <>
                {/* TikTok Username */}
                {(currentItem.metadata?.username || currentItem.metadata?.tiktok_engagement?.username) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Username
                    </label>
                    <span className="text-gray-600 dark:text-gray-300 text-sm">
                      @{currentItem.metadata?.username || currentItem.metadata?.tiktok_engagement?.username}
                    </span>
                  </div>
                )}

                {/* TikTok Duration */}
                {currentItem.metadata?.duration && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Duration
                    </label>
                    <span className="text-gray-600 dark:text-gray-300 text-sm">
                      {currentItem.metadata.duration}
                    </span>
                  </div>
                )}

                {/* TikTok Engagement - Likes */}
                {(currentItem.metadata?.likes || currentItem.metadata?.tiktok_engagement?.likes) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Likes
                    </label>
                    <span className="text-gray-600 dark:text-gray-300 text-sm">
                      {(currentItem.metadata?.likes || currentItem.metadata?.tiktok_engagement?.likes)?.toLocaleString()}
                    </span>
                  </div>
                )}

                {/* TikTok Engagement - Views */}
                {(currentItem.metadata?.views || currentItem.metadata?.tiktok_engagement?.views) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Views
                    </label>
                    <span className="text-gray-600 dark:text-gray-300 text-sm">
                      {(currentItem.metadata?.views || currentItem.metadata?.tiktok_engagement?.views)?.toLocaleString()}
                    </span>
                  </div>
                )}

                {/* TikTok Engagement - Comments */}
                {(currentItem.metadata?.replies || currentItem.metadata?.tiktok_engagement?.comments) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Comments
                    </label>
                    <span className="text-gray-600 dark:text-gray-300 text-sm">
                      {(currentItem.metadata?.replies || currentItem.metadata?.tiktok_engagement?.comments)?.toLocaleString()}
                    </span>
                  </div>
                )}

                {/* TikTok Engagement - Shares */}
                {(currentItem.metadata?.retweets || currentItem.metadata?.tiktok_engagement?.shares) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Shares
                    </label>
                    <span className="text-gray-600 dark:text-gray-300 text-sm">
                      {(currentItem.metadata?.retweets || currentItem.metadata?.tiktok_engagement?.shares)?.toLocaleString()}
                    </span>
                  </div>
                )}

                {/* TikTok Description */}
                {currentItem.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    {isEditingDescription ? (
                      <div className="space-y-2">
                        <textarea
                          value={editedDescription}
                          onChange={(e) => setEditedDescription(e.target.value)}
                          onKeyDown={handleDescriptionKeyDown}
                          className="w-full min-h-20 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y text-sm"
                          placeholder="Enter TikTok description..."
                          autoFocus
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={handleDescriptionCancel}
                            className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 border border-gray-300 dark:border-gray-600 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleDescriptionSave}
                            className="px-2 py-1 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="group">
                        <div className="flex items-start gap-2">
                          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed flex-1">
                            {currentItem.description}
                          </p>
                          <button
                            onClick={handleDescriptionEdit}
                            className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 transition-opacity flex-shrink-0"
                            title="Edit description"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Movie/TV Show Metadata */}
            {(currentItem.content_type === 'movie' || currentItem.content_type === 'tv-show' || (currentItem.content_type === 'video' && (currentItem.url?.includes('imdb.com/title/') || currentItem.metadata?.imdb_id))) && (
              <>
                {/* Movie Year */}
                {currentItem.metadata?.published_date && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Year
                    </label>
                    <span className="text-gray-600 dark:text-gray-300 text-sm">
                      {currentItem.metadata.published_date}
                    </span>
                  </div>
                )}

                {/* Movie Director */}
                {currentItem.metadata?.author && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Director
                    </label>
                    <span className="text-gray-600 dark:text-gray-300 text-sm">
                      {currentItem.metadata.author}
                    </span>
                  </div>
                )}

                {/* Movie Rating */}
                {currentItem.metadata?.rating && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      IMDB Rating
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-500">★</span>
                      <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                        {currentItem.metadata.rating}/10
                      </span>
                    </div>
                  </div>
                )}

                {/* Movie Duration */}
                {currentItem.metadata?.duration && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Duration
                    </label>
                    <span className="text-gray-600 dark:text-gray-300 text-sm">
                      {currentItem.metadata.duration}
                    </span>
                  </div>
                )}

                {/* Movie Genre */}
                {currentItem.metadata?.genre && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Genre
                    </label>
                    <span className="text-gray-600 dark:text-gray-300 text-sm">
                      {currentItem.metadata.genre}
                    </span>
                  </div>
                )}

                {/* Movie Cast */}
                {currentItem.metadata?.cast && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cast
                    </label>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      {Array.isArray(currentItem.metadata.cast) 
                        ? currentItem.metadata.cast.join(', ')
                        : currentItem.metadata.cast
                      }
                    </p>
                  </div>
                )}

                {/* Movie Description */}
                {currentItem.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Plot
                    </label>
                    {isEditingDescription ? (
                      <div className="space-y-2">
                        <textarea
                          value={editedDescription}
                          onChange={(e) => setEditedDescription(e.target.value)}
                          onKeyDown={handleDescriptionKeyDown}
                          className="w-full min-h-20 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y text-sm"
                          placeholder="Enter movie plot..."
                          autoFocus
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={handleDescriptionCancel}
                            className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 border border-gray-300 dark:border-gray-600 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleDescriptionSave}
                            className="px-2 py-1 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="group">
                        <div className="flex items-start gap-2">
                          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed flex-1">
                            {currentItem.description}
                          </p>
                          <button
                            onClick={handleDescriptionEdit}
                            className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 transition-opacity flex-shrink-0"
                            title="Edit plot"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* X/Twitter URL */}
            {currentItem.content_type === 'x' && currentItem.url && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Post URL
                </label>
                <div className="space-y-2">
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md text-xs text-gray-600 dark:text-gray-400 break-all">
                    {currentItem.url}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopyUrl}
                      className="flex-1 px-3 py-1.5 text-xs bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copy
                    </button>
                    <button
                      onClick={handleOpenUrl}
                      className="flex-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Open
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* YouTube Video Metadata & Actions */}
            {currentItem.content_type === 'youtube' && (
              <>
                {/* YouTube URL */}
                {currentItem.url && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Video URL
                    </label>
                    <div className="space-y-2">
                      <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md text-xs text-gray-600 dark:text-gray-400 break-all">
                        {currentItem.url}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleCopyUrl}
                          className="flex-1 px-3 py-1.5 text-xs bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                          Copy
                        </button>
                        <button
                          onClick={handleOpenUrl}
                          className="flex-1 px-3 py-1.5 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                          Open
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Thumbnail with Download/Copy Options */}
                {currentItem.thumbnail_url && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Thumbnail
                    </label>
                    <div className="space-y-3">
                      <div className="relative">
                        <img 
                          src={currentItem.thumbnail_url} 
                          alt="Video thumbnail"
                          className="w-full rounded-lg bg-gray-100"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigator.clipboard.writeText(currentItem.thumbnail_url || '')}
                          className="flex-1 px-3 py-1.5 text-xs bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                          Copy URL
                        </button>
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = currentItem.thumbnail_url || '';
                            link.download = `thumbnail-${currentItem.title}.jpg`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="flex-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Enhanced YouTube Video Stats */}
                <div className="space-y-4 mb-4">
                  {/* Channel Information */}
                  {(currentItem.metadata?.author || currentItem.metadata?.profile_image) && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                          {currentItem.metadata.profile_image ? (
                            <Image 
                              src={currentItem.metadata.profile_image} 
                              alt="Channel avatar"
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <svg 
                            className={`w-6 h-6 text-gray-400 dark:text-gray-500 ${currentItem.metadata.profile_image ? 'hidden' : 'flex'}`}
                            fill="currentColor" 
                            viewBox="0 0 24 24"
                            style={{ display: currentItem.metadata.profile_image ? 'none' : 'flex' }}
                          >
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {currentItem.metadata.author}
                          </div>
                          {currentItem.metadata?.extra_data?.youtube?.channel_subscribers && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {parseInt(currentItem.metadata.extra_data.youtube.channel_subscribers).toLocaleString()} subscribers
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Video Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {currentItem.metadata?.duration && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Duration
                        </label>
                        <span className="text-gray-600 dark:text-gray-300 text-sm">
                          {currentItem.metadata.duration}
                        </span>
                      </div>
                    )}
                    {(currentItem.metadata?.views || currentItem.metadata?.extra_data?.views) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Views
                        </label>
                        <span className="text-gray-600 dark:text-gray-300 text-sm">
                          {parseInt(currentItem.metadata.views || currentItem.metadata.extra_data.views).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {(currentItem.metadata?.likes || currentItem.metadata?.extra_data?.likes) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Likes
                        </label>
                        <span className="text-gray-600 dark:text-gray-300 text-sm">
                          {parseInt(currentItem.metadata.likes || currentItem.metadata.extra_data.likes).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {currentItem.metadata?.published_date && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Published
                        </label>
                        <span className="text-gray-600 dark:text-gray-300 text-sm">
                          {new Date(currentItem.metadata.published_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Additional Metadata */}
                  {currentItem.metadata?.extra_data?.youtube?.category && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Category
                      </label>
                      <span className="text-gray-600 dark:text-gray-300 text-sm">
                        {currentItem.metadata.extra_data.youtube.category}
                      </span>
                    </div>
                  )}

                  {/* Tags */}
                  {currentItem.metadata?.extra_data?.youtube?.tags && currentItem.metadata.extra_data.youtube.tags.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tags
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {currentItem.metadata.extra_data.youtube.tags.slice(0, 10).map((tag: string, index: number) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {currentItem.metadata.extra_data.youtube.tags.length > 10 && (
                          <span className="px-2 py-1 text-gray-500 text-xs">
                            +{currentItem.metadata.extra_data.youtube.tags.length - 10} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Direct Video URL Section */}
                {directVideoUrl && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Direct Video URL
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400" title="This URL is temporary and will expire in a few hours">
                        ⚠️ Temporary
                      </span>
                    </label>
                    <div className="space-y-2">
                      <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md text-xs text-gray-600 dark:text-gray-400 break-all font-mono">
                        {directVideoUrl}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigator.clipboard.writeText(directVideoUrl)}
                          className="flex-1 px-3 py-1.5 text-xs bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                          Copy URL
                        </button>
                        <button
                          onClick={() => window.open(directVideoUrl, '_blank')}
                          className="flex-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Open
                        </button>
                        <button
                          onClick={() => setDirectVideoUrl(null)}
                          className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-1"
                          title="Clear URL"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* YouTube Actions */}
                <div className="space-y-2 mb-4">
                  <button
                    onClick={handleGenerateTranscript}
                    disabled={isLoadingTranscript}
                    className="w-full px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingTranscript ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {transcript ? (showTranscript ? 'Hide' : 'Show') : 'Get'} Transcript
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={handleGetDirectUrl}
                    disabled={isLoadingDirectUrl}
                    className="w-full px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingDirectUrl ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Getting URL...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        {directVideoUrl ? 'Regenerate' : 'Get'} Direct URL
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

            {/* Audio/Podcast Metadata & Actions */}
            {currentItem.content_type === 'audio' && (
              <>
                {/* Audio URL */}
                {currentItem.url && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Audio URL
                    </label>
                    <div className="space-y-2">
                      <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md text-xs text-gray-600 dark:text-gray-400 break-all">
                        {currentItem.url}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleCopyUrl}
                          className="flex-1 px-3 py-1.5 text-xs bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                          Copy
                        </button>
                        <button
                          onClick={handleOpenUrl}
                          className="flex-1 px-3 py-1.5 text-xs bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                          </svg>
                          Open
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Audio Duration */}
                {currentItem.metadata?.duration && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Duration
                    </label>
                    <span className="text-gray-600 text-sm">
                      {Math.floor(currentItem.metadata.duration / 60)}:{String(currentItem.metadata.duration % 60).padStart(2, '0')}
                    </span>
                  </div>
                )}

                {/* Audio Actions */}
                <div className="space-y-2 mb-4">
                  <button
                    onClick={handleGenerateTranscript}
                    disabled={isLoadingTranscript}
                    className="w-full px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingTranscript ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {transcript ? (showTranscript ? 'Hide' : 'Show') : 'Get'} Transcript
                      </>
                    )}
                  </button>
                  <button className="w-full px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Add to Queue
                  </button>
                </div>
              </>
            )}

            {/* Image Metadata & Actions */}
            {currentItem.content_type === 'image' && (
              <>
                {/* Image Description */}
                {currentItem.description && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      {currentItem.description}
                    </p>
                  </div>
                )}

                {/* Image URL (if exists) */}
                {currentItem.url && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Source URL
                    </label>
                    <div className="space-y-2">
                      <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md text-xs text-gray-600 dark:text-gray-400 break-all">
                        {currentItem.url}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleCopyUrl}
                          className="flex-1 px-3 py-1.5 text-xs bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                          Copy
                        </button>
                        <button
                          onClick={handleOpenUrl}
                          className="flex-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Open
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Image Download/Copy Actions */}
                {currentItem.thumbnail_url && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Image Actions
                    </label>
                    <div className="space-y-2">
                      <button
                        onClick={() => navigator.clipboard.writeText(currentItem.thumbnail_url || '')}
                        className="w-full px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        Copy Image URL
                      </button>
                      <button
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = currentItem.thumbnail_url || '';
                          link.download = `${currentItem.title}.jpg`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download Image
                      </button>
                      <button
                        onClick={() => window.open(currentItem.thumbnail_url, '_blank')}
                        className="w-full px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Open in New Tab
                      </button>
                    </div>
                  </div>
                )}

                {/* File size for images */}
                {currentItem.metadata?.file_size && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      File Size
                    </label>
                    <span className="text-gray-600 dark:text-gray-300 text-sm">
                      {currentItem.metadata.file_size}
                    </span>
                  </div>
                )}
              </>
            )}

            {/* Duration (for videos) - Hide for YouTube since it's shown in YouTube section */}
            {currentItem.metadata?.duration && currentItem.content_type !== 'youtube' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Duration
                </label>
                <span className="text-gray-600 text-sm">
                  {currentItem.metadata.duration}
                </span>
              </div>
            )}

            {/* File size (for PDFs) */}
            {currentItem.metadata?.file_size && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  File Size
                </label>
                <span className="text-gray-600 text-sm">
                  {currentItem.metadata.file_size}
                </span>
              </div>
            )}

            {/* Page count (for PDFs) */}
            {currentItem.metadata?.page_count && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Pages
                </label>
                <span className="text-gray-600 text-sm">
                  {currentItem.metadata.page_count} pages
                </span>
              </div>
            )}

            {/* General URL for all content types not already handled */}
            {currentItem.url && currentItem.content_type !== 'x' && currentItem.content_type !== 'youtube' && currentItem.content_type !== 'image' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL
                </label>
                <div className="space-y-2">
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md text-xs text-gray-600 dark:text-gray-400 break-all">
                    {currentItem.url}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopyUrl}
                      className="flex-1 px-3 py-1.5 text-xs bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copy
                    </button>
                    <button
                      onClick={handleOpenUrl}
                      className="flex-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Open
                    </button>
                  </div>
                </div>
              </div>
            )}
            </div>

            {/* Tags */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {/* Automatic Content Type Tag(s) - Always First */}
                {currentItem.content_type === 'youtube' && currentItem.url?.includes('/shorts/') ? (
                  <>
                    {/* YouTube Tag */}
                    <span className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-sm flex items-center gap-1.5 border border-purple-200 dark:border-purple-700">
                      <ContentTypeIcon type={currentItem.content_type} />
                      <span className="font-medium">YouTube</span>
                    </span>
                    {/* Shorts Tag */}
                    <span className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-sm flex items-center gap-1.5 border border-purple-200 dark:border-purple-700">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                      </svg>
                      <span className="font-medium">Shorts</span>
                    </span>
                  </>
                ) : (
                  /* Regular Single Content Type Tag */
                  <span className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-sm flex items-center gap-1.5 border border-purple-200 dark:border-purple-700">
                    <ContentTypeIcon type={currentItem.content_type} />
                    <span className="font-medium">
                      {currentItem.content_type === 'tv-show' ? 'TV Show' : 
                       currentItem.content_type === 'x' ? 'X Post' :
                       currentItem.content_type === 'youtube' ? 'YouTube' :
                       currentItem.content_type === 'tiktok' ? 'TikTok' :
                       currentItem.content_type === 'instagram' ? 'Instagram' :
                       currentItem.content_type === 'movie' ? 'Movie' :
                       currentItem.content_type === 'article' ? 'Article' :
                       currentItem.content_type === 'bookmark' ? 'Bookmark' :
                       currentItem.content_type === 'note' ? 'Note' :
                       currentItem.content_type === 'pdf' ? 'PDF' :
                       currentItem.content_type === 'image' ? 'Image' :
                       currentItem.content_type === 'video' ? 'Video' :
                       currentItem.content_type === 'audio' ? 'Audio' :
                       currentItem.content_type.charAt(0).toUpperCase() + currentItem.content_type.slice(1).replace('-', ' ')}
                    </span>
                  </span>
                )}
                
                {/* User Tags */}
                {tags.map((tag) => (
                  <span 
                    key={tag}
                    className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm flex items-center gap-1"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
                
                {/* Add Tag Input/Button */}
                {showTagInput ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      onBlur={() => {
                        if (!newTag.trim()) setShowTagInput(false);
                      }}
                      className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      placeholder="Add tag..."
                      autoFocus
                    />
                    <button
                      onClick={handleAddTag}
                      className="p-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowTagInput(true)}
                    className="px-3 py-1 border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 rounded-full text-sm hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    + Add tag
                  </button>
                )}
              </div>
            </div>

              {/* Created date */}
              <div className="text-sm text-gray-500 border-t pt-4">
                Added on {formatDate(currentItem.created_at)}
              </div>
            </div>
            {/* Fixed Bottom Bar - spans only the right column */}
            <div id="modal-right-column-bottom-bar" className="absolute bottom-0 inset-x-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="space-selector-button-container flex items-center gap-3">
                {/* Delete Button */}
                {onDelete && (
                  <button
                    onClick={() => onDelete(currentItem.id)}
                    className="p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors flex-shrink-0"
                    title="Delete item"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}

                {/* Space Selector Button */}
                <div ref={spaceSelectorRef} className="relative flex-1">
                  <button
                    onClick={() => setShowSpaceSelector(!showSpaceSelector)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <span className="text-gray-900 dark:text-gray-100">
                      {selectedSpace === 'none' 
                        ? 'No space' 
                        : spaces.find(s => s.id === selectedSpace)?.name || 'No space'
                      }
                    </span>
                    <svg 
                      className={`w-4 h-4 text-gray-500 transition-transform ${showSpaceSelector ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Floating Space Selector */}
                  {showSpaceSelector && (
                    <div className="absolute bottom-full mb-2 left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto z-50">
                      <div className="p-1">
                        <button
                          onClick={() => handleSpaceChange('none')}
                          className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                            selectedSpace === 'none' 
                              ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' 
                              : 'text-gray-900 dark:text-gray-100'
                          }`}
                        >
                          No space
                        </button>
                        {spaces.map((space) => (
                          <button
                            key={space.id}
                            onClick={() => handleSpaceChange(space.id)}
                            className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                              selectedSpace === space.id 
                                ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' 
                                : 'text-gray-900 dark:text-gray-100'
                            }`}
                          >
                            {space.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Fullscreen Toggle Button */}
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="modal-fullscreen-toggle-button hidden md:block p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                  aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                  title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                >
                  {isFullscreen ? (
                    /* Minimize icon */
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                    </svg>
                  ) : (
                    /* Maximize icon */
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  )}
                </button>
              </div>
            </div>


          </div>


          </div>
        </div>
    </Modal>
  );
}
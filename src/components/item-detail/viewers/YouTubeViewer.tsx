'use client';

import React from 'react';
import { Play, ThumbsUp, ThumbsDown, Share, Download, MoreHorizontal, FileText, Image } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface YouTubeViewerProps {
  title: string;
  videoId?: string;
  channelName?: string;
  channelImage?: string;
  description?: string;
  publishedDate?: string;
  thumbnail?: string;
  views?: number;
  likes?: number;
  duration?: string;
  isShort?: boolean;
  onTranscriptToggle?: () => void;
  hasTranscript?: boolean;
  isTranscriptOpen?: boolean;
}

export function YouTubeViewer({
  title,
  videoId,
  channelName,
  channelImage,
  description,
  publishedDate,
  thumbnail,
  views,
  likes,
  duration,
  isShort,
  onTranscriptToggle,
  hasTranscript,
  isTranscriptOpen,
}: YouTubeViewerProps) {
  const formatCount = (count?: number) => {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${Math.floor(count / 1000)}K`;
    return count.toString();
  };

  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=0` : null;

  const handleDownloadThumbnail = async () => {
    if (!thumbnail) return;
    
    try {
      // Fetch the image
      const response = await fetch(thumbnail);
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_thumbnail.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download thumbnail:', error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Video Player */}
      <div className={cn(
        "relative bg-black",
        isShort ? "aspect-[9/16] max-w-[400px] mx-auto" : "aspect-video"
      )}>
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : thumbnail ? (
          <div className="relative w-full h-full">
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="bg-red-600 rounded-full p-4 hover:bg-red-700 transition-colors cursor-pointer">
                <Play className="w-10 h-10 text-white fill-white" />
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-muted-foreground">Video unavailable</span>
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="p-4">
        {/* Title */}
        <h1 className="text-xl font-semibold mb-2">{title}</h1>

        {/* Stats and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {views !== undefined && (
              <span>{formatCount(views)} views</span>
            )}
            {publishedDate && (
              <>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(publishedDate), { addSuffix: true })}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-muted rounded-full">
              <button className="flex items-center gap-2 px-4 py-2 hover:bg-muted-foreground/10 rounded-l-full transition-colors">
                <ThumbsUp className="w-5 h-5" />
                {likes !== undefined && <span className="text-sm">{formatCount(likes)}</span>}
              </button>
              <div className="w-px h-6 bg-border" />
              <button className="p-2 hover:bg-muted-foreground/10 rounded-r-full transition-colors">
                <ThumbsDown className="w-5 h-5" />
              </button>
            </div>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full hover:bg-muted-foreground/10 transition-colors">
              <Share className="w-5 h-5" />
              <span className="text-sm">Share</span>
            </button>
            
            <button className="p-2 bg-muted rounded-full hover:bg-muted-foreground/10 transition-colors">
              <Download className="w-5 h-5" />
            </button>
            
            {onTranscriptToggle && (
              <button 
                onClick={onTranscriptToggle}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full transition-colors",
                  isTranscriptOpen 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted hover:bg-muted-foreground/10"
                )}
              >
                <FileText className="w-5 h-5" />
                <span className="text-sm">Transcript</span>
              </button>
            )}
            
            {thumbnail && (
              <button 
                onClick={handleDownloadThumbnail}
                className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full hover:bg-muted-foreground/10 transition-colors"
                title="Download thumbnail"
              >
                <Image className="w-5 h-5" />
                <span className="text-sm">Thumbnail</span>
              </button>
            )}
            
            <button className="p-2 hover:bg-muted rounded-full transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Channel Info */}
        <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg mb-4">
          <div className="flex items-center gap-3 flex-1">
            {channelImage ? (
              <img
                src={channelImage}
                alt={channelName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
                <span className="text-white font-semibold">
                  {channelName?.[0]?.toUpperCase() || 'Y'}
                </span>
              </div>
            )}
            <div>
              <h3 className="font-semibold">{channelName || 'Unknown Channel'}</h3>
              <p className="text-sm text-muted-foreground">Subscribe</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-foreground text-background rounded-full hover:opacity-90 transition-opacity text-sm font-medium">
            Subscribe
          </button>
        </div>

        {/* Description */}
        {description && (
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm whitespace-pre-wrap line-clamp-3">
              {description}
            </p>
            <button className="text-sm font-medium mt-2 hover:underline">
              Show more
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
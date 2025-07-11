'use client';

import React from 'react';
import { Calendar, Link, Tag, User, Eye, Heart, MessageCircle, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ContentType } from '@/types/database';
import { CONTENT_TYPE_METADATA } from '@/lib/contentDetection/patterns';
import { cn } from '@/lib/utils';



interface MetadataPanelProps {
  item: any;
  contentType: ContentType;
  onContentTypeChange: (newContentType: ContentType) => void;
  className?: string;
}

export function MetadataPanel({ item, contentType, onContentTypeChange, className }: MetadataPanelProps) {
  // Fallback to 'unknown' if content type is not found
  const typeMetadata = CONTENT_TYPE_METADATA[contentType] || CONTENT_TYPE_METADATA.unknown;
  
  const formatCount = (count?: number | string) => {
    const num = typeof count === 'string' ? parseInt(count) : count;
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className={cn("space-y-6 p-4", className)}>
      {/* Content Type Dropdown */}
      {typeMetadata && (
        <div className="flex items-center gap-2">
          <span className="text-2xl">{typeMetadata.icon}</span>
          <select
            value={contentType}
            onChange={(e) => onContentTypeChange(e.target.value as ContentType)}
            className="font-medium bg-transparent"
          >
            {Object.keys(CONTENT_TYPE_METADATA).map((type) => (
              <option key={type} value={type}>
                {CONTENT_TYPE_METADATA[type as ContentType].displayName}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* URL */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link className="w-4 h-4" />
          <span>URL</span>
        </div>
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline break-all"
        >
          {item.url}
        </a>
      </div>

      {/* Author */}
      {(item.metadata?.author || item.metadata?.username || item.author || item.channel_name) && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="w-4 h-4" />
            <span>Author</span>
          </div>
          <div className="text-sm">
            {item.metadata?.extra_data?.display_name || item.metadata?.author || item.author || item.channel_name}
            {(item.metadata?.username || item.username) && (
              <span className="text-muted-foreground ml-1">@{item.metadata?.username || item.username}</span>
            )}
          </div>
        </div>
      )}

      {/* Published Date */}
      {(item.metadata?.published_date || item.published_date) && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Published</span>
          </div>
          <div className="text-sm">
            {formatDistanceToNow(new Date(item.metadata?.published_date || item.published_date), { addSuffix: true })}
          </div>
        </div>
      )}

      {/* Engagement Metrics */}
      {(item.metadata?.likes || item.metadata?.views || item.metadata?.retweets || item.metadata?.replies || item.likes || item.views || item.retweets || item.comments) && (
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Engagement</div>
          <div className="grid grid-cols-2 gap-3">
            {(item.metadata?.likes || item.likes) && (
              <div className="flex items-center gap-2 text-sm">
                <Heart className="w-4 h-4 text-red-500" />
                <span>{formatCount(item.metadata?.likes || item.likes)} likes</span>
              </div>
            )}
            {(item.metadata?.views || item.views) && (
              <div className="flex items-center gap-2 text-sm">
                <Eye className="w-4 h-4 text-blue-500" />
                <span>{formatCount(item.metadata?.views || item.views)} views</span>
              </div>
            )}
            {(item.metadata?.retweets || item.retweets) && (
              <div className="flex items-center gap-2 text-sm">
                <Share2 className="w-4 h-4 text-green-500" />
                <span>{formatCount(item.metadata?.retweets || item.retweets)} shares</span>
              </div>
            )}
            {(item.metadata?.replies || item.comments || item.replies) && (
              <div className="flex items-center gap-2 text-sm">
                <MessageCircle className="w-4 h-4 text-purple-500" />
                <span>{formatCount(item.metadata?.replies || item.comments || item.replies)} comments</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instagram Specific Engagement */}
      {item.instagram_engagement && (
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Instagram Metrics</div>
          <div className="grid grid-cols-2 gap-3">
            {item.instagram_engagement.likes && (
              <div className="flex items-center gap-2 text-sm">
                <Heart className="w-4 h-4 text-red-500" />
                <span>{formatCount(item.instagram_engagement.likes)} likes</span>
              </div>
            )}
            {item.instagram_engagement.comments && (
              <div className="flex items-center gap-2 text-sm">
                <MessageCircle className="w-4 h-4 text-purple-500" />
                <span>{formatCount(item.instagram_engagement.comments)} comments</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tags */}
      {/* {item.tags && item.tags.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Tag className="w-4 h-4" />
            <span>Tags test</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag: string | {name: string}, index: number) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-muted rounded-full"
              >
                {typeof tag === 'string' ? tag : tag.name}
              </span>
            ))}
          </div>
        </div>
      )} */}

      {/* Product Specific */}
      {item.price && (
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Price</div>
          <div className="text-2xl font-bold">${item.price}</div>
        </div>
      )}

      {/* YouTube Specific */}
      {item.duration && (
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Duration</div>
          <div className="text-sm">{item.duration}</div>
        </div>
      )}

      {/* Article Specific */}
      {item.reading_time && (
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Reading Time</div>
          <div className="text-sm">{item.reading_time} min read</div>
        </div>
      )}
    </div>
  );
}
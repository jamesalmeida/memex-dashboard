'use client';

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Repeat2, Share, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TwitterViewerProps {
  title: string;
  content?: string;
  author?: string;
  username?: string;
  profileImage?: string;
  displayName?: string;
  publishedDate?: string;
  thumbnail?: string;
  videoUrl?: string;
  isVideo?: boolean;
  engagement?: {
    likes?: number;
    retweets?: number;
    replies?: number;
    views?: number;
  };
  verified?: boolean;
}

export function TwitterViewer({
  title,
  content,
  author,
  username,
  profileImage,
  displayName,
  publishedDate,
  thumbnail,
  videoUrl,
  isVideo,
  engagement,
  verified,
}: TwitterViewerProps) {
  const formatCount = (count?: number) => {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const tweetContent = content || title;
  const authorName = displayName || author || username || 'Unknown';
  const handle = username || 'unknown';

  return (
    <div className="max-w-[600px] mx-auto p-4">
      <div className="bg-background rounded-2xl border shadow-sm">
        {/* Tweet Header */}
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={authorName}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-xl font-semibold text-muted-foreground">
                    {authorName[0]?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Author Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-bold text-foreground truncate">{authorName}</span>
                {verified && (
                  <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.52 3.59a2.57 2.57 0 0 0 2.43 0 1.07 1.07 0 0 1 1.4.42 2.57 2.57 0 0 0 1.72 1.72 1.07 1.07 0 0 1 .42 1.4 2.57 2.57 0 0 0 0 2.43 1.07 1.07 0 0 1-.42 1.4 2.57 2.57 0 0 0-1.72 1.72 1.07 1.07 0 0 1-1.4.42 2.57 2.57 0 0 0-2.43 0 1.07 1.07 0 0 1-1.4-.42 2.57 2.57 0 0 0-1.72-1.72 1.07 1.07 0 0 1-.42-1.4 2.57 2.57 0 0 0 0-2.43 1.07 1.07 0 0 1 .42-1.4 2.57 2.57 0 0 0 1.72-1.72 1.07 1.07 0 0 1 1.4-.42Z"/>
                    <path d="M10.74 10.25a.75.75 0 0 0-1.06 1.06l.97.97a.75.75 0 0 0 1.06 0l2.12-2.12a.75.75 0 1 0-1.06-1.06l-1.59 1.59-.44-.44Z"/>
                  </svg>
                )}
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span>@{handle}</span>
                {publishedDate && (
                  <>
                    <span>·</span>
                    <span>{formatDistanceToNow(new Date(publishedDate), { addSuffix: true })}</span>
                  </>
                )}
              </div>
            </div>

            {/* X Logo */}
            <div className="text-muted-foreground">
              <span className="text-xl font-bold">𝕏</span>
            </div>
          </div>

          {/* Tweet Content */}
          <div className="mt-3">
            <p className="text-foreground whitespace-pre-wrap break-words">{tweetContent}</p>
          </div>
        </div>

        {/* Media */}
        {(thumbnail || videoUrl) && (
          <div className="relative mx-4 mb-3 rounded-2xl overflow-hidden bg-muted">
            {isVideo && videoUrl ? (
              <video
                src={videoUrl}
                poster={thumbnail}
                controls
                className="w-full h-auto max-h-[500px] object-contain"
              >
                Your browser does not support the video tag.
              </video>
            ) : thumbnail ? (
              <img
                src={thumbnail}
                alt="Tweet media"
                className="w-full h-auto max-h-[500px] object-contain"
              />
            ) : null}
            {isVideo && !videoUrl && thumbnail && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="bg-white/90 rounded-full p-3">
                  <Play className="w-8 h-8 text-black fill-black" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Engagement */}
        <div className="px-4 py-3 border-t">
          <div className="flex items-center justify-between text-muted-foreground">
            <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm">{formatCount(engagement?.replies)}</span>
            </button>
            
            <button className="flex items-center gap-2 hover:text-green-500 transition-colors">
              <Repeat2 className="w-5 h-5" />
              <span className="text-sm">{formatCount(engagement?.retweets)}</span>
            </button>
            
            <button className="flex items-center gap-2 hover:text-red-500 transition-colors">
              <Heart className="w-5 h-5" />
              <span className="text-sm">{formatCount(engagement?.likes)}</span>
            </button>
            
            <button className="hover:text-blue-500 transition-colors">
              <Share className="w-5 h-5" />
            </button>
          </div>
          
          {engagement?.views && (
            <div className="mt-2 text-sm text-muted-foreground">
              {formatCount(engagement.views)} views
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
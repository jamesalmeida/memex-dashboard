'use client';

import React from 'react';
import { MessageSquare, ArrowBigUp, Award, Calendar, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RedditViewerProps {
  title: string;
  content?: string;
  author?: string;
  subreddit?: string;
  score?: number;
  commentCount?: number;
  awards?: number;
  publishedDate?: string;
  thumbnail?: string;
  isVideo?: boolean;
  videoUrl?: string;
  imageUrl?: string;
  postType?: 'text' | 'image' | 'video' | 'link';
  linkUrl?: string;
  linkDomain?: string;
  className?: string;
}

export function RedditViewer({
  title,
  content,
  author,
  subreddit,
  score = 0,
  commentCount = 0,
  awards = 0,
  publishedDate,
  thumbnail,
  isVideo,
  videoUrl,
  imageUrl,
  postType = 'text',
  linkUrl,
  linkDomain,
  className,
}: RedditViewerProps) {
  const formatScore = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 30) {
        return `${diffDays}d ago`;
      } else {
        const diffMonths = Math.floor(diffDays / 30);
        if (diffMonths < 12) {
          return `${diffMonths}mo ago`;
        } else {
          const diffYears = Math.floor(diffMonths / 12);
          return `${diffYears}y ago`;
        }
      }
    }
  };

  return (
    <div className={cn("h-full bg-white dark:bg-gray-900", className)}>
      <div className="max-w-4xl mx-auto p-6">
        {/* Post Header */}
        <div className="mb-4">
          {/* Subreddit */}
          {subreddit && (
            <div className="text-sm text-muted-foreground mb-2">
              r/{subreddit}
            </div>
          )}

          {/* Title */}
          <h1 className="text-2xl font-bold mb-3">{title}</h1>

          {/* Post Metadata */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>u/{author || 'deleted'}</span>
            </div>
            {publishedDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(publishedDate)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Post Content */}
        <div className="mb-6">
          {/* Image Post */}
          {postType === 'image' && imageUrl && (
            <div className="mb-4">
              <img
                src={imageUrl || thumbnail}
                alt={title}
                className="w-full rounded-lg object-contain max-h-[600px] bg-gray-100 dark:bg-gray-800"
              />
            </div>
          )}

          {/* Video Post */}
          {postType === 'video' && videoUrl && (
            <div className="mb-4">
              <video
                controls
                className="w-full rounded-lg max-h-[600px]"
                poster={thumbnail}
              >
                <source src={videoUrl} />
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {/* Link Post */}
          {postType === 'link' && linkUrl && (
            <a
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block mb-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-start gap-4">
                {thumbnail && (
                  <img
                    src={thumbnail}
                    alt=""
                    className="w-24 h-24 rounded object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-muted-foreground mb-1">
                    {linkDomain}
                  </div>
                  <div className="font-medium line-clamp-2">{title}</div>
                </div>
              </div>
            </a>
          )}

          {/* Text Content */}
          {content && (
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap">{content}</div>
            </div>
          )}
        </div>

        {/* Engagement Metrics */}
        <div className="flex items-center gap-6 pt-4 border-t">
          <div className="flex items-center gap-2">
            <ArrowBigUp className="w-5 h-5 text-orange-500" />
            <span className="font-medium">{formatScore(score)}</span>
          </div>

          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            <span>{formatScore(commentCount)} comments</span>
          </div>

          {awards > 0 && (
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              <span>{awards} awards</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
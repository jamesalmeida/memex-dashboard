'use client';

import React from 'react';
import { Heart, MessageCircle, Share2, Music, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TikTokViewerProps {
  title?: string;
  caption?: string;
  author?: string;
  username?: string;
  profileImage?: string;
  videoUrl?: string;
  thumbnail?: string;
  musicName?: string;
  musicAuthor?: string;
  likes?: number;
  comments?: number;
  shares?: number;
  views?: number;
  publishedDate?: string;
  isFollowing?: boolean;
  className?: string;
}

export function TikTokViewer({
  title,
  caption,
  author,
  username,
  profileImage,
  videoUrl,
  thumbnail,
  musicName,
  musicAuthor,
  likes = 0,
  comments = 0,
  shares = 0,
  views = 0,
  publishedDate,
  className,
}: TikTokViewerProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return `${diffMinutes}m ago`;
      }
      return `${diffHours}h ago`;
    } else if (diffDays < 30) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  return (
    <div className={cn("h-full bg-black", className)}>
      <div className="h-full flex items-center justify-center relative">
        {/* Video Container */}
        <div className="relative max-w-[400px] w-full h-full max-h-[90vh]">
          {videoUrl ? (
            <video
              controls
              className="w-full h-full object-contain"
              poster={thumbnail}
              autoPlay
              loop
              muted
            >
              <source src={videoUrl} />
              Your browser does not support the video tag.
            </video>
          ) : thumbnail ? (
            <img
              src={thumbnail}
              alt={caption || title || 'TikTok video'}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-900">
              <p className="text-gray-500">Video not available</p>
            </div>
          )}

          {/* Overlay Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            {/* Author Info */}
            <div className="flex items-center gap-3 mb-3">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={author || username || 'Profile'}
                  className="w-10 h-10 rounded-full border-2 border-white"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div>
                <div className="font-semibold text-white">
                  {author || username || 'Unknown User'}
                </div>
                {username && author && (
                  <div className="text-sm text-gray-300">@{username}</div>
                )}
              </div>
            </div>

            {/* Caption */}
            {(caption || title) && (
              <div className="text-white mb-3 text-sm">
                {caption || title}
              </div>
            )}

            {/* Music Info */}
            {musicName && (
              <div className="flex items-center gap-2 text-white text-sm mb-4">
                <Music className="w-4 h-4" />
                <span className="truncate">
                  {musicName}
                  {musicAuthor && ` - ${musicAuthor}`}
                </span>
              </div>
            )}

            {/* Date */}
            {publishedDate && (
              <div className="text-gray-300 text-xs">
                {formatDate(publishedDate)}
              </div>
            )}
          </div>

          {/* Engagement Sidebar */}
          <div className="absolute right-2 bottom-20 flex flex-col gap-4">
            {/* Likes */}
            <div className="text-center">
              <button className="p-3 bg-gray-800/50 backdrop-blur rounded-full text-white hover:bg-gray-700/50 transition-colors">
                <Heart className="w-6 h-6" />
              </button>
              <p className="text-white text-xs mt-1">{formatNumber(likes)}</p>
            </div>

            {/* Comments */}
            <div className="text-center">
              <button className="p-3 bg-gray-800/50 backdrop-blur rounded-full text-white hover:bg-gray-700/50 transition-colors">
                <MessageCircle className="w-6 h-6" />
              </button>
              <p className="text-white text-xs mt-1">{formatNumber(comments)}</p>
            </div>

            {/* Shares */}
            <div className="text-center">
              <button className="p-3 bg-gray-800/50 backdrop-blur rounded-full text-white hover:bg-gray-700/50 transition-colors">
                <Share2 className="w-6 h-6" />
              </button>
              <p className="text-white text-xs mt-1">{formatNumber(shares)}</p>
            </div>
          </div>
        </div>

        {/* View Count */}
        {views > 0 && (
          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur px-3 py-1 rounded-full">
            <p className="text-white text-sm">{formatNumber(views)} views</p>
          </div>
        )}
      </div>
    </div>
  );
}
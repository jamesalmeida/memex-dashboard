'use client';

import React, { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InstagramViewerProps {
  title: string;
  author?: string;
  username?: string;
  profileImage?: string;
  images?: string[];
  videoUrl?: string;
  thumbnail?: string;
  postType?: 'photo' | 'video' | 'carousel' | 'reel';
  engagement?: {
    likes?: number;
    comments?: number;
  };
  caption?: string;
}

export function InstagramViewer({
  title,
  author,
  username,
  profileImage,
  images = [],
  videoUrl,
  thumbnail,
  postType = 'photo',
  engagement,
  caption,
}: InstagramViewerProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const displayUsername = username || author || 'unknown';
  const displayCaption = caption || title;
  
  // Determine media to show
  const mediaItems = images.length > 0 ? images : thumbnail ? [thumbnail] : [];
  const isCarousel = mediaItems.length > 1;
  const isVideo = postType === 'video' || postType === 'reel';

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % mediaItems.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
  };

  const formatCount = (count?: number) => {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="max-w-[468px] mx-auto bg-background">
      <div className="border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-3">
            {profileImage ? (
              <img
                src={profileImage}
                alt={displayUsername}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-pink-500"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {displayUsername[0]?.toUpperCase()}
                </span>
              </div>
            )}
            <span className="font-semibold text-sm">{displayUsername}</span>
          </div>
          <button className="hover:opacity-70">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Media */}
        <div className="relative bg-black aspect-square">
          {isVideo && videoUrl ? (
            <video
              src={videoUrl}
              poster={thumbnail}
              controls
              className="w-full h-full object-contain"
              autoPlay
              loop={postType === 'reel'}
            >
              Your browser does not support the video tag.
            </video>
          ) : mediaItems.length > 0 ? (
            <>
              <img
                src={mediaItems[currentImageIndex]}
                alt={`Post ${currentImageIndex + 1}`}
                className="w-full h-full object-contain"
              />
              
              {/* Carousel Controls */}
              {isCarousel && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 hover:bg-white transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 hover:bg-white transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  
                  {/* Carousel Indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                    {mediaItems.map((_, index) => (
                      <div
                        key={index}
                        className={cn(
                          'w-1.5 h-1.5 rounded-full transition-colors',
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        )}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <span className="text-muted-foreground">No media available</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <button className="hover:opacity-70 transition-opacity">
                <Heart className="w-6 h-6" />
              </button>
              <button className="hover:opacity-70 transition-opacity">
                <MessageCircle className="w-6 h-6" />
              </button>
              <button className="hover:opacity-70 transition-opacity">
                <Send className="w-6 h-6" />
              </button>
            </div>
            <button className="hover:opacity-70 transition-opacity">
              <Bookmark className="w-6 h-6" />
            </button>
          </div>

          {/* Likes */}
          {engagement?.likes !== undefined && (
            <div className="font-semibold text-sm mb-2">
              {formatCount(engagement.likes)} likes
            </div>
          )}

          {/* Caption */}
          {displayCaption && (
            <div className="text-sm">
              <span className="font-semibold mr-2">{displayUsername}</span>
              <span className="whitespace-pre-wrap">{displayCaption}</span>
            </div>
          )}

          {/* Comments */}
          {engagement?.comments !== undefined && engagement.comments > 0 && (
            <button className="text-sm text-muted-foreground mt-2 hover:text-foreground">
              View all {formatCount(engagement.comments)} comments
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
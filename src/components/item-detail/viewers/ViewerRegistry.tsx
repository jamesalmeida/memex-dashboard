'use client';

import React from 'react';
import { TwitterViewer } from './TwitterViewer';
import { InstagramViewer } from './InstagramViewer';
import { YouTubeViewer } from './YouTubeViewer';
import { ArticleViewer } from './ArticleViewer';
import { ContentType } from '@/lib/contentTypes/patterns';

interface ViewerProps {
  item: any; // Will be typed properly when integrated
  contentType: ContentType;
}

export function ContentViewer({ item, contentType }: ViewerProps) {
  // Map the item data to viewer props based on content type
  switch (contentType) {
    case 'twitter':
      return (
        <TwitterViewer
          title={item.title}
          content={item.content || item.description}
          author={item.author}
          username={item.username}
          profileImage={item.profile_image}
          displayName={item.display_name}
          publishedDate={item.published_date}
          thumbnail={item.thumbnail_url}
          videoUrl={item.video_url}
          isVideo={item.is_video || !!item.video_url}
          engagement={{
            likes: parseInt(item.likes || '0'),
            retweets: parseInt(item.retweets || '0'),
            replies: parseInt(item.replies || '0'),
            views: parseInt(item.views || '0'),
          }}
          verified={item.verified}
        />
      );

    case 'instagram':
      return (
        <InstagramViewer
          title={item.title}
          author={item.author || item.instagram_username}
          username={item.instagram_username}
          profileImage={item.profile_image}
          images={item.instagram_images || (item.thumbnail_url ? [item.thumbnail_url] : [])}
          videoUrl={item.video_url}
          thumbnail={item.thumbnail_url}
          postType={item.instagram_post_type}
          engagement={{
            likes: item.instagram_engagement?.likes,
            comments: item.instagram_engagement?.comments,
          }}
          caption={item.title || item.description}
        />
      );

    case 'youtube':
      return (
        <YouTubeViewer
          title={item.title}
          videoId={item.video_id}
          channelName={item.channel_name || item.author}
          channelImage={item.channel_image}
          description={item.description}
          publishedDate={item.published_date}
          thumbnail={item.thumbnail_url}
          views={item.views}
          likes={item.likes}
          duration={item.duration}
          isShort={item.is_short}
        />
      );

    case 'reddit':
    case 'tiktok':
    case 'facebook':
    case 'linkedin':
    case 'pinterest':
    case 'github':
    case 'medium':
    case 'substack':
    case 'article':
    default:
      // Default to article viewer for unsupported types
      return (
        <ArticleViewer
          title={item.title}
          content={item.content}
          description={item.description}
          author={item.author}
          publishedDate={item.published_date}
          readingTime={item.reading_time}
          thumbnail={item.thumbnail_url}
          siteName={item.site_name || item.domain}
          url={item.url}
        />
      );
  }
}

// Note viewer for user-created notes
export function NoteViewer({ content }: { content: string }) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <div className="whitespace-pre-wrap">{content}</div>
      </div>
    </div>
  );
}

// Image viewer for direct image URLs
export function ImageViewer({ url, title }: { url: string; title?: string }) {
  return (
    <div className="flex items-center justify-center h-full p-4 bg-black/5">
      <img
        src={url}
        alt={title || 'Image'}
        className="max-w-full max-h-full object-contain"
      />
    </div>
  );
}

// Product viewer for e-commerce items
export function ProductViewer({ item }: { item: any }) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image */}
        {item.thumbnail_url && (
          <div className="aspect-square bg-muted rounded-lg overflow-hidden">
            <img
              src={item.thumbnail_url}
              alt={item.title}
              className="w-full h-full object-contain"
            />
          </div>
        )}
        
        {/* Product Info */}
        <div>
          <h1 className="text-2xl font-bold mb-2">{item.title}</h1>
          
          {item.brand && (
            <p className="text-muted-foreground mb-4">{item.brand}</p>
          )}
          
          {item.price && (
            <div className="text-3xl font-bold mb-4">
              ${item.price}
            </div>
          )}
          
          {item.rating && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={cn(
                      "w-5 h-5",
                      i < Math.floor(item.rating) ? "text-yellow-500 fill-current" : "text-muted"
                    )}
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <span className="text-muted-foreground">
                {item.rating} ({item.reviews || 0} reviews)
              </span>
            </div>
          )}
          
          {item.description && (
            <div className="prose prose-sm dark:prose-invert">
              <p>{item.description}</p>
            </div>
          )}
          
          {item.availability && (
            <div className="mt-4">
              <span className={cn(
                "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                item.availability === 'in_stock' 
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              )}>
                {item.availability === 'in_stock' ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
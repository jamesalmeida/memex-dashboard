'use client';

import React from 'react';
import { TwitterViewer } from './TwitterViewer';
import { InstagramViewer } from './InstagramViewer';
import { YouTubeViewer } from './YouTubeViewer';
import { ArticleViewer } from './ArticleViewer';
import { RedditViewer } from './RedditViewer';
import { TikTokViewer } from './TikTokViewer';
import { ProductViewer } from './ProductViewer';
import { ContentType } from '@/lib/contentTypes/patterns';
import { extractPlatformId } from '@/lib/contentTypes/detector';
import { cn } from '@/lib/utils';

interface ViewerProps {
  item: any; // Will be typed properly when integrated
  contentType: ContentType;
  onTranscriptToggle?: () => void;
  isTranscriptOpen?: boolean;
}

export function ContentViewer({ 
  item, 
  contentType, 
  onTranscriptToggle, 
  isTranscriptOpen
}: ViewerProps) {
  // Handle missing or unknown content types
  if (!contentType || contentType === 'unknown') {
    return (
      <ArticleViewer
        title={item.title || 'Untitled'}
        content={item.content}
        description={item.description}
        author={item.author}
        publishedDate={item.published_date}
        thumbnail={item.thumbnail_url}
        url={item.url}
      />
    );
  }

  // Map the item data to viewer props based on content type
  switch (contentType) {
    case 'twitter':
      console.log('Twitter viewer - item:', item);
      console.log('Twitter viewer - metadata:', item.metadata);
      return (
        <TwitterViewer
          title={item.title}
          content={item.content || item.description}
          author={item.metadata?.author || item.author}
          username={item.metadata?.username}
          profileImage={item.metadata?.profile_image}
          displayName={item.metadata?.extra_data?.display_name || item.metadata?.author?.split(' (@')[0] || item.metadata?.author}
          publishedDate={item.metadata?.extra_data?.published_date || item.metadata?.published_date || item.created_at}
          thumbnail={item.thumbnail_url}
          videoUrl={item.metadata?.video_url}
          isVideo={!!item.metadata?.video_url || item.metadata?.extra_data?.is_video}
          engagement={{
            likes: parseInt(item.metadata?.likes?.toString() || '0'),
            retweets: parseInt(item.metadata?.retweets?.toString() || '0'),
            replies: parseInt(item.metadata?.replies?.toString() || '0'),
            views: parseInt(item.metadata?.views?.toString() || '0'),
          }}
          verified={item.metadata?.extra_data?.verified}
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
      const videoId = item.video_id || item.metadata?.extra_data?.video_id || 
                      (item.url ? extractPlatformId(item.url, 'youtube') : null);
      console.log('YouTube viewer - item URL:', item.url);
      console.log('YouTube viewer - extracted video ID:', videoId);
      return (
        <YouTubeViewer
          title={item.title}
          videoId={videoId}
          channelName={item.metadata?.author || item.channel_name || item.author}
          channelImage={item.metadata?.profile_image || item.channel_image}
          description={item.description}
          publishedDate={item.metadata?.published_date || item.published_date}
          thumbnail={item.thumbnail_url}
          views={item.metadata?.views || item.views}
          likes={item.metadata?.likes || item.likes}
          duration={item.metadata?.duration || item.duration}
          isShort={item.metadata?.extra_data?.is_short || item.is_short}
          onTranscriptToggle={onTranscriptToggle}
          isTranscriptOpen={isTranscriptOpen}
          hasTranscript={!!item.metadata?.extra_data?.transcript}
        />
      );

    case 'reddit':
      return (
        <RedditViewer
          title={item.title}
          content={item.content}
          author={item.author}
          subreddit={item.subreddit}
          score={item.score || item.upvotes}
          commentCount={item.comment_count || item.comments}
          awards={item.awards}
          publishedDate={item.published_date}
          thumbnail={item.thumbnail_url}
          isVideo={item.is_video}
          videoUrl={item.video_url}
          imageUrl={item.image_url || item.thumbnail_url}
          postType={item.post_type || (item.video_url ? 'video' : item.image_url ? 'image' : 'text')}
          linkUrl={item.link_url}
          linkDomain={item.link_domain}
        />
      );

    case 'tiktok':
      return (
        <TikTokViewer
          title={item.title}
          caption={item.caption || item.description}
          author={item.author}
          username={item.username}
          profileImage={item.profile_image}
          videoUrl={item.video_url}
          thumbnail={item.thumbnail_url}
          musicName={item.music_name}
          musicAuthor={item.music_author}
          likes={item.likes}
          comments={item.comments}
          shares={item.shares}
          views={item.views}
          publishedDate={item.published_date}
        />
      );

    case 'product':
    case 'amazon':
    case 'etsy':
    case 'ebay':
    case 'shopify':
      return (
        <ProductViewer
          title={item.title}
          productId={item.metadata?.product_id || item.metadata?.retailer_part_no}
          brand={item.metadata?.brand}
          price={item.metadata?.price}
          availability={item.metadata?.availability}
          rating={item.metadata?.rating}
          description={item.description}
          thumbnail={item.thumbnail_url}
          specifications={item.metadata?.specifications}
          seller={item.metadata?.seller}
        />
      );

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


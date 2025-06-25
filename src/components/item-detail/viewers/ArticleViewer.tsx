'use client';

import React from 'react';
import { Clock, User, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ArticleViewerProps {
  title: string;
  content?: string;
  description?: string;
  author?: string;
  publishedDate?: string;
  readingTime?: number;
  thumbnail?: string;
  siteName?: string;
  url?: string;
}

export function ArticleViewer({
  title,
  content,
  description,
  author,
  publishedDate,
  readingTime,
  thumbnail,
  siteName,
  url,
}: ArticleViewerProps) {
  const domain = url ? new URL(url).hostname : '';

  return (
    <article className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
          {title}
        </h1>
        
        {description && (
          <p className="text-lg text-muted-foreground mb-6">
            {description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {author && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{author}</span>
            </div>
          )}
          
          {publishedDate && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                {formatDistanceToNow(new Date(publishedDate), { addSuffix: true })}
              </span>
            </div>
          )}
          
          {readingTime && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{readingTime} min read</span>
            </div>
          )}
          
          {siteName && (
            <div className="flex items-center gap-2">
              <span className="text-primary">{siteName}</span>
            </div>
          )}
        </div>
      </header>

      {/* Featured Image */}
      {thumbnail && (
        <div className="mb-8 rounded-lg overflow-hidden">
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-auto object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="prose prose-lg dark:prose-invert max-w-none">
        {content ? (
          <div dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          <div className="bg-muted rounded-lg p-8 text-center">
            <p className="text-muted-foreground mb-4">
              Full article content is not available in preview mode.
            </p>
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                Read on {domain}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
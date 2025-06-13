'use client'

import { MockItem } from '@/utils/mockData';
import { useState } from 'react';

interface ItemCardProps {
  item: MockItem;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  onMoveToProject?: (id: string, spaceId: string) => void;
  onClick?: (item: MockItem) => void;
}

const ContentTypeIcon = ({ type }: { type: MockItem['content_type'] }) => {
  const iconClass = "w-4 h-4 flex-shrink-0";
  
  switch (type) {
    // Social Media
    case 'x':
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      );
    case 'instagram':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01M7.5 4h9A3.5 3.5 0 0120 7.5v9a3.5 3.5 0 01-3.5 3.5h-9A3.5 3.5 0 014 16.5v-9A3.5 3.5 0 017.5 4z" />
        </svg>
      );
    case 'youtube':
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      );
    case 'reddit':
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
        </svg>
      );
    case 'linkedin':
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      );
    
    // Development
    case 'github':
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      );
    case 'npm':
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331zM10.665 10H12v2.667h-1.335V10z"/>
        </svg>
      );
    
    // Content Types
    case 'article':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      );
    case 'pdf':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    case 'image':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    case 'video':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    case 'audio':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      );
    
    // Commerce
    case 'product':
    case 'amazon':
    case 'etsy':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      );
    
    // Knowledge
    case 'wikipedia':
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.09 13.119c-.936 1.932-2.217 4.548-2.853 5.728-.616 1.074-1.127.931-1.532.029-1.406-3.321-4.293-9.144-5.651-12.409-.251-.601-.441-.987-.619-1.139-.181-.15-.554-.24-1.122-.271C.103 5.033 0 4.982 0 4.898v-.455l.052-.045c.924-.005 5.401 0 5.401 0l.051.045v.434c0 .119-.075.176-.225.176l-.564.031c-.485.029-.727.164-.727.436 0 .135.053.33.166.601 1.082 2.646 2.818 6.704 3.615 8.82.165-.359 1.03-2.327 1.03-2.327l.962-2.298-2.053-4.518c-.466-1.02-.776-1.564-1.342-1.564-.133 0-.293 0-.459.013-.18.015-.314.072-.314.211v.457c0 .075-.061.15-.12.15s-1.261-.061-3.106-.061h-.451l-.045-.061v-.42l.061-.06c1.247-.016 1.564-.016 2.611-.016 1.003 0 1.365 0 2.575.016l.075.045v.436c0 .119-.06.18-.18.18-.33 0-.511.034-.556.075-.045.061-.065.24.045.51l1.936 4.374 1.872-4.433c.09-.217.09-.466-.03-.584-.09-.086-.24-.131-.632-.131-.35 0-.35-.116-.35-.196v-.436l.089-.045h4.731l.074.045v.421l-.059.06c-.51.034-.973.085-1.279.315-.27.21-.51.51-.765.961l-1.951 3.29a5.58 5.58 0 0 0-.42.93l1.454 3.257c1.307-3.076 3.375-7.506 4.007-8.578.194-.345.15-.689-.135-.826-.3-.134-.721-.179-1.156-.194-.195-.015-.258-.135-.258-.225v-.42c0-.069.075-.131.15-.131.855.016 1.681.016 2.416.016.906 0 1.937 0 2.645-.016h.091v.435c0 .075-.061.165-.18.165-.391.016-.631.046-.886.21-.404.27-.781.78-1.141 1.501-.916 1.846-4.276 8.723-5.151 10.523-.574 1.185-1.024 1.402-1.471.3-1.039-2.551-2.236-5.295-2.996-7.047z"/>
        </svg>
      );
    
    // Personal
    case 'note':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      );
    case 'bookmark':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      );
    
    default:
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      );
  }
};

export default function ItemCard({ item, onArchive, onDelete, onMoveToProject, onClick }: ItemCardProps) {
  const [showActions, setShowActions] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const shouldShowFullImage = () => {
    return ['image', 'instagram', 'video', 'youtube'].includes(item.content_type);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on action buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onClick?.(item);
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all flex flex-col cursor-pointer max-w-full"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={handleCardClick}
    >
      {item.thumbnail && (
        <div className={`relative overflow-hidden bg-gray-100 ${shouldShowFullImage() ? '' : 'flex-shrink-0'}`} style={{ height: shouldShowFullImage() ? 'auto' : '120px' }}>
          <img 
            src={item.thumbnail} 
            alt={item.title}
            className={`w-full ${shouldShowFullImage() ? 'h-auto' : 'h-full object-cover'}`}
          />
          {showActions && (
            <div className="absolute top-2 right-2 flex gap-1">
              <button 
                className="p-1 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70 transition-opacity"
                onClick={() => onArchive?.(item.id)}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l4 0V6a2 2 0 012-2h2a2 2 0 012 2v2l4 0m-6 12V10m0 0l1-1m-1 1l-1-1" />
                </svg>
              </button>
              <button 
                className="p-1 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70 transition-opacity"
                onClick={() => onDelete?.(item.id)}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
      
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm min-w-0 flex-1">
            <ContentTypeIcon type={item.content_type} />
            <span className="capitalize">{item.content_type}</span>
            {item.metadata?.domain && (
              <>
                <span>•</span>
                <span className="truncate min-w-0">{item.metadata.domain}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Duration for media content */}
            {item.metadata?.duration && (
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                {item.metadata.duration}
              </span>
            )}
            {/* GitHub stars */}
            {item.content_type === 'github' && item.metadata?.stars && (
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                {item.metadata.stars.toLocaleString()}
              </span>
            )}
            {/* Product price */}
            {(['product', 'amazon', 'etsy'] as const).includes(item.content_type) && item.metadata?.price && (
              <span className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded font-medium">
                {item.metadata.price}
              </span>
            )}
            {/* Social media engagement */}
            {(['x', 'instagram', 'linkedin'] as const).includes(item.content_type) && item.metadata?.likes && (
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                {item.metadata.likes.toLocaleString()}
              </span>
            )}
            {/* Academic citations */}
            {item.content_type === 'paper' && item.metadata?.citations && (
              <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
                {item.metadata.citations.toLocaleString()} citations
              </span>
            )}
            {/* Reddit engagement */}
            {item.content_type === 'reddit' && item.metadata?.likes && (
              <span className="text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                {item.metadata.likes.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <h3 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2 mb-2 flex-1 min-w-0 break-words">
          {item.title}
        </h3>

        {item.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3 min-w-0 break-words">
            {item.description}
          </p>
        )}

        {/* Author and additional metadata */}
        {item.metadata?.author && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
            <span>by</span>
            <span className="font-medium">{item.metadata.author}</span>
            {(['product', 'amazon', 'etsy'] as const).includes(item.content_type) && item.metadata?.rating && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  <span>{item.metadata.rating}</span>
                  {item.metadata?.reviews && (
                    <span className="text-gray-400">({item.metadata.reviews.toLocaleString()})</span>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        <div className="mt-auto">
          {item.metadata?.tags && (
            <div className="flex flex-wrap gap-1 mb-2">
              {item.metadata.tags.slice(0, 3).map((tag) => (
                <span 
                  key={tag}
                  className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 min-w-0">
            <span className="truncate">{formatDate(item.created_at)}</span>
            {item.space && (
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded truncate max-w-20 ml-1">
                {item.space}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
'use client'

import { useState, useEffect, useRef } from 'react';
import { MockItem } from '@/utils/mockData';
import { urlMetadataService } from '@/lib/services/urlMetadata';

interface NewItemCardProps {
  onAdd: (item: Omit<MockItem, 'id' | 'created_at'>) => void;
}

export default function NewItemCard({ onAdd }: NewItemCardProps) {
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lastHeight, setLastHeight] = useState(48); // 3rem = 48px
  const [isDragOver, setIsDragOver] = useState(false);

  // Auto-resize textarea and trigger grid re-layout if needed
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to get proper scrollHeight
      textarea.style.height = '3rem';
      // Set height based on content, but cap at max height
      const newHeight = Math.min(textarea.scrollHeight, 128); // 8rem = 128px
      textarea.style.height = `${newHeight}px`;
      
      // If height changed significantly, trigger a window resize event to update masonry grid
      if (Math.abs(newHeight - lastHeight) > 10) {
        setLastHeight(newHeight);
        // Delay to ensure DOM has updated
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 50);
      }
    }
  }, [input, lastHeight]);

  const detectContentType = (input: string): MockItem['content_type'] => {
    if (!input) return 'note';
    
    const lowerInput = input.toLowerCase();
    
    // Check if it's a valid URL (must start with http or be a recognizable domain pattern)
    const urlPattern = /^(https?:\/\/)|(www\.)|([a-zA-Z0-9-]+\.(com|org|net|io|dev|app|co|edu|gov|mil|info|biz|me|tv|fm|ai|cloud|xyz|tech|site|online|store|shop|blog|news|media|social|network|community|platform|service|solutions|digital|global|world|international|[a-z]{2,3}))/i;
    
    if (input.startsWith('http') || urlPattern.test(input)) {
      // Social Media
      if (lowerInput.includes('twitter.com') || lowerInput.includes('x.com')) return 'x';
      if (lowerInput.includes('instagram.com')) return 'instagram';
      if (lowerInput.includes('youtube.com') || lowerInput.includes('youtu.be')) return 'youtube';
      if (lowerInput.includes('linkedin.com')) return 'linkedin';
      if (lowerInput.includes('tiktok.com')) return 'tiktok';
      if (lowerInput.includes('reddit.com')) return 'reddit';
      if (lowerInput.includes('facebook.com') || lowerInput.includes('fb.com')) return 'facebook';
      
      // Development
      if (lowerInput.includes('github.com')) return 'github';
      if (lowerInput.includes('gitlab.com')) return 'gitlab';
      if (lowerInput.includes('codepen.io')) return 'codepen';
      if (lowerInput.includes('stackoverflow.com')) return 'stackoverflow';
      if (lowerInput.includes('dev.to')) return 'devto';
      if (lowerInput.includes('npmjs.com')) return 'npm';
      
      // Commerce
      if (lowerInput.includes('amazon.com')) return 'amazon';
      if (lowerInput.includes('etsy.com')) return 'etsy';
      if (lowerInput.includes('apps.apple.com') || lowerInput.includes('play.google.com')) return 'app';
      
      // Knowledge
      if (lowerInput.includes('wikipedia.org')) return 'wikipedia';
      if (lowerInput.includes('arxiv.org')) return 'paper';
      if (lowerInput.includes('goodreads.com')) return 'book';
      if (lowerInput.includes('coursera.com') || lowerInput.includes('udemy.com') || 
          lowerInput.includes('edx.org') || lowerInput.includes('.edu/course')) return 'course';
      
      // Content & Media
      if (lowerInput.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image';
      if (lowerInput.includes('.pdf')) return 'pdf';
      if (lowerInput.match(/\.(mp3|wav|ogg|m4a)$/) || lowerInput.includes('podcast')) return 'audio';
      if (lowerInput.match(/\.(mp4|avi|mov|webm)$/)) return 'video';
      if (lowerInput.match(/\.(ppt|pptx|key)$/)) return 'presentation';
      
      // Recipe sites
      if (lowerInput.includes('recipe') || lowerInput.includes('cooking') || 
          lowerInput.includes('allrecipes.com') || lowerInput.includes('foodnetwork.com')) return 'recipe';
      
      // Documentation
      if (lowerInput.includes('/docs/') || lowerInput.includes('/documentation/') || 
          lowerInput.includes('docs.') || lowerInput.includes('developer.')) return 'documentation';
      
      // Default to article for news/blog sites
      if (lowerInput.includes('medium.com') || lowerInput.includes('substack.com') || 
          lowerInput.includes('blog') || lowerInput.includes('news')) return 'article';
      
      // Generic product page indicators
      if (lowerInput.includes('/product/') || lowerInput.includes('/shop/') || 
          lowerInput.includes('/item/')) return 'product';
      
      return 'bookmark';
    }
    
    return 'note';
  };

  const normalizeUrl = (input: string): string => {
    if (!input.startsWith('http') && input.includes('.')) {
      return `https://${input}`;
    }
    return input;
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setIsSubmitting(true);

    const contentType = detectContentType(input);
    // More specific URL detection - check for domain patterns, not just any period
    const urlPattern = /^(https?:\/\/)|(www\\.)|([a-zA-Z0-9-]+\.(com|org|net|io|dev|app|co|edu|gov|mil|info|biz|me|tv|fm|ai|cloud|xyz|tech|site|online|store|shop|blog|news|media|social|network|community|platform|service|solutions|digital|global|world|international|[a-z]{2,3}))/i;
    const isUrl = input.startsWith('http') || urlPattern.test(input);
    const normalizedUrl = isUrl ? normalizeUrl(input) : undefined;
    
    let newItem: Omit<MockItem, 'id' | 'created_at'>;

    if (normalizedUrl) {
      try {
        // Try to extract metadata for URLs
        const result = await urlMetadataService.analyzeUrl(normalizedUrl);
        
        newItem = {
          title: result.metadata.title || 'Quick Link',
          url: normalizedUrl,
          content_type: result.content_type,
          description: result.metadata.description || 'Added via quick capture',
          thumbnail_url: result.metadata.thumbnail_url,
          metadata: {
            domain: result.metadata.domain,
            author: result.metadata.author,
            duration: result.metadata.duration,
            video_url: result.metadata.video_url,
            video_type: result.metadata.video_type,
            profile_image: result.metadata.profile_image,
            likes: result.metadata.likes,
            retweets: result.metadata.retweets,
            replies: result.metadata.replies,
            tags: ['quick-add']
          }
        };
      } catch (error) {
        console.error('Failed to extract metadata:', error);
        
        // Fallback to simple URL handling
        let domain: string | undefined;
        try {
          const url = new URL(normalizedUrl);
          domain = url.hostname;
        } catch {
          domain = undefined;
        }

        newItem = {
          title: domain ? 'Quick Link' : input.substring(0, 50) + (input.length > 50 ? '...' : ''),
          url: domain ? normalizedUrl : undefined,
          content_type: contentType,
          description: domain ? 'Added via quick capture' : undefined,
          metadata: {
            domain: domain,
            tags: ['quick-add']
          }
        };
      }
    } else {
      // Handle text notes
      newItem = {
        title: input.substring(0, 50) + (input.length > 50 ? '...' : ''),
        content_type: 'note',
        description: input.length > 50 ? input : undefined,
        metadata: {
          tags: ['quick-add']
        }
      };
    }

    onAdd(newItem);
    setInput('');
    setIsSubmitting(false);
  };

  const handleImageSubmit = async (file: File, dataUrl: string) => {
    setIsSubmitting(true);

    try {
      // For now, we'll use the data URL as the thumbnail
      // In a production app, you'd want to upload to a storage service like Supabase Storage
      
      const newItem: Omit<MockItem, 'id' | 'created_at'> = {
        title: `Pasted Image - ${file.name}`,
        content_type: 'image',
        description: `Image pasted from clipboard (${Math.round(file.size / 1024)}KB)`,
        thumbnail_url: dataUrl, // Using data URL for now
        metadata: {
          file_size: `${Math.round(file.size / 1024)}KB`,
          tags: ['pasted-image', 'quick-add']
        }
      };

      onAdd(newItem);
      setInput('');
      setIsSubmitting(false);
    } catch (error) {
      console.error('Failed to process image:', error);
      setIsSubmitting(false);
    }
  };

  const handlePaste = async () => {
    try {
      // Try to read clipboard data (including images)
      const clipboardItems = await navigator.clipboard.read();
      
      for (const clipboardItem of clipboardItems) {
        // Check if clipboard contains an image
        const imageTypes = clipboardItem.types.filter(type => type.startsWith('image/'));
        
        if (imageTypes.length > 0) {
          const imageType = imageTypes[0];
          const blob = await clipboardItem.getType(imageType);
          
          // Create a File object from the blob
          const file = new File([blob], `pasted-image.${imageType.split('/')[1]}`, { type: imageType });
          
          // Create a data URL for immediate display
          const reader = new FileReader();
          reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            
            // Set input to indicate an image was pasted
            setInput(`📷 Image pasted (${file.size} bytes)`);
            
            // Auto-submit with image data
            setTimeout(() => {
              handleImageSubmit(file, dataUrl);
            }, 100);
          };
          reader.readAsDataURL(file);
          return;
        }
      }
      
      // If no image, try to read text
      const text = await navigator.clipboard.readText();
      if (text) {
        setInput(text);
        // Auto-submit after a brief delay to show what was pasted
        setTimeout(() => {
          handleSubmit();
        }, 100);
      }
    } catch (err) {
      console.error('Failed to read clipboard:', err);
      // Fallback to text-only clipboard reading
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          setInput(text);
          setTimeout(() => {
            handleSubmit();
          }, 100);
        }
      } catch (textErr) {
        console.error('Failed to read text from clipboard:', textErr);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleClear = () => {
    setInput('');
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      console.error('Only image files are supported');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a data URL for the image
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        
        const newItem: Omit<MockItem, 'id' | 'created_at'> = {
          title: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
          content_type: 'image',
          description: `Uploaded image (${Math.round(file.size / 1024)}KB)`,
          thumbnail_url: dataUrl,
          metadata: {
            file_size: `${Math.round(file.size / 1024)}KB`,
            tags: ['uploaded-image', 'quick-add']
          }
        };

        onAdd(newItem);
        setInput('');
        setIsSubmitting(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Failed to upload image:', error);
      setIsSubmitting(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleFileUpload(imageFile);
    }
  };

  return (
    <div 
      ref={cardRef} 
      id="new-item-card" 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 border-dashed transition-colors flex flex-col p-4 ${
        isDragOver 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
          : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex-1">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a note or paste something here..."
          className="w-full resize-none border-0 focus:outline-none text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 bg-transparent overflow-y-auto"
          style={{
            minHeight: '3rem', // ~2 lines minimum
            maxHeight: '8rem', // ~5 lines maximum before scrolling
          }}
          disabled={isSubmitting}
          autoFocus
          rows={1}
        />
      </div>
      
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          {input.trim() && (
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-1.5"
              disabled={isSubmitting}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear
            </button>
          )}
        </div>
        
        {input.trim() ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-1.5 text-sm bg-[rgb(255,77,6)] text-white rounded-md hover:bg-[rgb(230,69,5)] transition-colors flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Adding...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add
              </>
            )}
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePaste}
              className="px-4 py-1.5 text-sm bg-[rgb(255,77,6)] text-white rounded-md hover:bg-[rgb(230,69,5)] transition-colors flex items-center gap-1.5"
              disabled={isSubmitting}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Paste
            </button>
            <button
              type="button"
              onClick={handleFileSelect}
              className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1.5"
              disabled={isSubmitting}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Image
            </button>
          </div>
        )}
      </div>
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
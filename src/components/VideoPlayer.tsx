'use client';

import { useRef, useState, useEffect } from 'react';

interface VideoPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  className?: string;
  onError?: () => void;
  showControls?: boolean; // Allow standard video controls
  lazyLoad?: boolean; // Enable lazy loading with intersection observer
  unmuteOnHover?: boolean; // Unmute video when hovering
  hoverUnmuteEnabled?: boolean; // Global state for hover unmute feature
  onHoverUnmuteToggle?: () => void; // Callback to toggle hover unmute feature
}

export default function VideoPlayer({ 
  videoUrl, 
  thumbnailUrl, 
  autoplay = true, 
  muted = true, 
  loop = true,
  className = '',
  onError,
  showControls = false,
  lazyLoad = false,
  unmuteOnHover = false,
  hoverUnmuteEnabled = true,
  onHoverUnmuteToggle
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(muted);
  const [isInView, setIsInView] = useState(!lazyLoad); // If not lazy loading, consider always in view
  const [isHovering, setIsHovering] = useState(false);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazyLoad || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          setIsInView(entry.isIntersecting);
        });
      },
      {
        threshold: 0.1, // Trigger when 10% of the video is visible
        rootMargin: '50px' // Start loading slightly before video comes into view
      }
    );

    observer.observe(containerRef.current);

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [lazyLoad]);

  // Handle play/pause based on visibility
  useEffect(() => {
    if (!videoRef.current || !lazyLoad) return;

    const playVideo = async () => {
      try {
        await videoRef.current?.play();
        setIsPlaying(true);
      } catch (error) {
        console.log('Video play failed:', error);
      }
    };

    if (isInView && autoplay) {
      playVideo();
    } else if (!isInView) {
      // Always pause when out of view, regardless of playing state
      videoRef.current.pause();
      setIsPlaying(false);
      // Also mute when out of view
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  }, [isInView, autoplay, lazyLoad]);

  // Original autoplay effect for non-lazy loaded videos
  useEffect(() => {
    if (videoRef.current && autoplay && !lazyLoad) {
      // Attempt to play with user interaction workaround
      const playVideo = async () => {
        try {
          await videoRef.current?.play();
          setIsPlaying(true);
        } catch (error) {
          console.log('Autoplay failed:', error);
          // Autoplay might be blocked, user interaction required
        }
      };
      playVideo();
    }
  }, [autoplay, lazyLoad]);


  const handleError = () => {
    console.error('Video failed to load:', videoUrl);
    setHasError(true);
    onError?.();
  };

  const handleLoadedData = () => {
    setIsLoading(false);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering play/pause
    
    if (videoRef.current) {
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
      
      // If we have a hover unmute toggle callback, call it
      if (onHoverUnmuteToggle) {
        onHoverUnmuteToggle();
      }
    }
  };

  // Hover-based mute/unmute effect
  useEffect(() => {
    if (!unmuteOnHover || !videoRef.current) return;

    const video = videoRef.current;
    
    // Only unmute on hover if hover unmute is enabled globally
    if (isHovering && isPlaying && hoverUnmuteEnabled && isInView) {
      video.muted = false;
      setIsMuted(false);
    } else {
      video.muted = true;
      setIsMuted(true);
    }

    // Cleanup to ensure video is muted when effect changes
    return () => {
      if (video) {
        video.muted = true;
      }
    };
  }, [isHovering, isPlaying, unmuteOnHover, hoverUnmuteEnabled, isInView]);

  const handleMouseEnter = () => {
    if (unmuteOnHover) {
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    if (unmuteOnHover) {
      setIsHovering(false);
    }
  };

  if (hasError && thumbnailUrl) {
    // Fallback to thumbnail if video fails
    return (
      <div className={`relative ${className}`}>
        <img
          src={thumbnailUrl}
          alt="Video thumbnail"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-red-500 text-white px-3 py-1 rounded text-xs">
            Video unavailable
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={`relative group ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        poster={thumbnailUrl}
        muted={isMuted}
        loop={loop}
        playsInline
        autoPlay={autoplay && (!lazyLoad || isInView)}
        controls={showControls}
        onError={handleError}
        onLoadedData={handleLoadedData}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="w-full h-full object-cover"
      />
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 pointer-events-none">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Custom controls only if not showing native controls */}
      {!showControls && (
        <>
          {/* Mute/Unmute button */}
          <button
            className={`absolute bottom-2 left-2 bg-black bg-opacity-75 hover:bg-opacity-90 text-white p-2 rounded transition-all ${
              isPlaying ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={toggleMute}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            )}
          </button>
        </>
      )}
    </div>
  );
}
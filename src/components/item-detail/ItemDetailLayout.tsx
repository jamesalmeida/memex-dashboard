'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ItemDetailLayoutProps {
  leftColumn: React.ReactNode;
  rightColumn: React.ReactNode;
  centerShelf?: React.ReactNode;
  showCenterShelf?: boolean;
  onCenterShelfToggle?: (show: boolean) => void;
  className?: string;
}

export function ItemDetailLayout({
  leftColumn,
  rightColumn,
  centerShelf,
  showCenterShelf = false,
  onCenterShelfToggle,
  className,
}: ItemDetailLayoutProps) {
  const [isShelfOpen, setIsShelfOpen] = useState(showCenterShelf);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState<'metadata' | 'shelf'>('metadata');

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setIsShelfOpen(showCenterShelf);
  }, [showCenterShelf]);

  const toggleShelf = () => {
    const newState = !isShelfOpen;
    setIsShelfOpen(newState);
    onCenterShelfToggle?.(newState);
  };

  // Mobile swipe handling
  useEffect(() => {
    if (!isMobile || !centerShelf) return;

    let startX = 0;
    let currentX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      currentX = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
      const diffX = startX - currentX;
      const threshold = 50;

      if (Math.abs(diffX) > threshold) {
        if (diffX > 0 && mobileView === 'metadata') {
          // Swipe left - show shelf
          setMobileView('shelf');
        } else if (diffX < 0 && mobileView === 'shelf') {
          // Swipe right - show metadata
          setMobileView('metadata');
        }
      }
    };

    const rightColumnEl = document.getElementById('item-detail-right-column');
    if (rightColumnEl) {
      rightColumnEl.addEventListener('touchstart', handleTouchStart);
      rightColumnEl.addEventListener('touchmove', handleTouchMove);
      rightColumnEl.addEventListener('touchend', handleTouchEnd);

      return () => {
        rightColumnEl.removeEventListener('touchstart', handleTouchStart);
        rightColumnEl.removeEventListener('touchmove', handleTouchMove);
        rightColumnEl.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isMobile, mobileView, centerShelf]);

  return (
    <div className={cn('flex h-full w-full', className)}>
      {/* Desktop Layout */}
      <div className="hidden md:flex w-full h-full">
        {/* Left Column - Content Viewer */}
        <div
          className={cn(
            'flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden',
            isShelfOpen && centerShelf ? 'w-[40%]' : 'w-[60%]'
          )}
          id="item-detail-left-column"
        >
          <div className="h-full w-full overflow-auto">
            {leftColumn}
          </div>
        </div>

        {/* Center Shelf - Slides out from right column */}
        {centerShelf && (
          <div
            className={cn(
              'transition-all duration-300 ease-in-out overflow-hidden bg-background border-l',
              isShelfOpen ? 'w-[35%]' : 'w-0'
            )}
            id="item-detail-center-shelf"
          >
            <div className="h-full w-full overflow-auto">
              {centerShelf}
            </div>
          </div>
        )}

        {/* Right Column - Metadata (fixed width) */}
        <div
          className="w-[25%] min-w-[300px] flex-shrink-0 border-l bg-muted/30"
          id="item-detail-right-column"
        >
          <div className="h-full w-full overflow-auto relative">
            {/* Toggle button for center shelf */}
            {centerShelf && (
              <button
                onClick={toggleShelf}
                className={cn(
                  'absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full',
                  'bg-background border border-r-0 rounded-l-md p-1',
                  'hover:bg-muted transition-colors z-10'
                )}
                aria-label={isShelfOpen ? 'Close center shelf' : 'Open center shelf'}
              >
                {isShelfOpen ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </button>
            )}
            {rightColumn}
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col w-full h-full">
        {/* Left Column - Content Viewer */}
        <div className="flex-1 overflow-auto border-b" id="item-detail-left-column-mobile">
          {leftColumn}
        </div>

        {/* Right Column / Center Shelf - Swipeable */}
        <div className="h-[40%] relative overflow-hidden" id="item-detail-right-column-mobile">
          {centerShelf && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 flex gap-1">
              <div
                className={cn(
                  'w-8 h-1 rounded-full transition-colors',
                  mobileView === 'metadata' ? 'bg-primary' : 'bg-muted'
                )}
              />
              <div
                className={cn(
                  'w-8 h-1 rounded-full transition-colors',
                  mobileView === 'shelf' ? 'bg-primary' : 'bg-muted'
                )}
              />
            </div>
          )}

          <div
            className={cn(
              'flex h-full transition-transform duration-300',
              centerShelf && mobileView === 'shelf' ? '-translate-x-full' : 'translate-x-0'
            )}
          >
            {/* Metadata Panel */}
            <div className="w-full h-full flex-shrink-0 overflow-auto">
              {rightColumn}
            </div>

            {/* Center Shelf Panel */}
            {centerShelf && (
              <div className="w-full h-full flex-shrink-0 overflow-auto border-t">
                {centerShelf}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
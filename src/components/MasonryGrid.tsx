'use client'

import { useEffect, useRef, useCallback } from 'react';

interface MasonryGridProps {
  children: React.ReactNode[];
  className?: string;
  gap?: number;
}

export default function MasonryGrid({ children, className = '', gap = 16 }: MasonryGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const getColumnCount = () => {
    if (!containerRef.current) return 1;
    const width = containerRef.current.offsetWidth;
    
    if (width >= 1280) return 4; // xl
    if (width >= 1024) return 3; // lg
    if (width >= 768) return 2;  // md
    return 1; // sm
  };

  const updateLayout = useCallback(() => {
    if (!containerRef.current) return;
    
    const newColumns = getColumnCount();
    
    const container = containerRef.current;
    const items = Array.from(container.children) as HTMLElement[];
    
    // Calculate exact column width
    const totalGapWidth = gap * (newColumns - 1);
    const columnWidthPercentage = 100 / newColumns;
    const gapPercentage = (totalGapWidth / container.offsetWidth) * 100;
    const actualColumnWidth = columnWidthPercentage - (gapPercentage / newColumns);
    
    // Reset all positions
    items.forEach(item => {
      item.style.position = 'absolute';
      item.style.width = `${actualColumnWidth}%`;
      item.style.boxSizing = 'border-box';
    });
    
    // Track column heights
    const columnHeights = new Array(newColumns).fill(0);
    
    items.forEach((item, index) => {
      // For first row, position items left to right
      if (index < newColumns) {
        const leftPercentage = index * actualColumnWidth;
        const gapOffset = index * gap;
        item.style.left = `calc(${leftPercentage}% + ${gapOffset}px)`;
        item.style.top = '0px';
        
        // Update column height
        setTimeout(() => {
          columnHeights[index] = item.offsetHeight;
        }, 0);
      } else {
        // For subsequent items, place in shortest column
        setTimeout(() => {
          const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
          const leftPercentage = shortestColumnIndex * actualColumnWidth;
          const gapOffset = shortestColumnIndex * gap;
          
          item.style.left = `calc(${leftPercentage}% + ${gapOffset}px)`;
          item.style.top = `${columnHeights[shortestColumnIndex] + gap}px`;
          
          // Update column height
          columnHeights[shortestColumnIndex] += item.offsetHeight + gap;
        }, 100);
      }
    });
    
    // Set container height
    setTimeout(() => {
      const maxHeight = Math.max(...columnHeights);
      container.style.height = `${maxHeight}px`;
    }, 200);
  }, [gap]);

  useEffect(() => {
    const handleResize = () => {
      updateLayout();
    };
    
    updateLayout();
    window.addEventListener('resize', handleResize);
    
    // Update layout when children change
    const observer = new MutationObserver(updateLayout);
    if (containerRef.current) {
      observer.observe(containerRef.current, { childList: true, subtree: true });
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, [children.length, gap, updateLayout]);

  return (
    <div 
      ref={containerRef}
      className={`relative ${className}`}
      style={{ 
        position: 'relative', 
        width: '100%', 
        maxWidth: '100%',
        overflow: 'visible',
        boxSizing: 'border-box',
        zIndex: 1
      }}
    >
      {children}
    </div>
  );
}
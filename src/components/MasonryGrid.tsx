'use client'

import { useEffect, useRef, useCallback } from 'react';

interface MasonryGridProps {
  children: React.ReactNode[];
  className?: string;
  gap?: number;
  mobileColumns?: number; // Override mobile column count
}

export default function MasonryGrid({ children, className = '', gap = 24, mobileColumns = 2 }: MasonryGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const getColumnCount = () => {
    if (!containerRef.current) return 2;
    const width = containerRef.current.offsetWidth;
    
    if (width >= 2000) return 5; // 2xl+
    if (width >= 1280) return 4; // xl
    if (width >= 1000) return 3; // lg (starts at 1000px)
    if (width >= 768) return 2;  // md (768px - 999px)
    return mobileColumns; // sm - use prop value for mobile columns
  };

  const updateLayout = useCallback(() => {
    if (!containerRef.current) return;
    
    const newColumns = getColumnCount();
    
    // Calculate responsive gap inside the callback
    const width = containerRef.current.offsetWidth;
    const responsiveGap = width >= 768 ? gap : 10; // 10px gap for mobile, provided gap for tablet+
    
    const container = containerRef.current;
    const allItems = Array.from(container.children) as HTMLElement[];
    // Filter out hidden items (like hidden NewItemCard on mobile)
    const items = allItems.filter(item => {
      const computedStyle = window.getComputedStyle(item);
      return computedStyle.display !== 'none';
    });
    
    // Calculate exact column width
    const totalGapWidth = responsiveGap * (newColumns - 1);
    const columnWidthPercentage = 100 / newColumns;
    const gapPercentage = (totalGapWidth / container.offsetWidth) * 100;
    const actualColumnWidth = columnWidthPercentage - (gapPercentage / newColumns);
    
    // Reset all positions
    items.forEach(item => {
      item.style.position = 'absolute';
      item.style.width = `${actualColumnWidth}%`;
      item.style.boxSizing = 'border-box';
      item.style.margin = '0'; // Reset any margin that might cause alignment issues
    });
    
    // Track column heights
    const columnHeights = new Array(newColumns).fill(0);
    
    // First, position all first-row items with consistent baseline
    for (let i = 0; i < Math.min(items.length, newColumns); i++) {
      const item = items[i];
      const leftPercentage = i * actualColumnWidth;
      const gapOffset = i * responsiveGap;
      item.style.left = `calc(${leftPercentage}% + ${gapOffset}px)`;
      item.style.top = '0px';
      item.style.marginTop = '0px'; // Ensure no margin interference
      item.style.transform = 'translateY(0px)'; // Reset any transforms
    }
    
    // Wait for first row to be positioned, then measure heights
    setTimeout(() => {
      // Update column heights for first row
      for (let i = 0; i < Math.min(items.length, newColumns); i++) {
        columnHeights[i] = items[i].offsetHeight;
      }
      
      // Position remaining items
      for (let i = newColumns; i < items.length; i++) {
        const item = items[i];
        const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
        const leftPercentage = shortestColumnIndex * actualColumnWidth;
        const gapOffset = shortestColumnIndex * responsiveGap;
        
        item.style.left = `calc(${leftPercentage}% + ${gapOffset}px)`;
        item.style.top = `${columnHeights[shortestColumnIndex] + responsiveGap}px`;
        
        // Update column height
        columnHeights[shortestColumnIndex] += item.offsetHeight + responsiveGap;
      }
      
      // Set container height
      setTimeout(() => {
        const maxHeight = Math.max(...columnHeights);
        container.style.height = `${maxHeight}px`;
      }, 50);
    }, 50);
  }, [gap, mobileColumns]);

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
  }, [children.length, gap, mobileColumns, updateLayout]);

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
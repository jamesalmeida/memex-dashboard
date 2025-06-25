'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Folder, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Space } from '@/types/database';

interface SpaceSelectorProps {
  spaces: Space[];
  currentSpaceId?: string | null;
  onSelect: (spaceId: string | null) => void;
  className?: string;
}

export function SpaceSelector({ spaces, currentSpaceId, onSelect, className }: SpaceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Find current space
  const currentSpace = spaces.find(s => s.id === currentSpaceId);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (spaceId: string | null) => {
    onSelect(spaceId);
    setIsOpen(false);
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 text-sm rounded-md",
          "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700",
          "transition-colors cursor-pointer"
        )}
      >
        <Folder className="w-4 h-4" />
        <span className="flex-1 text-left">
          {currentSpace ? currentSpace.name : 'No Space'}
        </span>
        <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className={cn(
          "absolute top-full left-0 right-0 mt-1 z-50",
          "bg-white dark:bg-gray-900 rounded-md shadow-lg",
          "border border-gray-200 dark:border-gray-700",
          "max-h-64 overflow-auto"
        )}>
          {/* No Space option */}
          <button
            onClick={() => handleSelect(null)}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 text-sm text-left",
              "hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
              !currentSpaceId && "bg-gray-100 dark:bg-gray-800"
            )}
          >
            <div className="w-4 h-4 flex items-center justify-center">
              {!currentSpaceId && <Check className="w-3 h-3" />}
            </div>
            <span className="text-gray-600 dark:text-gray-400">No Space</span>
          </button>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700" />

          {/* Spaces */}
          {spaces.map((space) => (
            <button
              key={space.id}
              onClick={() => handleSelect(space.id)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-sm text-left",
                "hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
                currentSpaceId === space.id && "bg-gray-100 dark:bg-gray-800"
              )}
            >
              <div className="w-4 h-4 flex items-center justify-center">
                {currentSpaceId === space.id && <Check className="w-3 h-3" />}
              </div>
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: space.color }}
              />
              <span>{space.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
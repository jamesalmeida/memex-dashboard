'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ContentSkeletonProps {
  type?: 'twitter' | 'instagram' | 'youtube' | 'article' | 'default';
  className?: string;
}

export function ContentSkeleton({ type = 'default', className }: ContentSkeletonProps) {
  if (type === 'twitter') {
    return (
      <div className={cn("max-w-[600px] mx-auto p-4", className)}>
        <div className="bg-background rounded-2xl border shadow-sm p-4">
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-muted animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              <div className="h-3 w-24 bg-muted rounded animate-pulse" />
            </div>
          </div>
          
          {/* Content */}
          <div className="space-y-2 mb-4">
            <div className="h-4 w-full bg-muted rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
          </div>
          
          {/* Media */}
          <div className="aspect-video bg-muted rounded-2xl animate-pulse mb-3" />
          
          {/* Actions */}
          <div className="flex justify-between">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 w-16 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'instagram') {
    return (
      <div className={cn("max-w-[468px] mx-auto bg-background", className)}>
        <div className="border rounded-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            </div>
          </div>
          
          {/* Media */}
          <div className="aspect-square bg-muted animate-pulse" />
          
          {/* Actions */}
          <div className="p-3 space-y-3">
            <div className="flex justify-between">
              <div className="flex gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-6 h-6 bg-muted rounded animate-pulse" />
                ))}
              </div>
              <div className="w-6 h-6 bg-muted rounded animate-pulse" />
            </div>
            
            <div className="h-4 w-20 bg-muted rounded animate-pulse" />
            
            <div className="space-y-2">
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'youtube') {
    return (
      <div className={cn("max-w-5xl mx-auto", className)}>
        <div className="aspect-video bg-muted animate-pulse mb-4" />
        
        <div className="p-4 space-y-4">
          <div className="h-6 w-3/4 bg-muted rounded animate-pulse" />
          
          <div className="flex justify-between">
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-8 w-20 bg-muted rounded-full animate-pulse" />
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              <div className="h-3 w-24 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'article') {
    return (
      <div className={cn("max-w-4xl mx-auto px-6 py-8", className)}>
        <div className="space-y-4 mb-8">
          <div className="h-8 w-3/4 bg-muted rounded animate-pulse" />
          <div className="h-6 w-full bg-muted rounded animate-pulse" />
          <div className="flex gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 w-24 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
        
        <div className="aspect-video bg-muted rounded-lg animate-pulse mb-8" />
        
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
              <div className="h-4 w-4/6 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default skeleton
  return (
    <div className={cn("p-6 space-y-4", className)}>
      <div className="h-8 w-2/3 bg-muted rounded animate-pulse" />
      <div className="aspect-video bg-muted rounded animate-pulse" />
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-4 w-full bg-muted rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}
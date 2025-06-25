'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface MetadataSkeletonProps {
  className?: string;
}

export function MetadataSkeleton({ className }: MetadataSkeletonProps) {
  return (
    <div className={cn("space-y-6 p-4", className)}>
      {/* Content Type Badge */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-muted rounded animate-pulse" />
        <div className="h-5 w-24 bg-muted rounded animate-pulse" />
      </div>

      {/* URL */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-muted rounded animate-pulse" />
          <div className="h-4 w-12 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-4 w-full bg-muted rounded animate-pulse" />
      </div>

      {/* Author */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-muted rounded animate-pulse" />
          <div className="h-4 w-16 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
      </div>

      {/* Published Date */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-muted rounded animate-pulse" />
          <div className="h-4 w-20 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-4 w-28 bg-muted rounded animate-pulse" />
      </div>

      {/* Engagement Metrics */}
      <div className="space-y-2">
        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-4 h-4 bg-muted rounded animate-pulse" />
              <div className="h-4 w-16 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* User Notes */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="h-4 w-20 bg-muted rounded animate-pulse" />
          <div className="w-4 h-4 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-16 w-full bg-muted rounded animate-pulse" />
      </div>

      {/* Action Buttons */}
      <div className="border-t pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-8 h-8 bg-muted rounded animate-pulse" />
            ))}
          </div>
          <div className="w-8 h-8 bg-muted rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
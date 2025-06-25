'use client';

import React, { useState } from 'react';
import { RefreshCw, Folder, Trash2, ExternalLink, Download, Copy, Archive } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionButtonsProps {
  itemId: string;
  itemUrl: string;
  isArchived?: boolean;
  onRefresh?: () => Promise<void>;
  onChangeSpace?: () => void;
  onDelete?: () => Promise<void>;
  onArchive?: () => Promise<void>;
  onDownload?: () => void;
  className?: string;
}

export function ActionButtons({
  itemId,
  itemUrl,
  isArchived = false,
  onRefresh,
  onChangeSpace,
  onDelete,
  onArchive,
  onDownload,
  className,
}: ActionButtonsProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh || isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || isDeleting) return;
    
    // TODO: Add confirmation dialog
    const confirmed = window.confirm('Are you sure you want to delete this item?');
    if (!confirmed) return;
    
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleArchive = async () => {
    if (!onArchive || isArchiving) return;
    
    setIsArchiving(true);
    try {
      await onArchive();
    } finally {
      setIsArchiving(false);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(itemUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const handleOpenExternal = () => {
    window.open(itemUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={cn("border-t border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/50", className)}>
      <div className="flex items-center justify-between p-3 gap-2">
        {/* Primary Actions */}
        <div className="flex items-center gap-1">
          {onRefresh && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={cn(
                "p-2 rounded-md transition-colors",
                "hover:bg-gray-200 dark:hover:bg-gray-700",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              title="Refresh metadata"
            >
              <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
            </button>
          )}
          
          {onChangeSpace && (
            <button
              onClick={onChangeSpace}
              className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Change space"
            >
              <Folder className="w-4 h-4" />
            </button>
          )}
          
          <button
            onClick={handleCopyUrl}
            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title={copied ? "Copied!" : "Copy URL"}
          >
            <Copy className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleOpenExternal}
            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Open in browser"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          
          {onDownload && (
            <button
              onClick={onDownload}
              className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Archive/Delete */}
        <div className="flex items-center gap-1">
          {onArchive && (
            <button
              onClick={handleArchive}
              disabled={isArchiving}
              className={cn(
                "p-2 rounded-md transition-colors",
                "hover:bg-gray-200 dark:hover:bg-gray-700",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              title={isArchived ? "Unarchive item" : "Archive item"}
            >
              <Archive className="w-4 h-4" />
            </button>
          )}
          
          {onDelete && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className={cn(
                "p-2 rounded-md transition-colors",
                "hover:bg-destructive hover:text-destructive-foreground",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              title="Delete item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
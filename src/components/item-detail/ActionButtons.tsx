'use client';

import React, { useState } from 'react';
import { RefreshCw, Folder, Trash2, ExternalLink, Download, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionButtonsProps {
  itemId: string;
  itemUrl: string;
  onRefresh?: () => Promise<void>;
  onChangeSpace?: () => void;
  onDelete?: () => Promise<void>;
  onDownload?: () => void;
  className?: string;
}

export function ActionButtons({
  itemId,
  itemUrl,
  onRefresh,
  onChangeSpace,
  onDelete,
  onDownload,
  className,
}: ActionButtonsProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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
    <div className={cn("border-t bg-muted/30", className)}>
      <div className="flex items-center justify-between p-3 gap-2">
        {/* Primary Actions */}
        <div className="flex items-center gap-1">
          {onRefresh && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={cn(
                "p-2 rounded-md transition-colors",
                "hover:bg-muted hover:text-foreground",
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
              className="p-2 rounded-md hover:bg-muted hover:text-foreground transition-colors"
              title="Change space"
            >
              <Folder className="w-4 h-4" />
            </button>
          )}
          
          <button
            onClick={handleCopyUrl}
            className="p-2 rounded-md hover:bg-muted hover:text-foreground transition-colors"
            title={copied ? "Copied!" : "Copy URL"}
          >
            <Copy className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleOpenExternal}
            className="p-2 rounded-md hover:bg-muted hover:text-foreground transition-colors"
            title="Open in browser"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          
          {onDownload && (
            <button
              onClick={onDownload}
              className="p-2 rounded-md hover:bg-muted hover:text-foreground transition-colors"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Danger Zone */}
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
  );
}
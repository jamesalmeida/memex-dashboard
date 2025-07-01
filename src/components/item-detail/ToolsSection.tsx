import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Image, ExternalLink, Download, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolsSectionProps {
  contentType: string;
  item: {
    id: string;
    url: string;
    thumbnail_url?: string;
    video_id?: string;
    metadata?: any;
  };
  isTranscriptOpen?: boolean;
  onTranscriptToggle?: () => void;
}

export function ToolsSection({ contentType, item, isTranscriptOpen, onTranscriptToggle }: ToolsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  if (contentType !== 'youtube') {
    return null;
  }

  const handleDownloadThumbnail = async () => {
    if (!item.thumbnail_url) return;
    
    try {
      const response = await fetch(item.thumbnail_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `thumbnail-${item.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading thumbnail:', error);
    }
  };

  const handleOpenThumbnail = () => {
    if (item.thumbnail_url) {
      window.open(item.thumbnail_url, '_blank');
    }
  };

  return (
    <div className="p-4 border-t" id="tools-section">
      <div 
        className="flex items-center justify-between mb-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Tools</h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </div>
      
      {isExpanded && (
        <div className="space-y-2">
          {onTranscriptToggle && (
            <button
              onClick={onTranscriptToggle}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                isTranscriptOpen
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted-foreground/10"
              )}
            >
              <FileText className="w-4 h-4" />
              <span>Transcript</span>
            </button>
          )}
          
          {item.thumbnail_url && (
            <div className="flex items-center gap-2">
              <Image className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Thumbnail</span>
              <div className="flex gap-1 ml-auto">
                <button
                  onClick={handleOpenThumbnail}
                  className="p-1.5 hover:bg-muted rounded transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDownloadThumbnail}
                  className="p-1.5 hover:bg-muted rounded transition-colors"
                  title="Download thumbnail"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
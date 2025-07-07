'use client';

import React from 'react';
import { MessageSquare, Copy, FileText, Image, Video } from 'lucide-react';

interface XToolsSectionProps {
  postType: 'video' | 'image' | 'text';
  onChat: (context: string) => void;
  onCopy: () => void;
  onShowTranscript: () => void;
  onShowImageDescription: () => void;
  chatContext: string;
}

export function XToolsSection({
  postType,
  onChat,
  onCopy,
  onShowTranscript,
  onShowImageDescription,
  chatContext,
}: XToolsSectionProps) {
  return (
    <div className="p-4 border-t">
      <h3 className="font-semibold mb-2">Tools</h3>
      <div className="flex flex-col gap-2">
        {postType === 'video' && (
          <button
            onClick={onShowTranscript}
            className="flex items-center gap-2 p-2 hover:bg-muted rounded-md transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Transcript</span>
          </button>
        )}
        {postType === 'image' && (
          <button
            onClick={onShowImageDescription}
            className="flex items-center gap-2 p-2 hover:bg-muted rounded-md transition-colors"
          >
            <Image className="w-4 h-4" />
            <span>Image Description</span>
          </button>
        )}
        {postType === 'text' && (
          <button
            onClick={onCopy}
            className="flex items-center gap-2 p-2 hover:bg-muted rounded-md transition-colors"
          >
            <Copy className="w-4 h-4" />
            <span>Copy Post Text</span>
          </button>
        )}
        <button
          onClick={() => onChat(chatContext)}
          className="flex items-center gap-2 p-2 hover:bg-muted rounded-md transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Chat</span>
        </button>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Save, Edit3, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserNotesProps {
  itemId: string;
  initialNotes?: string;
  onSave?: (notes: string) => Promise<void>;
  className?: string;
}

export function UserNotes({ itemId, initialNotes = '', onSave, className }: UserNotesProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tempNotes, setTempNotes] = useState(notes);

  useEffect(() => {
    setNotes(initialNotes);
    setTempNotes(initialNotes);
  }, [initialNotes]);

  const handleSave = async () => {
    if (tempNotes === notes) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(tempNotes);
      }
      setNotes(tempNotes);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save notes:', error);
      // TODO: Show error toast
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setTempNotes(notes);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave();
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">My Notes</h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 hover:bg-muted rounded transition-colors"
            aria-label="Edit notes"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={tempNotes}
            onChange={(e) => setTempNotes(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add your notes here..."
            className={cn(
              "w-full min-h-[100px] p-3 text-sm",
              "bg-background border rounded-md",
              "focus:outline-none focus:ring-2 focus:ring-primary",
              "resize-y"
            )}
            autoFocus
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-sm",
                "bg-primary text-primary-foreground rounded-md",
                "hover:bg-primary/90 transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <Save className="w-3 h-3" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-sm",
                "bg-muted hover:bg-muted/80 rounded-md transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <X className="w-3 h-3" />
              Cancel
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Tip: Press Ctrl+Enter (Cmd+Enter on Mac) to save
          </p>
        </div>
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className={cn(
            "p-3 text-sm rounded-md cursor-text",
            "bg-muted/50 hover:bg-muted/70 transition-colors",
            "min-h-[60px]",
            !notes && "text-muted-foreground"
          )}
        >
          {notes || 'Click to add notes...'}
        </div>
      )}
    </div>
  );
}
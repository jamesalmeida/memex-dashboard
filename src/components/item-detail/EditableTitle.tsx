'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Check, X, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditableTitleProps {
  title: string;
  onSave: (newTitle: string) => void;
  className?: string;
}

export function EditableTitle({ title, onSave, className }: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(title);
  }, [title]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmedValue = editValue.trim();
    if (trimmedValue !== title) {
      onSave(trimmedValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          placeholder="Enter a title..."
          className="flex-1 px-2 py-1 text-lg font-semibold bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground placeholder:font-normal"
        />
        <button
          onClick={handleSave}
          className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded"
          onMouseDown={(e) => e.preventDefault()} // Prevent blur
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={handleCancel}
          className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
          onMouseDown={(e) => e.preventDefault()} // Prevent blur
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded px-2 py-1 -mx-2 -my-1",
        className
      )}
      onClick={() => setIsEditing(true)}
    >
      <h2 className={cn(
        "text-lg font-semibold line-clamp-2",
        !title && "text-muted-foreground italic"
      )}>
        {title || 'No title'}
      </h2>
      <Edit2 className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
    </div>
  );
}
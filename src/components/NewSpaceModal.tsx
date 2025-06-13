'use client'

import { useState } from 'react';
import { MockSpace } from '@/utils/mockData';
import Modal from './Modal';

interface NewSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSpace: (space: Omit<MockSpace, 'id' | 'count'>) => void;
}

const spaceColors = [
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#6366F1', // Indigo
  '#84CC16', // Lime
  '#F97316', // Orange
  '#EC4899', // Pink
  '#06B6D4'  // Cyan
];

export default function NewSpaceModal({ isOpen, onClose, onCreateSpace }: NewSpaceModalProps) {
  const [spaceName, setSpaceName] = useState('');
  const [spaceDescription, setSpaceDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(spaceColors[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spaceName.trim()) return;

    setIsSubmitting(true);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 300));

    const newSpace: Omit<MockSpace, 'id' | 'count'> = {
      name: spaceName.trim(),
      description: spaceDescription.trim() || undefined,
      color: selectedColor
    };

    onCreateSpace(newSpace);
    
    // Reset form
    setSpaceName('');
    setSpaceDescription('');
    setSelectedColor(spaceColors[0]);
    setIsSubmitting(false);
    onClose();
  };

  const handleClose = () => {
    // Reset form when closing
    setSpaceName('');
    setSpaceDescription('');
    setSelectedColor(spaceColors[0]);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} modalId="new-space-modal" title="Create New Space">
      {/* Content */}
      <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Space Name */}
            <div>
              <label htmlFor="spaceName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Space Name *
              </label>
              <input
                id="spaceName"
                type="text"
                value={spaceName}
                onChange={(e) => setSpaceName(e.target.value)}
                placeholder="Enter space name..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={isSubmitting}
                autoFocus
                required
              />
            </div>

            {/* Space Description */}
            <div>
              <label htmlFor="spaceDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description (optional)
              </label>
              <textarea
                id="spaceDescription"
                value={spaceDescription}
                onChange={(e) => setSpaceDescription(e.target.value)}
                placeholder="Brief description of this space..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                disabled={isSubmitting}
              />
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Choose Color
              </label>
              <div className="grid grid-cols-5 gap-3">
                {spaceColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      selectedColor === color 
                        ? 'border-gray-800 dark:border-gray-200 scale-110' 
                        : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    disabled={isSubmitting}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!spaceName.trim() || isSubmitting}
              className="px-4 py-2 text-sm bg-[rgb(255,77,6)] text-white rounded-md hover:bg-[rgb(230,69,5)] disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Space
                </>
              )}
            </button>
          </div>
        </form>
    </Modal>
  );
}
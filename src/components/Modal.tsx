'use client'

import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string | React.ReactNode;
  modalId?: string;
}

export default function Modal({ isOpen, onClose, children, title, modalId }: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);
  const isDragging = useRef(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // ESC key handler
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  // Body scroll lock when modal is open
  useEffect(() => {
    if (isOpen) {
      // Store the current scroll position
      const scrollY = window.scrollY;
      
      // Lock body scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      return () => {
        // Restore scroll position and unlock body scroll
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      // Start rendering the modal
      setShouldRender(true);
      // Double RAF to ensure the element is rendered in its initial position before animating
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else if (!isOpen && isVisible) {
      // Start close animation
      setIsVisible(false);
      // Wait for animation to complete before removing from DOM
      setTimeout(() => {
        setShouldRender(false);
        setIsFullscreen(true); // Reset to fullscreen (default) after animation completes
      }, 550); // Slightly longer than transition duration
    }
  }, [isOpen, isVisible]);

  // Touch handlers for mobile drag-to-dismiss
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.innerWidth >= 768) return; // Only on mobile
    startY.current = e.touches[0].clientY;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || window.innerWidth >= 768) return;
    
    currentY.current = e.touches[0].clientY;
    const deltaY = currentY.current - startY.current;
    
    // Only allow dragging down
    if (deltaY > 0 && modalRef.current) {
      modalRef.current.style.transform = `translateY(${deltaY}px)`;
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging.current || window.innerWidth >= 768) return;
    
    const deltaY = currentY.current - startY.current;
    
    // If dragged more than 100px, close the modal
    if (deltaY > 100) {
      onClose();
    } else if (modalRef.current) {
      // Snap back to position
      modalRef.current.style.transform = '';
    }
    
    isDragging.current = false;
    startY.current = 0;
    currentY.current = 0;
  };

  if (!mounted || !shouldRender) return null;

  const modalContent = (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-40 transition-all duration-500 ${
          isVisible 
            ? 'bg-black/40 backdrop-blur-sm' 
            : 'bg-black/0 backdrop-blur-none pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Modal/Sheet */}
      <div
        id={modalId || "modal-container"}
        ref={modalRef}
        className={`fixed z-50 bg-white dark:bg-gray-800 flex flex-col
          ${/* Base positioning */ ''}
          ${isFullscreen 
            ? 'md:inset-5 md:w-[calc(100vw-40px)] md:h-[calc(100vh-40px)] md:max-w-none' 
            : 'md:left-1/2 md:w-[75vw] md:max-w-6xl md:-translate-x-1/2 md:h-[75vh] md:max-h-[75vh]'
          }
          ${/* Common desktop styles */ ''}
          md:rounded-xl md:shadow-xl
          ${/* Mobile styles */ ''}
          left-0 right-0 bottom-0 w-full rounded-t-2xl shadow-2xl max-h-[90vh] overflow-hidden
          ${/* Transform and opacity transitions */ ''}
          transition-all duration-500 ease-in-out
          ${/* Animation states for desktop */ ''}
          ${isVisible 
            ? isFullscreen 
              ? 'md:translate-y-0 opacity-100'
              : 'md:top-1/2 md:-translate-y-1/2 opacity-100'
            : isFullscreen
              ? 'md:translate-y-[100vh] opacity-0'
              : 'md:top-[calc(100%+100px)] md:-translate-y-1/2 opacity-0'
          }
          ${/* Animation states for mobile */ ''}
          ${isVisible ? 'translate-y-0' : 'translate-y-full'}
        `}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="md:hidden flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          {typeof title === 'string' ? (
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h2>
          ) : (
            title || <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Modal</h2>
          )}
          <div className="flex items-center gap-2">
            {/* Fullscreen toggle - only show on desktop */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="hidden md:block p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                /* Minimize icon */
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                </svg>
              ) : (
                /* Maximize icon */
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              )}
            </button>
            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
'use client'

import { useTheme } from '@/contexts/ThemeContext';

interface LeftRailProps {
  onSettingsClick: () => void;
  viewMode: 'everything' | 'spaces' | 'space-detail';
  onEverythingClick: () => void;
  onSpacesClick: () => void;
  onHomeClick: () => void;
  onAddClick: () => void;
}

export default function LeftRail({ onSettingsClick, viewMode, onEverythingClick, onSpacesClick, onHomeClick, onAddClick }: LeftRailProps) {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="hidden md:block fixed left-0 top-0 bottom-0 w-20 pointer-events-none z-30">
      {/* Rail container - full height, 80px wide */}
      <div className="h-full flex flex-col items-center">
        
        {/* Home Button - Within top padding area (93px total) */}
        <div id="home-button-container" className="h-[93px] flex items-center justify-center">
          <button
            onClick={onHomeClick}
            className="w-[52px] h-[52px] bg-white dark:bg-gray-800 rounded-full flex items-center justify-center border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:border-gray-400 dark:hover:border-gray-500 transition-colors pointer-events-auto"
            aria-label="Go to home (Everything view)"
            title="Home"
          >
            {/* House icon */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>
        </div>

        {/* Navigation and Content Area */}
        <div className="flex-1 flex flex-col justify-between items-center pb-8 gap-2">
        
        <div className="flex flex-col gap-4">
        {/* Vertical Navigation Toggle */}
        <div id="vertical-navigation-toggle" className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full p-1 flex flex-col items-center relative h-[120px] w-[52px] pointer-events-auto">
          {/* Sliding pill background */}
          <div 
            className="absolute w-[calc(100%-8px)] bg-[rgb(255,77,6)] rounded-full transition-all duration-200 ease-out"
            style={{
              height: 'calc(50% - 4px)',
              top: viewMode === 'everything' ? '4px' : 'calc(50%)',
            }}
          />
          
          {/* Toggle buttons */}
          <button
            onClick={onEverythingClick}
            className={`relative z-10 py-3 px-3 transition-colors rounded-full flex-1 flex items-center justify-center ${
              viewMode === 'everything' 
                ? 'text-white' 
                : 'text-gray-700 dark:text-gray-300'
            }`}
            aria-label="View all items"
            title="Everything"
          >
            {/* Grid icon - 3x3 dots */}
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="4" cy="4" r="2"/>
              <circle cx="12" cy="4" r="2"/>
              <circle cx="20" cy="4" r="2"/>
              <circle cx="4" cy="12" r="2"/>
              <circle cx="12" cy="12" r="2"/>
              <circle cx="20" cy="12" r="2"/>
              <circle cx="4" cy="20" r="2"/>
              <circle cx="12" cy="20" r="2"/>
              <circle cx="20" cy="20" r="2"/>
            </svg>
          </button>
          <button
            onClick={onSpacesClick}
            className={`relative z-10 py-3 px-3 transition-colors rounded-full flex-1 flex items-center justify-center ${
              viewMode === 'spaces' || viewMode === 'space-detail'
                ? 'text-white' 
                : 'text-gray-700 dark:text-gray-300'
            }`}
            aria-label="View spaces"
            title="Spaces"
          >
            {/* 3D cube icon */}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </button>
        </div>

        {/* Context-Aware Add Button */}
        <button
          id="left-rail-add-button"
          onClick={onAddClick}
          className="w-[52px] h-[52px] bg-[rgb(255,77,6)] text-white rounded-full flex items-center justify-center border border-gray-300 dark:border-gray-600 hover:bg-[rgb(230,69,5)] hover:border-gray-400 dark:hover:border-gray-500 transition-colors pointer-events-auto shadow-lg hover:shadow-xl"
          aria-label={
            viewMode === 'everything' ? 'Add new item' :
            viewMode === 'spaces' ? 'Create new space' :
            'Add item to space'
          }
          title={
            viewMode === 'everything' ? 'Add Item' :
            viewMode === 'spaces' ? 'New Space' :
            'Add to Space'
          }
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
        </div>

        {/* Bottom icons */}
        <div className="flex flex-col gap-2">
          {/* Dark Mode Toggle - Above settings */}
        <button
          onClick={toggleTheme}
          className="p-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all group pointer-events-auto"
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? (
            <svg className="w-6 h-6 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )}
        </button>

        {/* Settings Button - Fixed to bottom */}
        <button
          onClick={onSettingsClick}
          className="p-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all group pointer-events-auto"
          aria-label="Settings"
        >
          <svg 
            className="w-6 h-6 transition-colors" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
            />
          </svg>
        </button>
        
          {/* Placeholder for future icons above the settings button */}
          {/* You can add more buttons here later */}
        </div>
        </div>
      </div>
    </div>
  );
}
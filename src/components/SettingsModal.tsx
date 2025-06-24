'use client'

import { useState, useEffect } from 'react';
import { SignOutButton } from './SignOutButton';
import Modal from './Modal';
import XApiStatus from './XApiStatus';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  userId?: string;
}

export default function SettingsModal({ isOpen, onClose, userEmail, userId }: SettingsModalProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newIsDarkMode = !isDarkMode;
    setIsDarkMode(newIsDarkMode);
    
    if (newIsDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const copyUserId = () => {
    if (userId) {
      navigator.clipboard.writeText(userId);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} modalId="settings-modal" title="Settings" maxWidth="md:max-w-[390px]" isFullscreen={false}>
      {/* Content */}
      <div className="p-6">
          <div className="space-y-6">
            {/* Account Section */}
            <div className="space-y-3">
              {userEmail && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Account Email</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{userEmail}</span>
                </div>
              )}
              {userId && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Extension User ID</span>
                  <button
                    onClick={copyUserId}
                    className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  >
                    <span className="font-mono text-xs">{userId.slice(0, 8)}...</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {copySuccess && <span className="text-green-500 text-xs">Copied!</span>}
                  </button>
                </div>
              )}
            </div>

            {/* Placeholder for future settings */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Theme</span>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  {isDarkMode ? (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21.64 13a1 1 0 0 0-1.05-.14 8.05 8.05 0 0 1-3.37.73 8.15 8.15 0 0 1-8.14-8.1 8.59 8.59 0 0 1 .25-2A1 1 0 0 0 8 2.36a10.14 10.14 0 1 0 14 11.69 1 1 0 0 0-.36-1.05z"/>
                      </svg>
                      Dark
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2a1 1 0 0 0 1 1v2a1 1 0 0 0-2 0V3a1 1 0 0 0 1-1zm6.364 1.636a1 1 0 0 0-1.414 1.414l1.414 1.414a1 1 0 0 0 1.414-1.414l-1.414-1.414zM21 11a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2h-2zm-1.636 6.364a1 1 0 0 0-1.414-1.414l-1.414 1.414a1 1 0 0 0 1.414 1.414l1.414-1.414zM12 18a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0v-2a1 1 0 0 0-1-1zM5.636 17.364a1 1 0 0 0-1.414 1.414l1.414 1.414a1 1 0 0 0 1.414-1.414l-1.414-1.414zM2 12a1 1 0 1 0 2 0H2a1 1 0 0 0-2 0zm1.636-6.364a1 1 0 0 0 1.414-1.414L3.636 2.808a1 1 0 0 0-1.414 1.414l1.414 1.414z"/>
                        <circle cx="12" cy="12" r="4"/>
                      </svg>
                      Light
                    </>
                  )}
                </button>
              </div>
              {/* <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Language</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">English</span>
              </div> */}
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Integrations</h3>
              <div className="space-y-3">
                <XApiStatus />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Data</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Export data</span>
                  <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                    Export
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Import data</span>
                  <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                    Import
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Sign out of your account</span>
                <SignOutButton />
              </div>
          </div>
        </div>
    </Modal>
  );
}
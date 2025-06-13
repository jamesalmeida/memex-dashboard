'use client'

import { SignOutButton } from './SignOutButton';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

export default function SettingsModal({ isOpen, onClose, userEmail }: SettingsModalProps) {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Account Section */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Account</h3>
              <div className="space-y-3">
                {userEmail && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Email</span>
                    <span className="text-sm text-gray-500">{userEmail}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Sign out of your account</span>
                  <SignOutButton />
                </div>
              </div>
            </div>

            {/* Placeholder for future settings */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Preferences</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Theme</span>
                  <span className="text-sm text-gray-500">Light</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Language</span>
                  <span className="text-sm text-gray-500">English</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Data</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Export data</span>
                  <button className="text-sm text-blue-600 hover:text-blue-700">
                    Export
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Import data</span>
                  <button className="text-sm text-blue-600 hover:text-blue-700">
                    Import
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
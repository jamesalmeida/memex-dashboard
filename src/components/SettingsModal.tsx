'use client'

import { SignOutButton } from './SignOutButton';
import Modal from './Modal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

export default function SettingsModal({ isOpen, onClose, userEmail }: SettingsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} modalId="settings-modal" title="Settings">
      {/* Content */}
      <div className="p-6">
          <div className="space-y-6">
            {/* Account Section */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Account</h3>
              <div className="space-y-3">
                {userEmail && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Email</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{userEmail}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Sign out of your account</span>
                  <SignOutButton />
                </div>
              </div>
            </div>

            {/* Placeholder for future settings */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Preferences</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Theme</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Light</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Language</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">English</span>
                </div>
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
          </div>
        </div>
    </Modal>
  );
}
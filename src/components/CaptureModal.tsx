'use client'

import { MockItem } from '@/utils/mockData';
import Modal from './Modal';
import NewItemCard from './NewItemCard';

interface CaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Omit<MockItem, 'id' | 'created_at'>) => void;
}

export default function CaptureModal({ isOpen, onClose, onAdd }: CaptureModalProps) {
  const handleAdd = (item: Omit<MockItem, 'id' | 'created_at'>) => {
    onAdd(item);
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      modalId="capture-modal" 
      title="Add New Item"
      maxWidth="max-w-[450px]"
      isFullscreen={false}
    >
      <div className="p-6">
        <NewItemCard onAdd={handleAdd} />
      </div>
    </Modal>
  );
}
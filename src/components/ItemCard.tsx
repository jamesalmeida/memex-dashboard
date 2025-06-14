'use client'

import { ItemWithMetadata } from '@/types/database';
import { CardRouter } from './cards';

interface ItemCardProps {
  item: ItemWithMetadata;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  onMoveToProject?: (id: string, spaceId: string) => void;
  onClick?: (item: ItemWithMetadata) => void;
}

export default function ItemCard({ 
  item, 
  onArchive, 
  onDelete, 
  onMoveToProject, 
  onClick 
}: ItemCardProps) {
  return (
    <CardRouter 
      item={item}
      onArchive={onArchive}
      onDelete={onDelete}
      onClick={onClick}
    />
  );
}
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DollarSign, Edit2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditablePriceProps {
  price?: {
    current: number;
    original?: number;
    currency: string;
    discount?: number;
  };
  onSave: (price: { current: number; currency: string }) => void;
  className?: string;
}

export function EditablePrice({ price, onSave, className }: EditablePriceProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [editCurrency, setEditCurrency] = useState('USD');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const formatPrice = (amount: number, currency: string) => {
    // Ensure we have a valid currency code
    const validCurrency = currency || 'USD';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: validCurrency,
    }).format(amount);
  };

  const handleEdit = () => {
    setEditValue(price?.current?.toString() || '');
    setEditCurrency(price?.currency || 'USD');
    setIsEditing(true);
  };

  const handleSave = () => {
    const numericValue = parseFloat(editValue);
    if (!isNaN(numericValue) && numericValue >= 0) {
      onSave({
        current: numericValue,
        currency: editCurrency,
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <select
          value={editCurrency}
          onChange={(e) => setEditCurrency(e.target.value)}
          className="px-2 py-1 text-sm border rounded"
        >
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
          <option value="JPY">JPY</option>
          <option value="CAD">CAD</option>
          <option value="AUD">AUD</option>
        </select>
        <div className="relative">
          <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            ref={inputRef}
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleCancel}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="pl-8 pr-2 py-1 w-32 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button
          onMouseDown={(e) => e.preventDefault()} // Prevent blur
          onClick={handleSave}
          className="p-1 text-green-600 hover:bg-green-50 rounded"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onMouseDown={(e) => e.preventDefault()} // Prevent blur
          onClick={handleCancel}
          className="p-1 text-red-600 hover:bg-red-50 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {price && price.current !== undefined ? (
        <>
          <span className="text-2xl font-bold">
            {formatPrice(price.current, price.currency || 'USD')}
          </span>
          {price.original && price.original > price.current && (
            <>
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(price.original, price.currency || 'USD')}
              </span>
              {price.discount && (
                <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-sm rounded">
                  {price.discount}% off
                </span>
              )}
            </>
          )}
        </>
      ) : (
        <span className="text-2xl text-muted-foreground">No price set</span>
      )}
      <button
        onClick={handleEdit}
        className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
        title="Edit price"
      >
        <Edit2 className="w-4 h-4" />
      </button>
    </div>
  );
}
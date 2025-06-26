'use client';

import React from 'react';
import { ShoppingCart, Package, Star, Tag, Store } from 'lucide-react';
import { EditablePrice } from '../EditablePrice';

interface ProductViewerProps {
  title: string;
  productId?: string;
  brand?: string;
  price?: {
    current: number;
    original?: number;
    currency: string;
    discount?: number;
  };
  availability?: 'in_stock' | 'out_of_stock' | 'limited' | 'pre_order';
  rating?: {
    average: number;
    count: number;
  };
  description?: string;
  thumbnail?: string;
  specifications?: Record<string, string>;
  seller?: {
    name: string;
    rating?: number;
    url?: string;
  };
  onUpdatePrice?: (price: { current: number; currency: string }) => void;
}

export function ProductViewer({
  title,
  productId,
  brand,
  price,
  availability,
  rating,
  description,
  thumbnail,
  specifications,
  seller,
  onUpdatePrice,
}: ProductViewerProps) {
  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Product Images */}
      <div className="bg-white dark:bg-gray-900 rounded-lg">
        {thumbnail ? (
          <div className="aspect-square max-w-2xl mx-auto">
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <div className="aspect-square max-w-2xl mx-auto bg-muted flex items-center justify-center">
            <Package className="w-24 h-24 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Brand */}
        {/* {brand && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Store className="w-4 h-4" />
            <span>{brand}</span>
          </div>
        )} */}

        {/* Title */}
        {/* <h1 className="text-2xl font-semibold mb-4">{title}</h1> */}

        {/* Price */}
        <div className="bg-muted/50 rounded-lg p-4 mb-4">
          <div className="flex items-start justify-between">
            <EditablePrice 
              price={price} 
              onSave={onUpdatePrice || (() => {})}
            />
          </div>
        </div>

        {/* Description */}
        {description && (
          <div className="mb-4">
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {description}
            </p>
          </div>
        )}

        {/* Specifications */}
        {specifications && Object.keys(specifications).length > 0 && (
          <div>
            <h3 className="font-medium mb-2">Specifications</h3>
            <div className="border rounded-lg divide-y">
              {Object.entries(specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between p-3 text-sm">
                  <span className="font-medium">{key}</span>
                  <span className="text-muted-foreground text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
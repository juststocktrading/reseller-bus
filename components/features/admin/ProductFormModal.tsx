'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/lib/types';
import { ProductService } from '@/services/product-service';
import ImageUploader from './ImageUploader';
import { sanitizeDigits, sanitizeDecimal } from '@/lib/input-utils';
import { FiX, FiBox } from 'react-icons/fi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  categories: { id: string; name: string }[];
  editingProduct?: Product | null;
}

export default function ProductFormModal({
  isOpen,
  onClose,
  onRefresh,
  categories,
  editingProduct,
}: Props) {
  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    price: 500,
    weightKg: 50,
    grade: 'Cream Grade NWT (95% New with Tags)',
    estimatedPieces: '160 - 200 pcs',
    avgCostPerPiece: 2.77,
    estimatedResale: 18.00,
    stockCount: 10,
    isPreOrder: false,
    description: '',
    images: [] as string[],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingProduct) {
      let parsedImages: string[] = [];
      try {
        parsedImages = JSON.parse(editingProduct.images);
      } catch (e) {
        parsedImages = editingProduct.images ? [editingProduct.images] : [];
      }

      setFormData({
        title: editingProduct.title,
        categoryId: editingProduct.categoryId,
        price: editingProduct.price,
        weightKg: editingProduct.weightKg || 50,
        grade: editingProduct.grade,
        estimatedPieces: editingProduct.estimatedPieces,
        avgCostPerPiece: editingProduct.avgCostPerPiece || 0,
        estimatedResale: editingProduct.estimatedResale || 0,
        stockCount: editingProduct.stockCount,
        isPreOrder: editingProduct.isPreOrder,
        description: editingProduct.description,
        images: parsedImages,
      });
    } else {
      setFormData({
        title: '',
        categoryId: categories[0]?.id || '',
        price: 500,
        weightKg: 50,
        grade: 'Cream Grade NWT (95% New with Tags)',
        estimatedPieces: '160 - 200 pcs',
        avgCostPerPiece: 2.77,
        estimatedResale: 18.00,
        stockCount: 10,
        isPreOrder: false,
        description: '',
        images: [],
      });
    }
  }, [editingProduct, categories]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.images.length === 0) {
      setError('Add at least one product image');
      setLoading(false);
      return;
    }

    try {
      const payload = { ...formData };

      if (editingProduct) {
        await ProductService.updateProduct(editingProduct.id, payload);
      } else {
        await ProductService.createProduct(payload);
      }

      onRefresh();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative text-card-foreground my-8">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-2">
          <FiX className="text-xl" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-muted text-foreground p-3 rounded-xl">
            <FiBox className="text-2xl" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-card-foreground">
              {editingProduct ? 'Edit Clothing Bale Product' : 'Add New Wholesale 50kg Clothing Bale'}
            </h3>
            <p className="text-xs text-muted-foreground">Specify bale weight, grade status, estimated piece counts, and pre-order state</p>
          </div>
        </div>

        {error && <div className="bg-rose-50 text-rose-700 p-3 rounded-xl text-xs mb-4 border border-rose-200">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-foreground font-semibold mb-1">Product Title</label>
            <input
              type="text"
              required
              placeholder="e.g. 50kg Women Mix Clothing Bale (Cream Grade)"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-muted border border-border rounded-xl p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-foreground font-semibold mb-1">Category</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full bg-muted border border-border rounded-xl p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-foreground font-semibold mb-1">Price (£)</label>
              <input
                type="tel"
                inputMode="decimal"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(sanitizeDecimal(e.target.value)) })}
                className="w-full bg-muted border border-border rounded-xl p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-foreground font-semibold mb-1">Bale Weight (KG)</label>
              <input
                type="tel"
                inputMode="decimal"
                value={formData.weightKg}
                onChange={(e) => setFormData({ ...formData, weightKg: Number(sanitizeDecimal(e.target.value)) })}
                className="w-full bg-muted border border-border rounded-xl p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>

            <div>
              <label className="block text-foreground font-semibold mb-1">Estimated Piece Count</label>
              <input
                type="text"
                placeholder="e.g. 160 - 200 pcs"
                value={formData.estimatedPieces}
                onChange={(e) => setFormData({ ...formData, estimatedPieces: e.target.value })}
                className="w-full bg-muted border border-border rounded-xl p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>

            <div>
              <label className="block text-foreground font-semibold mb-1">Stock Quantity</label>
              <input
                type="tel"
                inputMode="numeric"
                value={formData.stockCount}
                onChange={(e) => setFormData({ ...formData, stockCount: Number(sanitizeDigits(e.target.value)) })}
                className="w-full bg-muted border border-border rounded-xl p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-foreground font-semibold mb-1">Clothing Grade Status</label>
            <input
              type="text"
              placeholder="e.g. Cream Grade NWT (95% New with Tags)"
              value={formData.grade}
              onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
              className="w-full bg-muted border border-border rounded-xl p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />
          </div>

          <div className="flex items-center space-x-3 bg-muted p-3 rounded-xl border border-border">
            <input
              type="checkbox"
              id="preorder"
              checked={formData.isPreOrder}
              onChange={(e) => setFormData({ ...formData, isPreOrder: e.target.checked })}
              className="w-4 h-4 text-foreground rounded focus:ring-foreground/40"
            />
            <label htmlFor="preorder" className="text-xs text-foreground font-semibold cursor-pointer">
              Enable Pre-Order Mode (Item is currently awaiting container shipment)
            </label>
          </div>

          <ImageUploader
            images={formData.images}
            onChange={(images) => setFormData({ ...formData, images })}
          />

          <div>
            <label className="block text-foreground font-semibold mb-1">Product Description</label>
            <textarea
              rows={3}
              placeholder="Detailed wholesale contents description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-muted border border-border rounded-xl p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="bg-muted hover:bg-border text-foreground font-semibold px-5 py-2.5 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary hover:opacity-90 text-primary-foreground font-bold px-6 py-2.5 rounded-xl shadow transition"
            >
              {loading ? 'Saving Product...' : editingProduct ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

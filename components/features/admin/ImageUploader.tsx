'use client';

import React, { useState } from 'react';
import { FiUploadCloud, FiX, FiLink, FiLoader } from 'react-icons/fi';
import { uploadProductImage } from '@/lib/cloudinary-upload';

interface Props {
  images: string[];
  onChange: (images: string[]) => void;
}

export default function ImageUploader({ images, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [urlInput, setUrlInput] = useState('');

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError('');

    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadProductImage(file);
        uploaded.push(url);
      }
      onChange([...images, ...uploaded]);
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const addUrl = () => {
    if (!urlInput.trim()) return;
    onChange([...images, urlInput.trim()]);
    setUrlInput('');
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <label className="block text-foreground font-semibold mb-1">Product Images</label>

      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((src, i) => (
            <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Product ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-foreground/70 text-background p-1 rounded-md opacity-0 group-hover:opacity-100 transition"
              >
                <FiX className="text-xs" />
              </button>
            </div>
          ))}
        </div>
      )}

      <label className="flex items-center justify-center gap-2 border border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-brand-red transition text-muted-foreground hover:text-brand-red">
        {uploading ? <FiLoader className="animate-spin" /> : <FiUploadCloud />}
        <span className="text-xs font-semibold">
          {uploading ? 'Uploading & compressing...' : 'Upload image (auto-compressed to ~50KB)'}
        </span>
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          disabled={uploading}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>

      <div className="flex items-center gap-2">
        <FiLink className="text-muted-foreground shrink-0" />
        <input
          type="url"
          placeholder="...or paste an existing image URL"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          className="flex-1 bg-muted border border-border rounded-xl p-2.5 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-foreground/20"
        />
        <button
          type="button"
          onClick={addUrl}
          className="bg-muted hover:bg-border text-foreground font-semibold px-3 py-2.5 rounded-xl text-xs"
        >
          Add
        </button>
      </div>

      {error && <div className="bg-rose-50 text-rose-700 p-2.5 rounded-xl text-xs border border-rose-200">{error}</div>}
    </div>
  );
}

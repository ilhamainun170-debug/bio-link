'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Link as LinkIcon, Image as ImageIcon, Check } from 'lucide-react';
import { Category, LinkItem } from '@/lib/types';
import { useToast } from '@/components/ui/ToastContext';
import { useBiolink } from '@/context/BiolinkContext';

interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
  categories: Category[];
  initialData?: LinkItem | null;
}

export default function LinkModal({
  isOpen,
  onClose,
  onSaved,
  categories,
  initialData,
}: LinkModalProps) {
  const toast = useToast();
  const { addLink, updateLink } = useBiolink();
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [hasThumbnail, setHasThumbnail] = useState(false);
  const [thumbnailType, setThumbnailType] = useState<'upload' | 'url'>('url');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setUrl(initialData.url);
      setCategoryId(initialData.category_id || '');
      setHasThumbnail(!!initialData.thumbnail_url);
      setThumbnailUrl(initialData.thumbnail_url || '');
      setThumbnailType(initialData.thumbnail_url?.startsWith('http') ? 'url' : 'upload');
      setIsActive(initialData.is_active);
    } else {
      setTitle('');
      setUrl('');
      setCategoryId('');
      setHasThumbnail(false);
      setThumbnailUrl('');
      setThumbnailType('url');
      setIsActive(true);
    }
  }, [initialData, isOpen]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large', 'Max image size is 5MB.');
      return;
    }

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error('Upload failed', data.error || 'Could not upload thumbnail.');
        setUploadingFile(false);
        return;
      }

      setThumbnailUrl(data.url);
      toast.success('Thumbnail uploaded');
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Upload error', 'Please try entering an image URL instead.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Validation error', 'Link Title is required.');
      return;
    }

    if (!url.trim()) {
      toast.error('Validation error', 'Destination URL is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (initialData) {
        await updateLink(initialData.id, {
          title: title.trim(),
          url: url.trim(),
          category_id: categoryId || null,
          thumbnail_url: hasThumbnail && thumbnailUrl.trim() ? thumbnailUrl.trim() : null,
          is_active: isActive,
        });
        toast.success('Link updated', `"${title}" has been saved.`);
      } else {
        await addLink({
          title: title.trim(),
          url: url.trim(),
          category_id: categoryId || null,
          thumbnail_url: hasThumbnail && thumbnailUrl.trim() ? thumbnailUrl.trim() : null,
          is_active: isActive,
        });
        toast.success('Link created', `"${title}" has been added.`);
      }

      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.error('Error saving link:', err);
      toast.error('Error', 'Failed to save link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="relative z-10 w-full max-w-lg bg-white dark:bg-[#20222C] rounded-2xl shadow-dark-lg border border-gray-200 dark:border-[#2E3240] overflow-hidden my-auto max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-b border-gray-100 dark:border-[#2E3240] flex items-center justify-between shrink-0">
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
              {initialData ? 'Edit Link' : 'Add New Link'}
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Link Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. My Design Portfolio, Figma Kit"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-[#181A22] border border-gray-200 dark:border-[#2E3240] text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
              />
            </div>

            {/* URL */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Destination URL <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/my-page"
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-[#181A22] border border-gray-200 dark:border-[#2E3240] text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm font-mono"
                />
                <LinkIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Category Select */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Category (Optional)
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-[#181A22] border border-gray-200 dark:border-[#2E3240] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
              >
                <option value="">No Category (Standalone Link)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    📁 {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Thumbnail Toggle */}
            <div className="pt-2 border-t border-gray-100 dark:border-[#2E3240]/60">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    Add Thumbnail
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={hasThumbnail}
                  onChange={(e) => setHasThumbnail(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
              </label>

              {hasThumbnail && (
                <div className="mt-3 p-3.5 rounded-xl bg-gray-50 dark:bg-[#181A22] border border-gray-200 dark:border-[#2E3240] space-y-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setThumbnailType('url')}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        thumbnailType === 'url'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 dark:bg-[#2A2D3A] text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      Image URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setThumbnailType('upload')}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        thumbnailType === 'upload'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 dark:bg-[#2A2D3A] text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      Upload File
                    </button>
                  </div>

                  {thumbnailType === 'url' ? (
                    <input
                      type="url"
                      value={thumbnailUrl}
                      onChange={(e) => setThumbnailUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#20222C] border border-gray-200 dark:border-[#2E3240] text-gray-900 dark:text-gray-100 placeholder-gray-400 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        id="thumb-upload"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="thumb-upload"
                        className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-lg border border-dashed border-gray-300 dark:border-[#2E3240] bg-white dark:bg-[#20222C] hover:bg-gray-100 dark:hover:bg-[#272A36] text-gray-600 dark:text-gray-300 text-xs font-medium cursor-pointer transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingFile ? 'Uploading...' : 'Choose image from device'}</span>
                      </label>
                    </div>
                  )}

                  {thumbnailUrl && (
                    <div className="flex items-center gap-3 pt-1">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 dark:border-[#2E3240] bg-black/10 shrink-0">
                        <img src={thumbnailUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs text-gray-500 truncate flex-1">{thumbnailUrl}</span>
                      <button
                        type="button"
                        onClick={() => setThumbnailUrl('')}
                        className="text-xs text-rose-500 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Status Toggle */}
            <div className="pt-2 border-t border-gray-100 dark:border-[#2E3240]/60 flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Active Status</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Display this link on public page</p>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isActive ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-gray-100 dark:border-[#2E3240] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2A2D3A] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || uploadingFile}
                className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 transition-all shadow-soft-sm flex items-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>{initialData ? 'Update Link' : 'Save Link'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

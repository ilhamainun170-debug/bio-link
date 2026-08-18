'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Folder, Check } from 'lucide-react';
import { Category } from '@/lib/types';
import { useToast } from '@/components/ui/ToastContext';
import { useBiolink } from '@/context/BiolinkContext';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
  initialData?: Category | null;
}

export default function CategoryModal({
  isOpen,
  onClose,
  onSaved,
  initialData,
}: CategoryModalProps) {
  const toast = useToast();
  const { addCategory, updateCategory } = useBiolink();
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
    } else {
      setName('');
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Validation error', 'Category Name is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (initialData) {
        await updateCategory(initialData.id, { name: name.trim() });
        toast.success('Category updated', `"${name}" has been saved.`);
      } else {
        await addCategory(name.trim());
        toast.success('Category created', `"${name}" has been added.`);
      }

      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.error('Error saving category:', err);
      toast.error('Error', 'Failed to save category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
          className="relative z-10 w-full max-w-md bg-white dark:bg-[#20222C] rounded-2xl shadow-dark-lg border border-gray-200 dark:border-[#2E3240] overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 dark:border-[#2E3240] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Folder className="w-5 h-5 text-indigo-500" />
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
                {initialData ? 'Edit Category' : 'New Category'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Category Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. 🎨 Design Projects, 📚 Books & Notes"
                required
                autoFocus
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-[#181A22] border border-gray-200 dark:border-[#2E3240] text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
              />
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
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 transition-all shadow-soft-sm flex items-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>{initialData ? 'Update Category' : 'Create Category'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

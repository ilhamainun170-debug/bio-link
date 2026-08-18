'use client';

import React, { useState } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import CategoryModal from '@/components/admin/CategoryModal';
import ConfirmModal from '@/components/admin/ConfirmModal';
import {
  FolderTree,
  Plus,
  Pencil,
  Trash2,
  Folder,
  Link2,
} from 'lucide-react';
import { Category } from '@/lib/types';
import { useToast } from '@/components/ui/ToastContext';
import { useBiolink } from '@/context/BiolinkContext';

export default function CategoryManagementPage() {
  const toast = useToast();
  const { categories, toggleCategoryActive, deleteCategory, loading } = useBiolink();

  // Modals state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<(Category & { link_count: number }) | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggleActive = async (cat: Category) => {
    try {
      await toggleCategoryActive(cat.id);
      toast.info(
        cat.is_active
          ? `Category "${cat.name}" and its links hidden`
          : `Category "${cat.name}" restored`
      );
    } catch (err) {
      console.error('Failed to toggle category active state:', err);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;
    setIsDeleting(true);

    try {
      await deleteCategory(deletingCategory.id);
      toast.success(
        'Category removed',
        `"${deletingCategory.name}" was deleted. Links were converted to standalone.`
      );
      setDeletingCategory(null);
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Error', 'Failed to delete category.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Category Management"
        subtitle="Group your links into expandable accordion folders"
      />

      <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {categories.length} {categories.length === 1 ? 'category' : 'categories'} configured
          </p>

          <button
            onClick={() => {
              setEditingCategory(null);
              setIsCategoryModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-soft-sm hover:shadow-soft-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Category</span>
          </button>
        </div>

        {/* Categories Grid / List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-full p-12 text-center text-sm text-gray-500">
              Loading categories...
            </div>
          ) : categories.length === 0 ? (
            <div className="col-span-full p-12 text-center text-sm text-gray-400 bg-white dark:bg-[#20222C] rounded-2xl border border-gray-200 dark:border-[#2E3240]">
              No categories created yet. Click "+ New Category" to create your first accordion group!
            </div>
          ) : (
            categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white dark:bg-[#20222C] rounded-2xl p-5 border border-gray-200/90 dark:border-[#2E3240] shadow-soft-sm hover:shadow-soft-md transition-all duration-200 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-900/40 shrink-0">
                      <Folder className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">
                        {cat.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Link2 className="w-3 h-3" />
                          <span>{cat.link_count} {cat.link_count === 1 ? 'link' : 'links'} inside</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingCategory(cat);
                        setIsCategoryModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-[#2A2D3A] transition-colors"
                      title="Edit Category Name"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingCategory(cat)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Bottom status switch */}
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-[#2E3240]/60 flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Accordion Visibility
                  </span>
                  <button
                    onClick={() => handleToggleActive(cat)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                      cat.is_active
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        cat.is_active ? 'bg-emerald-500' : 'bg-gray-400'
                      }`}
                    />
                    <span>{cat.is_active ? 'Active' : 'Inactive'}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Category Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        initialData={editingCategory}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingCategory}
        title="Delete Category?"
        message={`Are you sure you want to delete "${deletingCategory?.name}"? The ${deletingCategory?.link_count || 0} links inside will NOT be deleted—they will automatically become standalone links.`}
        confirmLabel="Delete Category"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteCategory}
        onClose={() => setDeletingCategory(null)}
      />
    </div>
  );
}

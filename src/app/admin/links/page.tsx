'use client';

import React, { useState } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import LinkModal from '@/components/admin/LinkModal';
import ConfirmModal from '@/components/admin/ConfirmModal';
import {
  Link2,
  Plus,
  Search,
  Filter,
  Pencil,
  Trash2,
  ExternalLink,
  Eye,
} from 'lucide-react';
import { LinkItem } from '@/lib/types';
import { useToast } from '@/components/ui/ToastContext';
import ThumbnailLightbox from '@/components/public/ThumbnailLightbox';
import { useBiolink } from '@/context/BiolinkContext';

export default function LinkManagementPage() {
  const toast = useToast();
  const { links, categories, toggleLinkActive, deleteLink, loading } = useBiolink();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Modals state
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [deletingLink, setDeletingLink] = useState<LinkItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Lightbox preview
  const [previewThumbnail, setPreviewThumbnail] = useState<{ isOpen: boolean; url: string; title: string }>({
    isOpen: false,
    url: '',
    title: '',
  });

  const handleToggleActive = async (link: LinkItem) => {
    try {
      await toggleLinkActive(link.id);
      toast.info(link.is_active ? `"${link.title}" deactivated` : `"${link.title}" activated`);
    } catch (err) {
      console.error('Failed to toggle link active state:', err);
    }
  };

  const handleDeleteLink = async () => {
    if (!deletingLink) return;
    setIsDeleting(true);

    try {
      await deleteLink(deletingLink.id);
      toast.success('Link deleted', `"${deletingLink.title}" was removed.`);
      setDeletingLink(null);
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Error', 'Failed to delete link.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered links
  const filteredLinks = links.filter((l) => {
    const matchesSearch =
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.url.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat =
      selectedCategoryFilter === 'all'
        ? true
        : selectedCategoryFilter === 'standalone'
        ? !l.category_id
        : l.category_id === selectedCategoryFilter;

    return matchesSearch && matchesCat;
  });

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Link Management"
        subtitle="Create, edit, toggle status, and organize your individual biolinks"
      />

      <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 flex-1">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search links..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white dark:bg-[#20222C] border border-gray-200 dark:border-[#2E3240] text-gray-900 dark:text-gray-100 placeholder-gray-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-soft-sm"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <div className="relative w-full sm:w-56">
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="w-full pl-8 pr-3.5 py-2 rounded-xl bg-white dark:bg-[#20222C] border border-gray-200 dark:border-[#2E3240] text-gray-900 dark:text-gray-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-soft-sm appearance-none"
              >
                <option value="all">All Categories</option>
                <option value="standalone">Standalone Links</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    📁 {c.name}
                  </option>
                ))}
              </select>
              <Filter className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Add Link Button */}
          <button
            onClick={() => {
              setEditingLink(null);
              setIsLinkModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-soft-sm hover:shadow-soft-md transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Link</span>
          </button>
        </div>

        {/* Links List / Table */}
        <div className="bg-white dark:bg-[#20222C] rounded-2xl border border-gray-200/90 dark:border-[#2E3240] shadow-soft-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-sm text-gray-500">Loading links...</div>
          ) : filteredLinks.length === 0 ? (
            <div className="p-12 text-center text-sm text-gray-400">
              {searchQuery || selectedCategoryFilter !== 'all'
                ? 'No links match your search filter.'
                : 'No links created yet. Click "+ New Link" to add your first link!'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-[#181A22] border-b border-gray-100 dark:border-[#2E3240] text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider">
                  <tr>
                    <th className="py-3 px-4 sm:px-6">Link</th>
                    <th className="py-3 px-4 hidden md:table-cell">Category</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Clicks</th>
                    <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-[#2E3240]/60">
                  {filteredLinks.map((link) => {
                    const category = categories.find((c) => c.id === link.category_id);
                    return (
                      <tr
                        key={link.id}
                        className="hover:bg-gray-50/70 dark:hover:bg-[#272A36]/50 transition-colors"
                      >
                        {/* Thumbnail & Title */}
                        <td className="py-3.5 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            {link.thumbnail_url ? (
                              <div
                                onClick={() =>
                                  setPreviewThumbnail({
                                    isOpen: true,
                                    url: link.thumbnail_url!,
                                    title: link.title,
                                  })
                                }
                                title="View image"
                                className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-200 dark:border-[#2E3240] shrink-0 cursor-zoom-in group/img"
                              >
                                <img
                                  src={link.thumbnail_url}
                                  alt=""
                                  className="w-full h-full object-cover group-hover/img:scale-105 transition-transform"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white transition-opacity">
                                  <Eye className="w-3.5 h-3.5" />
                                </div>
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#181A22] flex items-center justify-center text-gray-400 border border-gray-200 dark:border-[#2E3240] shrink-0">
                                <Link2 className="w-4 h-4" />
                              </div>
                            )}

                            <div className="min-w-0 max-w-xs sm:max-w-md">
                              <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {link.title}
                              </p>
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-gray-400 dark:text-gray-500 hover:text-indigo-500 truncate flex items-center gap-1 mt-0.5"
                              >
                                <span className="truncate">{link.url}</span>
                                <ExternalLink className="w-3 h-3 shrink-0" />
                              </a>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4 hidden md:table-cell">
                          {category ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-900/40">
                              📁 {category.name}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">Standalone</span>
                          )}
                        </td>

                        {/* Status Switch */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleToggleActive(link)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                              link.is_active
                                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                link.is_active ? 'bg-emerald-500' : 'bg-gray-400'
                              }`}
                            />
                            <span>{link.is_active ? 'Active' : 'Inactive'}</span>
                          </button>
                        </td>

                        {/* Clicks */}
                        <td className="py-3.5 px-4 text-right font-bold text-gray-900 dark:text-gray-100">
                          {link.click_count || 0}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 sm:px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingLink(link);
                                setIsLinkModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-[#2A2D3A] transition-colors"
                              title="Edit Link"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingLink(link)}
                              className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                              title="Delete Link"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Link Modal (Create / Edit) */}
      <LinkModal
        isOpen={isLinkModalOpen}
        onClose={() => {
          setIsLinkModalOpen(false);
          setEditingLink(null);
        }}
        categories={categories}
        initialData={editingLink}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingLink}
        title="Delete Link?"
        message={`Are you sure you want to delete "${deletingLink?.title}"? This will permanently remove the link and its click history.`}
        confirmLabel="Delete"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteLink}
        onClose={() => setDeletingLink(null)}
      />

      {/* Lightbox Preview */}
      <ThumbnailLightbox
        isOpen={previewThumbnail.isOpen}
        imageUrl={previewThumbnail.url}
        title={previewThumbnail.title}
        onClose={() => setPreviewThumbnail((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import {
  GripVertical,
  Folder,
  Link2,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Reorder } from 'framer-motion';
import { useToast } from '@/components/ui/ToastContext';
import { clientStore } from '@/lib/clientStore';

interface OverviewItem {
  id: string;
  type: 'link' | 'category';
  title: string;
  isActive: boolean;
  url?: string;
  childCount?: number;
  thumbnail_url?: string | null;
}

export default function OverviewPage() {
  const toast = useToast();
  const [items, setItems] = useState<OverviewItem[]>([]);
  const [initialItems, setInitialItems] = useState<OverviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/overview/reorder');
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
        setInitialItems(data.items || []);
        setHasChanges(false);
      }
    } catch (err) {
      console.error('Error fetching overview items:', err);
      toast.error('Error', 'Could not load overview items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleReorder = (newItems: OverviewItem[]) => {
    setItems(newItems);
    setHasChanges(true);
  };

  const handleSaveOrder = async () => {
    setIsSaving(true);
    try {
      const payload = items.map((it) => ({ id: it.id, type: it.type }));
      const res = await fetch('/api/overview/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: payload }),
      });

      if (!res.ok) {
        toast.error('Save failed', 'Could not save new sequence.');
        setIsSaving(false);
        return;
      }

      // Sync master state to clientStore
      const syncRes = await fetch('/api/sync');
      if (syncRes.ok) {
        const sJson = await syncRes.json();
        if (sJson.data) clientStore.setLocalState(sJson.data);
      }

      toast.success('Order saved', 'Public biolink sequence updated successfully!');
      setInitialItems(items);
      setHasChanges(false);
    } catch (err) {
      console.error('Save order error:', err);
      toast.error('Error', 'Failed to communicate with server.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetOrder = () => {
    setItems(initialItems);
    setHasChanges(false);
    toast.info('Order reverted', 'Sequence reset to last saved state.');
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Overview & Reorder"
        subtitle="Drag and drop to customize the exact display order of links and categories"
      />

      <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-4xl w-full mx-auto">
        {/* Helper Banner & Save Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-[#20222C] p-4 sm:p-5 rounded-2xl border border-gray-200/90 dark:border-[#2E3240] shadow-soft-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-900/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-gray-100">
                Mixed Stream Hierarchy
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Drag using the handle (≡) to arrange standalone links and accordion folders in any order.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {hasChanges && (
              <button
                type="button"
                onClick={handleResetOrder}
                disabled={isSaving}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2A2D3A] transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Revert</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSaveOrder}
              disabled={!hasChanges || isSaving}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shadow-soft-sm ${
                hasChanges
                  ? 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white animate-pulse'
                  : 'bg-gray-200 dark:bg-[#2A2D3A] text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>{hasChanges ? 'Save Changes' : 'Saved'}</span>
            </button>
          </div>
        </div>

        {/* Reorderable List */}
        <div className="bg-white dark:bg-[#20222C] rounded-2xl p-4 sm:p-6 border border-gray-200/90 dark:border-[#2E3240] shadow-soft-sm">
          {loading ? (
            <div className="p-12 text-center text-sm text-gray-500">Loading items...</div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center text-sm text-gray-400">
              No links or categories found. Create links and categories in their respective menus first!
            </div>
          ) : (
            <Reorder.Group
              axis="y"
              values={items}
              onReorder={handleReorder}
              className="space-y-3 select-none"
            >
              {items.map((item, index) => (
                <Reorder.Item
                  key={item.id}
                  value={item}
                  className="rounded-xl focus:outline-none"
                  whileDrag={{
                    scale: 1.02,
                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.25)',
                    cursor: 'grabbing',
                  }}
                >
                  <div
                    className={`flex items-center justify-between p-3.5 sm:p-4 rounded-xl border transition-colors ${
                      item.type === 'category'
                        ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200/80 dark:border-indigo-900/50'
                        : 'bg-gray-50/70 dark:bg-[#181A22] border-gray-200 dark:border-[#2E3240]'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0 pr-3">
                      {/* Drag Handle */}
                      <div className="cursor-grab active:cursor-grabbing p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                        <GripVertical className="w-5 h-5" />
                      </div>

                      {/* Position Index Badge */}
                      <span className="w-6 h-6 rounded-md bg-white dark:bg-[#20222C] border border-gray-200 dark:border-[#2E3240] text-gray-500 font-mono text-xs flex items-center justify-center font-bold shrink-0">
                        {index + 1}
                      </span>

                      {/* Thumbnail or Folder Icon */}
                      {item.type === 'category' ? (
                        <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                          <Folder className="w-4 h-4" />
                        </div>
                      ) : item.thumbnail_url ? (
                        <img
                          src={item.thumbnail_url}
                          alt=""
                          className="w-9 h-9 rounded-lg object-cover border border-gray-200 dark:border-[#2E3240] shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-gray-200/80 dark:bg-[#2A2D3A] text-gray-500 flex items-center justify-center shrink-0">
                          <Link2 className="w-4 h-4" />
                        </div>
                      )}

                      {/* Title & Type Info */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100 truncate">
                            {item.title}
                          </p>
                          <span
                            className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded tracking-wide ${
                              item.type === 'category'
                                ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                                : 'bg-gray-200 dark:bg-[#2A2D3A] text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {item.type}
                          </span>
                        </div>

                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
                          {item.type === 'category'
                            ? `${item.childCount || 0} links inside accordion`
                            : item.url}
                        </p>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium shrink-0 ${
                        item.isActive
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.isActive ? 'bg-emerald-500' : 'bg-gray-400'
                        }`}
                      />
                      <span className="hidden sm:inline">
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </span>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          )}
        </div>
      </div>
    </div>
  );
}

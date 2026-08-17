'use client';

import React, { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import StatCard from '@/components/admin/StatCard';
import LinkModal from '@/components/admin/LinkModal';
import CategoryModal from '@/components/admin/CategoryModal';
import {
  Link2,
  CheckCircle2,
  XCircle,
  FolderTree,
  MousePointerClick,
  Calendar,
  Sparkles,
  Plus,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { AnalyticsSummary, Category, LinkItem } from '@/lib/types';
import { useToast } from '@/components/ui/ToastContext';

export default function AdminDashboardPage() {
  const toast = useToast();
  const [stats, setStats] = useState<AnalyticsSummary | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, linksRes, catsRes] = await Promise.all([
        fetch('/api/analytics'),
        fetch('/api/links'),
        fetch('/api/categories'),
      ]);

      if (analyticsRes.ok) {
        const aData = await analyticsRes.json();
        setStats(aData);
      }
      if (linksRes.ok) {
        const lData = await linksRes.json();
        setLinks(lData.links || []);
      }
      if (catsRes.ok) {
        const cData = await catsRes.json();
        setCategories(cData.categories || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      toast.error('Data error', 'Could not refresh dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleLinkActive = async (link: LinkItem) => {
    try {
      const res = await fetch('/api/links', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: link.id, is_active: !link.is_active }),
      });

      if (res.ok) {
        setLinks((prev) =>
          prev.map((l) => (l.id === link.id ? { ...l, is_active: !l.is_active } : l))
        );
        toast.info(link.is_active ? 'Link deactivated' : 'Link activated');
        fetchData();
      }
    } catch (err) {
      console.error('Failed to toggle link active state:', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Dashboard"
        subtitle="Quick overview and link performance summary"
      />

      <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Quick Actions Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-transparent p-4 sm:p-5 rounded-2xl border border-indigo-200/50 dark:border-indigo-900/30">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
              Welcome to your BioLink Hub
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Create, organize, and monitor your personal link ecosystem in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium bg-white dark:bg-[#20222C] hover:bg-gray-100 dark:hover:bg-[#2A2D3A] text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-[#2E3240] shadow-soft-sm transition-all"
            >
              <Plus className="w-4 h-4 text-indigo-500" />
              <span>New Category</span>
            </button>

            <button
              onClick={() => setIsLinkModalOpen(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-soft-sm hover:shadow-soft-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Link</span>
            </button>
          </div>
        </div>

        {/* 8 Metric KPI Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            label="Total Links"
            value={stats ? stats.totalLinks : links.length}
            icon={Link2}
            color="indigo"
            subtext="All configured links"
          />
          <StatCard
            label="Active Links"
            value={stats ? stats.totalActiveLinks : links.filter((l) => l.is_active).length}
            icon={CheckCircle2}
            color="emerald"
            subtext="Visible on biolink"
          />
          <StatCard
            label="Inactive Links"
            value={stats ? stats.totalInactiveLinks : links.filter((l) => !l.is_active).length}
            icon={XCircle}
            color="rose"
            subtext="Hidden from public"
          />
          <StatCard
            label="Categories"
            value={stats ? stats.totalCategories : categories.length}
            icon={FolderTree}
            color="violet"
            subtext="Folder groups"
          />

          <StatCard
            label="Total Clicks"
            value={stats ? stats.totalClicks : 0}
            icon={MousePointerClick}
            color="sky"
            subtext="Lifetime link hits"
          />
          <StatCard
            label="Clicks Today"
            value={stats ? stats.clicksToday : 0}
            icon={Calendar}
            color="amber"
            subtext="Last 24 hours"
          />
          <StatCard
            label="Clicks This Week"
            value={stats ? stats.clicksThisWeek : 0}
            icon={MousePointerClick}
            color="indigo"
            subtext="Past 7 days"
          />
          <StatCard
            label="Avg Clicks / Link"
            value={stats ? stats.avgClicksPerLink : 0}
            icon={Sparkles}
            color="emerald"
            subtext="Engagement ratio"
          />
        </div>

        {/* Quick Links Preview Table */}
        <div className="bg-white dark:bg-[#20222C] rounded-2xl border border-gray-200/90 dark:border-[#2E3240] shadow-soft-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-[#2E3240] flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                All Links Overview
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Quick-scan preview of all existing links & status
              </p>
            </div>
            <Link
              href="/admin/links"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-gray-500">Loading links...</div>
          ) : links.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">
              No links created yet. Click "+ New Link" to add your first one!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-[#181A22] border-b border-gray-100 dark:border-[#2E3240] text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider">
                  <tr>
                    <th className="py-3 px-4 sm:px-6">Link Title</th>
                    <th className="py-3 px-4 hidden md:table-cell">Category</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Clicks</th>
                    <th className="py-3 px-4 sm:px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-[#2E3240]/60">
                  {links.map((link) => {
                    const category = categories.find((c) => c.id === link.category_id);
                    return (
                      <tr
                        key={link.id}
                        className="hover:bg-gray-50/70 dark:hover:bg-[#272A36]/50 transition-colors"
                      >
                        {/* Title & URL */}
                        <td className="py-3.5 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            {link.thumbnail_url ? (
                              <img
                                src={link.thumbnail_url}
                                alt=""
                                className="w-8 h-8 rounded-lg object-cover border border-gray-200 dark:border-[#2E3240]"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#181A22] flex items-center justify-center text-gray-400 border border-gray-200 dark:border-[#2E3240]">
                                <Link2 className="w-4 h-4" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px] sm:max-w-xs">
                                {link.title}
                              </p>
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-gray-400 dark:text-gray-500 hover:text-indigo-500 truncate max-w-[200px] sm:max-w-xs flex items-center gap-1"
                              >
                                <span>{link.url}</span>
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

                        {/* Status Toggle */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleToggleLinkActive(link)}
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

                        {/* Click Count */}
                        <td className="py-3.5 px-4 text-right font-semibold text-gray-900 dark:text-gray-100">
                          {link.click_count || 0}
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-4 sm:px-6 text-right">
                          <Link
                            href="/admin/links"
                            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            Edit
                          </Link>
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

      {/* New Link Modal */}
      <LinkModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        onSaved={fetchData}
        categories={categories}
      />

      {/* New Category Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSaved={fetchData}
      />
    </div>
  );
}

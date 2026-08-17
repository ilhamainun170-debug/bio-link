'use client';

import React, { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import StatCard from '@/components/admin/StatCard';
import ConfirmModal from '@/components/admin/ConfirmModal';
import {
  MousePointerClick,
  Link2,
  Sparkles,
  TrendingUp,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { AnalyticsSummary } from '@/lib/types';
import { useToast } from '@/components/ui/ToastContext';

export default function AnalyticsPage() {
  const toast = useToast();
  const [range, setRange] = useState<number>(30);
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const fetchAnalytics = async (selectedRange = range) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/analytics?range=${selectedRange}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      toast.error('Fetch error', 'Could not load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(range);
  }, [range]);

  const handleResetAnalytics = async () => {
    setIsResetting(true);
    try {
      const res = await fetch('/api/analytics/reset', {
        method: 'POST',
      });

      if (!res.ok) {
        toast.error('Reset failed', 'Could not reset click history.');
        setIsResetting(false);
        return;
      }

      toast.success('Analytics reset', 'All click counters and history have been cleared.');
      setIsResetModalOpen(false);
      fetchAnalytics(range);
    } catch (err) {
      console.error('Reset error:', err);
      toast.error('Error', 'Failed to communicate with server.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Analytics"
        subtitle="Track visitor engagements, click trends, and top links"
      />

      <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Top Controls & Reset Action */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white dark:bg-[#20222C] border border-gray-200 dark:border-[#2E3240]">
            {[
              { label: '7 Days', val: 7 },
              { label: '30 Days', val: 30 },
              { label: '90 Days', val: 90 },
            ].map((opt) => (
              <button
                key={opt.val}
                onClick={() => setRange(opt.val)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  range === opt.val
                    ? 'bg-indigo-600 text-white shadow-soft-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsResetModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/70 border border-rose-200 dark:border-rose-900/50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Analytics</span>
          </button>
        </div>

        {/* 3 Main Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <StatCard
            label="Total Clicks"
            value={data ? data.totalClicks : 0}
            icon={MousePointerClick}
            color="indigo"
            subtext="All recorded link interactions"
          />
          <StatCard
            label="Total Links"
            value={data ? data.totalLinks : 0}
            icon={Link2}
            color="emerald"
            subtext="Available link items"
          />
          <StatCard
            label="Average Clicks per Link"
            value={data ? data.avgClicksPerLink : 0}
            icon={Sparkles}
            color="sky"
            subtext="Clicks / Total links ratio"
          />
        </div>

        {/* Chart: Clicks Over Time */}
        <div className="bg-white dark:bg-[#20222C] rounded-2xl p-5 sm:p-6 border border-gray-200/90 dark:border-[#2E3240] shadow-soft-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                <span>Clicks Over Time</span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Daily click traffic over the selected {range}-day period
              </p>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            {loading ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-400">
                Loading chart...
              </div>
            ) : !data || data.clicksOverTime.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-400">
                No click data available yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data.clicksOverTime}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="clickGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2E3240" opacity={0.3} vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#8E94A4"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => {
                      const parts = val.split('-');
                      return `${parts[1]}/${parts[2]}`;
                    }}
                  />
                  <YAxis
                    stroke="#8E94A4"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="p-2.5 rounded-xl bg-gray-900 text-white dark:bg-[#181A22] border border-gray-700 dark:border-[#2E3240] shadow-lg text-xs">
                            <p className="font-semibold text-gray-300">{label}</p>
                            <p className="text-indigo-400 font-bold mt-1">
                              {payload[0].value} {payload[0].value === 1 ? 'click' : 'clicks'}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="clicks"
                    stroke="#6366F1"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#clickGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Performing Links Leaderboard */}
        <div className="bg-white dark:bg-[#20222C] rounded-2xl p-5 sm:p-6 border border-gray-200/90 dark:border-[#2E3240] shadow-soft-sm">
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">
            Top Performing Links
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
            Links with highest click-through volume (Top 10)
          </p>

          {!data || data.topLinks.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-400">
              No link clicks recorded yet.
            </div>
          ) : (
            <div className="space-y-4">
              {data.topLinks.map((link, index) => (
                <div key={link.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-[#181A22] text-gray-500 flex items-center justify-center font-bold text-[11px] shrink-0">
                        {index + 1}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {link.title}
                      </span>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-gray-400 hover:text-indigo-500 shrink-0"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-gray-500 dark:text-gray-400 text-xs">
                        {link.percentage}%
                      </span>
                      <span className="font-bold text-gray-900 dark:text-gray-100">
                        {link.click_count} clicks
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 w-full bg-gray-100 dark:bg-[#181A22] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(link.percentage, 2)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Safety Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={isResetModalOpen}
        title="Reset All Analytics?"
        message="Are you sure you want to reset all click counters and event history? This action cannot be undone. Links and categories will NOT be deleted."
        confirmLabel="Yes, Reset Analytics"
        isDestructive={true}
        isLoading={isResetting}
        onConfirm={handleResetAnalytics}
        onClose={() => setIsResetModalOpen(false)}
      />
    </div>
  );
}

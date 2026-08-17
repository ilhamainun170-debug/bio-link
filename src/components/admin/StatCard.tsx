'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  subtext?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'indigo' | 'emerald' | 'amber' | 'sky' | 'rose' | 'violet';
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  subtext,
  color = 'indigo',
}: StatCardProps) {
  const colorStyles = {
    indigo: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200/60 dark:border-indigo-900/40',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-900/40',
    amber: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-900/40',
    sky: 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border-sky-200/60 dark:border-sky-900/40',
    rose: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-900/40',
    violet: 'bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border-violet-200/60 dark:border-violet-900/40',
  }[color];

  return (
    <div className="bg-white dark:bg-[#20222C] rounded-2xl p-4 sm:p-5 border border-gray-200/90 dark:border-[#2E3240] shadow-soft-sm hover:shadow-soft-md transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {label}
        </p>
        <div className={`p-2 rounded-xl border ${colorStyles}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3">
        <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
          {value}
        </p>
        {subtext && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}

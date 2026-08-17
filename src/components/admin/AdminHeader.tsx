'use client';

import React from 'react';
import { Menu, ExternalLink } from 'lucide-react';
import ThemeToggle from '@/components/public/ThemeToggle';
import Link from 'next/link';
import { useAdminSidebar } from './AdminSidebarContext';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  onToggleSidebar?: () => void;
}

export default function AdminHeader({ title, subtitle, onToggleSidebar }: AdminHeaderProps) {
  const sidebar = useAdminSidebar();
  const handleToggle = onToggleSidebar || sidebar.toggleSidebar;

  return (
    <header className="h-16 px-4 sm:px-6 md:px-8 bg-white/80 dark:bg-[#181A22]/80 border-b border-gray-200 dark:border-[#2E3240] flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          onClick={handleToggle}
          aria-label="Toggle Navigation Menu"
          className="lg:hidden p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#20222C] border border-gray-200 dark:border-[#2E3240]"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <Link
          href="/"
          target="_blank"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-gray-100 dark:bg-[#20222C] hover:bg-gray-200/80 dark:hover:bg-[#2A2D3A] border border-gray-200 dark:border-[#2E3240] transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Live Biolink</span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}

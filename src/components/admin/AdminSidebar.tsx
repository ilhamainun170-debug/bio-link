'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  BarChart3,
  Link2,
  FolderTree,
  ArrowUpDown,
  Palette,
  ExternalLink,
  LogOut,
  X,
} from 'lucide-react';
import { useToast } from '@/components/ui/ToastContext';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'Link Management', href: '/admin/links', icon: Link2 },
    { label: 'Category Management', href: '/admin/categories', icon: FolderTree },
    { label: 'Overview', href: '/admin/overview', icon: ArrowUpDown },
    { label: 'Customization', href: '/admin/customization', icon: Palette },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.info('Logged out', 'You have ended your admin session.');
      router.replace('/admin/login');
    } catch (err) {
      console.error('Logout error:', err);
      router.replace('/admin/login');
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-white dark:bg-[#181A22] border-r border-gray-200 dark:border-[#2E3240] flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Logo / Header */}
        <div>
          <div className="h-16 px-5 flex items-center justify-between border-b border-gray-100 dark:border-[#2E3240]">
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                B
              </div>
              <span className="font-bold text-base text-gray-900 dark:text-gray-100 tracking-tight">
                BioLink <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">Admin</span>
              </span>
            </Link>

            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onClose()}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-900/60 shadow-soft-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/70 dark:hover:bg-[#20222C] hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-gray-100 dark:border-[#2E3240] space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100/70 dark:hover:bg-[#20222C] hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            <div className="flex items-center gap-3">
              <ExternalLink className="w-4 h-4" />
              <span>Live Public Page</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200/70 dark:bg-[#2A2D3A] text-gray-500">
              Open
            </span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

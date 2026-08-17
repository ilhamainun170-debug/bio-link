'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { AdminSidebarProvider, useAdminSidebar } from '@/components/admin/AdminSidebarContext';

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, closeSidebar } = useAdminSidebar();

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#14161C] text-gray-900 dark:text-[#E8E8ED]">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
      />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setIsCheckingAuth(false);
      return;
    }

    // Verify session
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.replace('/admin/login');
        } else {
          setIsCheckingAuth(false);
        }
      })
      .catch(() => {
        router.replace('/admin/login');
      });
  }, [pathname, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] dark:bg-[#14161C]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-500 font-medium">Verifying admin session...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminSidebarProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminSidebarProvider>
  );
}

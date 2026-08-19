'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { AdminSidebarProvider, useAdminSidebar } from '@/components/admin/AdminSidebarContext';
import ClientStateSync from '@/components/admin/ClientStateSync';
import AdminPasswordGate from '@/components/admin/AdminPasswordGate';

function AdminLayoutInner({
  children,
  onLogout,
}: {
  children: React.ReactNode;
  onLogout: () => void;
}) {
  const { sidebarOpen, closeSidebar } = useAdminSidebar();

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#14161C] text-gray-900 dark:text-[#E8E8ED]">
      <ClientStateSync />
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        onLogout={onLogout}
      />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 1. Check if active session exists in sessionStorage
    const session = typeof window !== 'undefined' ? sessionStorage.getItem('tolvane_admin_session') : null;
    if (session === 'active') {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    setIsReady(true);

    // 2. Auto-expire session handler when refreshing (F5), closing tab, or leaving page
    const handleInboundExit = () => {
      sessionStorage.removeItem('tolvane_admin_session');
    };

    window.addEventListener('beforeunload', handleInboundExit);
    window.addEventListener('pagehide', handleInboundExit);

    return () => {
      window.removeEventListener('beforeunload', handleInboundExit);
      window.removeEventListener('pagehide', handleInboundExit);
    };
  }, []);

  // Loading state while checking sessionStorage
  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] dark:bg-[#14161C]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-500 font-medium">Checking admin security session...</p>
        </div>
      </div>
    );
  }

  // 3. Password Gate: If unauthenticated, render the password gate
  if (!isAuthenticated) {
    return <AdminPasswordGate onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  // 4. Authenticated: Render sidebar & admin content
  return (
    <AdminSidebarProvider>
      <AdminLayoutInner onLogout={() => setIsAuthenticated(false)}>
        {children}
      </AdminLayoutInner>
    </AdminSidebarProvider>
  );
}

'use client';

import React, { createContext, useContext, useState } from 'react';

interface SidebarContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  sidebarOpen: false,
  toggleSidebar: () => {},
  closeSidebar: () => {},
});

export function AdminSidebarProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <SidebarContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar: () => setSidebarOpen((prev) => !prev),
        closeSidebar: () => setSidebarOpen(false),
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export const useAdminSidebar = () => useContext(SidebarContext);

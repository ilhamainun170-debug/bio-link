'use client';

import { useEffect } from 'react';
import { clientStore } from '@/lib/clientStore';

export default function ClientStateSync() {
  useEffect(() => {
    // Run sync on mount when entering admin
    clientStore.syncWithServer().catch(() => {});
  }, []);

  return null;
}

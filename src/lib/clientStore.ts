import { DatabaseSchema } from './types';

const STORAGE_KEY = 'biolink_admin_master_v1';

export const clientStore = {
  getLocalState(): DatabaseSchema | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  setLocalState(data: DatabaseSchema): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.warn('Failed to save to localStorage:', err);
    }
  },

  async pushToServer(data: DatabaseSchema): Promise<boolean> {
    try {
      this.setLocalState(data);
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      });
      return res.ok;
    } catch (err) {
      console.error('Push to server error:', err);
      return false;
    }
  },

  async syncWithServer(): Promise<DatabaseSchema | null> {
    try {
      const res = await fetch('/api/sync');
      if (!res.ok) return this.getLocalState();

      const json = await res.json();
      const serverData: DatabaseSchema = json.data;
      const localData = this.getLocalState();

      // If localData has more recent/custom links than serverData (e.g. server had cold start), restore localData to server
      if (localData && (!serverData || JSON.stringify(serverData.profile) !== JSON.stringify(localData.profile) || serverData.links.length !== localData.links.length)) {
        const localTime = new Date(localData.profile.updated_at || 0).getTime();
        const serverTime = new Date(serverData.profile.updated_at || 0).getTime();

        if (localTime > serverTime) {
          await this.pushToServer(localData);
          return localData;
        }
      }

      if (serverData) {
        this.setLocalState(serverData);
      }
      return serverData;
    } catch (err) {
      console.warn('Sync warning:', err);
      return this.getLocalState();
    }
  },

  exportBackupJson(data: DatabaseSchema): void {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `biolink-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};

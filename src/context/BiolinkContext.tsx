'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DatabaseSchema, LinkItem, Category, Profile, SocialLinks, OverviewOrderItem, AnalyticsSummary } from '@/lib/types';
import { generateSeedData } from '@/lib/seed';
import { useToast } from '@/components/ui/ToastContext';

const STORAGE_KEY = 'biolink_master_db_v2';

interface BiolinkContextType {
  data: DatabaseSchema;
  loading: boolean;
  isCloudKV: boolean;
  // Computed helpers
  links: LinkItem[];
  categories: (Category & { link_count: number })[];
  profile: Profile;
  socials: SocialLinks;
  stats: AnalyticsSummary;
  overviewItems: Array<{
    id: string;
    type: 'link' | 'category';
    title: string;
    isActive: boolean;
    url?: string;
    childCount?: number;
    thumbnail_url?: string | null;
  }>;
  // Actions
  updateProfile: (profileUpdate: Partial<Profile>, socialsUpdate?: Partial<SocialLinks>) => Promise<boolean>;
  addLink: (linkData: { title: string; url: string; category_id?: string | null; thumbnail_url?: string | null; is_active?: boolean }) => Promise<boolean>;
  updateLink: (id: string, linkData: Partial<LinkItem>) => Promise<boolean>;
  deleteLink: (id: string) => Promise<boolean>;
  toggleLinkActive: (id: string) => Promise<boolean>;
  addCategory: (name: string) => Promise<boolean>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;
  toggleCategoryActive: (id: string) => Promise<boolean>;
  reorderOverview: (newOrder: { id: string; type: 'link' | 'category' }[]) => Promise<boolean>;
  resetAnalytics: () => Promise<boolean>;
  importDatabase: (newData: DatabaseSchema) => Promise<boolean>;
  exportDatabase: () => void;
  refreshData: () => Promise<void>;
}

const BiolinkContext = createContext<BiolinkContextType | undefined>(undefined);

function calculateStats(data: DatabaseSchema, daysRange = 30): AnalyticsSummary {
  const now = new Date();
  const totalClicks = data.links.reduce((acc, l) => acc + (l.click_count || 0), 0);
  const totalLinks = data.links.length;
  const totalActiveLinks = data.links.filter((l) => l.is_active).length;
  const totalInactiveLinks = totalLinks - totalActiveLinks;
  const totalCategories = data.categories.length;
  const avgClicksPerLink = totalLinks > 0 ? parseFloat((totalClicks / totalLinks).toFixed(1)) : 0;

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).getTime();

  let clicksToday = 0;
  let clicksThisWeek = 0;
  let clicksThisMonth = 0;

  (data.click_events || []).forEach((e) => {
    const time = new Date(e.timestamp).getTime();
    if (time >= startOfToday) clicksToday++;
    if (time >= sevenDaysAgo) clicksThisWeek++;
    if (time >= thirtyDaysAgo) clicksThisMonth++;
  });

  const sortedLinksByDate = [...data.links].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const mostRecentLink = sortedLinksByDate[0] || null;

  const sortedByClicks = [...data.links].sort((a, b) => (b.click_count || 0) - (a.click_count || 0));
  const topLinks = sortedByClicks.slice(0, 10).map((l) => ({
    ...l,
    percentage: totalClicks > 0 ? Math.round(((l.click_count || 0) / totalClicks) * 100) : 0,
  }));

  const rangeDays = Math.min(Math.max(daysRange, 7), 90);
  const dateMap = new Map<string, number>();

  for (let i = rangeDays - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    dateMap.set(dateStr, 0);
  }

  const rangeStartTime = new Date(now.getTime() - rangeDays * 24 * 60 * 60 * 1000).getTime();

  (data.click_events || []).forEach((e) => {
    const time = new Date(e.timestamp).getTime();
    if (time >= rangeStartTime) {
      const dateStr = e.timestamp.split('T')[0];
      if (dateMap.has(dateStr)) {
        dateMap.set(dateStr, (dateMap.get(dateStr) || 0) + 1);
      }
    }
  });

  const clicksOverTime = Array.from(dateMap.entries()).map(([date, clicks]) => ({
    date,
    clicks,
  }));

  return {
    totalClicks,
    totalLinks,
    totalActiveLinks,
    totalInactiveLinks,
    totalCategories,
    avgClicksPerLink,
    clicksToday,
    clicksThisWeek,
    clicksThisMonth,
    mostRecentLink,
    topLinks,
    clicksOverTime,
  };
}

function computeOverviewItems(data: DatabaseSchema) {
  const { categories, links, overview_order } = data;
  const standaloneLinks = links.filter((l) => !l.category_id);
  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const linkMap = new Map(standaloneLinks.map((l) => [l.id, l]));

  const items: Array<{
    id: string;
    type: 'link' | 'category';
    title: string;
    isActive: boolean;
    url?: string;
    childCount?: number;
    thumbnail_url?: string | null;
  }> = [];

  const processed = new Set<string>();
  const ordered = [...(overview_order || [])].sort((a, b) => a.sort_order - b.sort_order);

  ordered.forEach((ord) => {
    if (ord.type === 'link' && linkMap.has(ord.id)) {
      const l = linkMap.get(ord.id)!;
      items.push({
        id: l.id,
        type: 'link',
        title: l.title,
        url: l.url,
        isActive: l.is_active,
        thumbnail_url: l.thumbnail_url,
      });
      processed.add(`link-${l.id}`);
    } else if (ord.type === 'category' && categoryMap.has(ord.id)) {
      const c = categoryMap.get(ord.id)!;
      const childCount = links.filter((l) => l.category_id === c.id).length;
      items.push({
        id: c.id,
        type: 'category',
        title: c.name,
        isActive: c.is_active,
        childCount,
      });
      processed.add(`cat-${c.id}`);
    }
  });

  standaloneLinks.forEach((l) => {
    if (!processed.has(`link-${l.id}`)) {
      items.push({
        id: l.id,
        type: 'link',
        title: l.title,
        url: l.url,
        isActive: l.is_active,
        thumbnail_url: l.thumbnail_url,
      });
      processed.add(`link-${l.id}`);
    }
  });

  categories.forEach((c) => {
    if (!processed.has(`cat-${c.id}`)) {
      const childCount = links.filter((l) => l.category_id === c.id).length;
      items.push({
        id: c.id,
        type: 'category',
        title: c.name,
        isActive: c.is_active,
        childCount,
      });
      processed.add(`cat-${c.id}`);
    }
  });

  return items;
}

export function BiolinkProvider({ children }: { children: React.ReactNode }) {
  const toast = useToast();
  const [data, setData] = useState<DatabaseSchema>(() => generateSeedData());
  const [loading, setLoading] = useState(true);
  const [isCloudKV, setIsCloudKV] = useState(false);

  // Sync to localStorage and server
  const persistState = useCallback(async (nextState: DatabaseSchema) => {
    setData(nextState);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
      } catch (err) {
        console.warn('LocalStorage save failed:', err);
      }
    }

    // Push to server in background
    try {
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: nextState }),
      });
    } catch (err) {
      console.warn('Server sync error:', err);
    }
  }, []);

  // Initial load
  const loadInitialData = useCallback(async () => {
    setLoading(true);

    // 1. Check local storage first
    let localSaved: DatabaseSchema | null = null;
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          localSaved = JSON.parse(raw);
          if (localSaved && localSaved.profile && Array.isArray(localSaved.links)) {
            setData(localSaved);
          }
        }
      } catch (e) {
        console.warn('Local parse error:', e);
      }
    }

    // 2. Fetch server database
    try {
      const res = await fetch('/api/sync');
      if (res.ok) {
        const json = await res.json();
        setIsCloudKV(json.isCloudKV || false);
        const serverData: DatabaseSchema = json.data;

        if (serverData && serverData.links) {
          // If local storage has user edits and server has fresh seed, push local to server
          if (localSaved && localSaved.profile && JSON.stringify(localSaved.links) !== JSON.stringify(serverData.links)) {
            // Keep localSaved and sync to server
            await fetch('/api/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ data: localSaved }),
            });
          } else {
            setData(serverData);
            if (typeof window !== 'undefined') {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(serverData));
            }
          }
        }
      }
    } catch (err) {
      console.warn('Initial sync error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Actions
  const updateProfile = async (profileUpdate: Partial<Profile>, socialsUpdate?: Partial<SocialLinks>) => {
    const nextState: DatabaseSchema = {
      ...data,
      profile: {
        ...data.profile,
        ...profileUpdate,
        updated_at: new Date().toISOString(),
      },
      socials: socialsUpdate ? { ...data.socials, ...socialsUpdate } : data.socials,
    };
    await persistState(nextState);
    return true;
  };

  const addLink = async (linkData: {
    title: string;
    url: string;
    category_id?: string | null;
    thumbnail_url?: string | null;
    is_active?: boolean;
  }) => {
    const now = new Date().toISOString();
    const id = `link-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    let formattedUrl = linkData.url.trim();
    if (!/^https?:\/\//i.test(formattedUrl) && !/^mailto:/i.test(formattedUrl) && !/^tel:/i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const sameCatLinks = data.links.filter((l) => l.category_id === (linkData.category_id || null));
    const newLink: LinkItem = {
      id,
      title: linkData.title.trim(),
      url: formattedUrl,
      category_id: linkData.category_id || null,
      thumbnail_url: linkData.thumbnail_url?.trim() || null,
      is_active: linkData.is_active !== undefined ? linkData.is_active : true,
      sort_order: sameCatLinks.length,
      click_count: 0,
      created_at: now,
      updated_at: now,
    };

    const nextLinks = [...data.links, newLink];
    const nextOverviewOrder = [...(data.overview_order || [])];

    if (!newLink.category_id) {
      const maxOrder = nextOverviewOrder.reduce((max, it) => Math.max(max, it.sort_order), -1);
      nextOverviewOrder.push({ type: 'link', id: newLink.id, sort_order: maxOrder + 1 });
    }

    const nextState: DatabaseSchema = {
      ...data,
      links: nextLinks,
      overview_order: nextOverviewOrder,
    };

    await persistState(nextState);
    return true;
  };

  const updateLink = async (id: string, updates: Partial<LinkItem>) => {
    const index = data.links.findIndex((l) => l.id === id);
    if (index === -1) return false;

    const prev = data.links[index];
    const prevCat = prev.category_id;
    const nextCat = updates.category_id !== undefined ? (updates.category_id || null) : prevCat;

    let formattedUrl = updates.url;
    if (updates.url && typeof updates.url === 'string') {
      const trimmed = updates.url.trim();
      if (!/^https?:\/\//i.test(trimmed) && !/^mailto:/i.test(trimmed) && !/^tel:/i.test(trimmed)) {
        formattedUrl = `https://${trimmed}`;
      } else {
        formattedUrl = trimmed;
      }
    }

    const updatedLink: LinkItem = {
      ...prev,
      ...updates,
      url: formattedUrl || prev.url,
      category_id: nextCat,
      updated_at: new Date().toISOString(),
    };

    const nextLinks = [...data.links];
    nextLinks[index] = updatedLink;

    let nextOverview = [...(data.overview_order || [])];
    if (prevCat && !nextCat) {
      const exists = nextOverview.some((o) => o.id === id && o.type === 'link');
      if (!exists) {
        const maxOrder = nextOverview.reduce((max, it) => Math.max(max, it.sort_order), -1);
        nextOverview.push({ type: 'link', id, sort_order: maxOrder + 1 });
      }
    } else if (!prevCat && nextCat) {
      nextOverview = nextOverview.filter((o) => !(o.type === 'link' && o.id === id));
    }

    const nextState: DatabaseSchema = {
      ...data,
      links: nextLinks,
      overview_order: nextOverview,
    };

    await persistState(nextState);
    return true;
  };

  const deleteLink = async (id: string) => {
    const nextLinks = data.links.filter((l) => l.id !== id);
    const nextOverview = (data.overview_order || []).filter((o) => !(o.type === 'link' && o.id === id));
    const nextClicks = (data.click_events || []).filter((e) => e.link_id !== id);

    const nextState: DatabaseSchema = {
      ...data,
      links: nextLinks,
      overview_order: nextOverview,
      click_events: nextClicks,
    };

    await persistState(nextState);
    return true;
  };

  const toggleLinkActive = async (id: string) => {
    const link = data.links.find((l) => l.id === id);
    if (!link) return false;
    return updateLink(id, { is_active: !link.is_active });
  };

  const addCategory = async (name: string) => {
    const now = new Date().toISOString();
    const id = `cat-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newCat: Category = {
      id,
      name: name.trim(),
      is_active: true,
      sort_order: data.categories.length,
      created_at: now,
    };

    const nextCats = [...data.categories, newCat];
    const nextOverview = [...(data.overview_order || [])];
    const maxOrder = nextOverview.reduce((max, it) => Math.max(max, it.sort_order), -1);
    nextOverview.push({ type: 'category', id: newCat.id, sort_order: maxOrder + 1 });

    const nextState: DatabaseSchema = {
      ...data,
      categories: nextCats,
      overview_order: nextOverview,
    };

    await persistState(nextState);
    return true;
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    const nextCats = data.categories.map((c) => (c.id === id ? { ...c, ...updates } : c));
    const nextState: DatabaseSchema = {
      ...data,
      categories: nextCats,
    };
    await persistState(nextState);
    return true;
  };

  const deleteCategory = async (id: string) => {
    const nextCats = data.categories.filter((c) => c.id !== id);
    const nextOverview = (data.overview_order || []).filter((o) => !(o.type === 'category' && o.id === id));

    // Convert child links to standalone
    const nextLinks = data.links.map((link) => {
      if (link.category_id === id) {
        return { ...link, category_id: null };
      }
      return link;
    });

    // Add orphaned links to overview
    nextLinks.forEach((link) => {
      if (link.category_id === null) {
        const exists = nextOverview.some((o) => o.id === link.id && o.type === 'link');
        if (!exists) {
          const maxOrder = nextOverview.reduce((max, it) => Math.max(max, it.sort_order), -1);
          nextOverview.push({ type: 'link', id: link.id, sort_order: maxOrder + 1 });
        }
      }
    });

    const nextState: DatabaseSchema = {
      ...data,
      categories: nextCats,
      links: nextLinks,
      overview_order: nextOverview,
    };

    await persistState(nextState);
    return true;
  };

  const toggleCategoryActive = async (id: string) => {
    const cat = data.categories.find((c) => c.id === id);
    if (!cat) return false;
    return updateCategory(id, { is_active: !cat.is_active });
  };

  const reorderOverview = async (newOrder: { id: string; type: 'link' | 'category' }[]) => {
    const nextOverview: OverviewOrderItem[] = newOrder.map((item, index) => ({
      id: item.id,
      type: item.type,
      sort_order: index,
    }));

    const nextState: DatabaseSchema = {
      ...data,
      overview_order: nextOverview,
    };

    await persistState(nextState);
    return true;
  };

  const resetAnalytics = async () => {
    const nextLinks = data.links.map((l) => ({ ...l, click_count: 0 }));
    const nextState: DatabaseSchema = {
      ...data,
      links: nextLinks,
      click_events: [],
    };

    await persistState(nextState);
    return true;
  };

  const importDatabase = async (newData: DatabaseSchema) => {
    if (!newData.profile || !Array.isArray(newData.links) || !Array.isArray(newData.categories)) {
      return false;
    }
    await persistState(newData);
    return true;
  };

  const exportDatabase = () => {
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
  };

  // Computed values
  const categoriesWithCounts = data.categories.map((cat) => ({
    ...cat,
    link_count: data.links.filter((l) => l.category_id === cat.id).length,
  }));

  const stats = calculateStats(data);
  const overviewItems = computeOverviewItems(data);

  return (
    <BiolinkContext.Provider
      value={{
        data,
        loading,
        isCloudKV,
        links: data.links,
        categories: categoriesWithCounts,
        profile: data.profile,
        socials: data.socials,
        stats,
        overviewItems,
        updateProfile,
        addLink,
        updateLink,
        deleteLink,
        toggleLinkActive,
        addCategory,
        updateCategory,
        deleteCategory,
        toggleCategoryActive,
        reorderOverview,
        resetAnalytics,
        importDatabase,
        exportDatabase,
        refreshData: loadInitialData,
      }}
    >
      {children}
    </BiolinkContext.Provider>
  );
}

export function useBiolink() {
  const context = useContext(BiolinkContext);
  if (!context) {
    throw new Error('useBiolink must be used within a BiolinkProvider');
  }
  return context;
}

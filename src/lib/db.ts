import fs from 'fs';
import path from 'path';
import { DatabaseSchema, LinkItem, Category, Profile, SocialLinks, OverviewOrderItem, AnalyticsSummary, ClickEvent } from './types';
import { generateSeedData } from './seed';

const DATA_DIR = process.env.VERCEL
  ? path.join('/tmp', 'data')
  : path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Memory cache
let memoryDb: DatabaseSchema | null = null;

// Helper to check if KV / Redis is available
export function isKVConfigured(): boolean {
  return !!(
    (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) ||
    (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  );
}

// Sync to Upstash / Vercel KV if configured
export async function syncToKV(data: DatabaseSchema): Promise<void> {
  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (kvUrl && kvToken) {
    try {
      await fetch(`${kvUrl}/set/biolink_data`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${kvToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } catch (err) {
      console.warn('KV sync warning:', err);
    }
  }
}

// Fetch from Upstash / Vercel KV
export async function fetchFromKV(): Promise<DatabaseSchema | null> {
  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (kvUrl && kvToken) {
    try {
      const res = await fetch(`${kvUrl}/get/biolink_data`, {
        headers: {
          Authorization: `Bearer ${kvToken}`,
        },
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.result) {
          const parsed = typeof json.result === 'string' ? JSON.parse(json.result) : json.result;
          if (parsed && parsed.links) {
            memoryDb = parsed;
            try {
              if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
              fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
            } catch {}
            return parsed;
          }
        }
      }
    } catch (err) {
      console.warn('KV fetch error:', err);
    }
  }
  return null;
}

function ensureDbFile(): DatabaseSchema {
  // Always try to read from disk first to guarantee fresh data across processes
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      memoryDb = parsed;
      return parsed;
    }
  } catch (err) {
    console.error('Error reading DB file:', err);
  }

  // If memory cache exists and has valid data, use it
  if (memoryDb && memoryDb.links) {
    return memoryDb;
  }

  // Initialize with seed data
  const seed = generateSeedData();
  saveDb(seed);
  memoryDb = seed;
  return seed;
}

function saveDb(data: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    memoryDb = data;
  } catch (err) {
    console.error('Error saving DB file:', err);
  }

  // Non-blocking sync to cloud KV if available
  syncToKV(data).catch(() => {});
}

export const db = {
  get(): DatabaseSchema {
    return ensureDbFile();
  },

  save(data: DatabaseSchema): void {
    saveDb(data);
  },

  // Bulk replace (for restore or client state sync)
  bulkSync(data: DatabaseSchema): void {
    saveDb(data);
  },

  // Profile & Socials
  getProfile(): { profile: Profile; socials: SocialLinks } {
    const data = this.get();
    return { profile: data.profile, socials: data.socials };
  },

  updateProfile(profileUpdate: Partial<Profile>, socialsUpdate?: Partial<SocialLinks>): { profile: Profile; socials: SocialLinks } {
    const data = this.get();
    data.profile = {
      ...data.profile,
      ...profileUpdate,
      updated_at: new Date().toISOString(),
    };
    if (socialsUpdate) {
      data.socials = {
        ...data.socials,
        ...socialsUpdate,
      };
    }
    this.save(data);
    return { profile: data.profile, socials: data.socials };
  },

  // Public visitor view with effective active states & mixed order
  getPublicView() {
    const data = this.get();
    const { profile, socials, categories, links, overview_order } = data;

    // Active categories map
    const activeCategoryMap = new Map<string, Category>();
    categories.forEach(cat => {
      if (cat.is_active) {
        activeCategoryMap.set(cat.id, cat);
      }
    });

    // Compute effective active state for links
    const effectiveActiveLinks = links.filter(link => {
      if (!link.is_active) return false;
      if (link.category_id) {
        const cat = categories.find(c => c.id === link.category_id);
        if (!cat || !cat.is_active) return false;
      }
      return true;
    });

    // Group active links by category
    const categoryLinksMap = new Map<string, LinkItem[]>();
    const standaloneLinks: LinkItem[] = [];

    effectiveActiveLinks.forEach(link => {
      if (link.category_id && activeCategoryMap.has(link.category_id)) {
        const list = categoryLinksMap.get(link.category_id) || [];
        list.push(link);
        categoryLinksMap.set(link.category_id, list);
      } else if (!link.category_id) {
        standaloneLinks.push(link);
      }
    });

    // Sort category inner links by sort_order
    categoryLinksMap.forEach((list) => {
      list.sort((a, b) => a.sort_order - b.sort_order);
    });

    type MixedItem =
      | { type: 'link'; data: LinkItem }
      | { type: 'category'; data: Category; links: LinkItem[] };

    const mixedStream: MixedItem[] = [];
    const processedIds = new Set<string>();

    const orderedItems = [...(overview_order || [])].sort((a, b) => a.sort_order - b.sort_order);

    orderedItems.forEach(item => {
      if (item.type === 'link') {
        const link = standaloneLinks.find(l => l.id === item.id);
        if (link && !processedIds.has(`link-${link.id}`)) {
          mixedStream.push({ type: 'link', data: link });
          processedIds.add(`link-${link.id}`);
        }
      } else if (item.type === 'category') {
        const cat = activeCategoryMap.get(item.id);
        if (cat && !processedIds.has(`cat-${cat.id}`)) {
          const linksInCat = categoryLinksMap.get(cat.id) || [];
          mixedStream.push({ type: 'category', data: cat, links: linksInCat });
          processedIds.add(`cat-${cat.id}`);
        }
      }
    });

    // Append any standalone links or active categories that were not yet in overview_order
    standaloneLinks.forEach(link => {
      if (!processedIds.has(`link-${link.id}`)) {
        mixedStream.push({ type: 'link', data: link });
        processedIds.add(`link-${link.id}`);
      }
    });

    activeCategoryMap.forEach((cat) => {
      if (!processedIds.has(`cat-${cat.id}`)) {
        const linksInCat = categoryLinksMap.get(cat.id) || [];
        mixedStream.push({ type: 'category', data: cat, links: linksInCat });
        processedIds.add(`cat-${cat.id}`);
      }
    });

    return {
      profile,
      socials,
      items: mixedStream,
    };
  },

  // Links CRUD
  getLinks(): LinkItem[] {
    const data = this.get();
    return data.links.sort((a, b) => a.sort_order - b.sort_order);
  },

  createLink(newLinkData: Omit<LinkItem, 'id' | 'click_count' | 'created_at' | 'updated_at' | 'sort_order'>): LinkItem {
    const data = this.get();
    const now = new Date().toISOString();
    const id = `link-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    const sameCategoryLinks = data.links.filter(l => l.category_id === (newLinkData.category_id || null));
    const sort_order = sameCategoryLinks.length;

    const link: LinkItem = {
      ...newLinkData,
      id,
      category_id: newLinkData.category_id || null,
      thumbnail_url: newLinkData.thumbnail_url || null,
      sort_order,
      click_count: 0,
      created_at: now,
      updated_at: now,
    };

    data.links.push(link);

    // If standalone link, also add to overview order at the bottom
    if (!link.category_id) {
      const maxOrder = data.overview_order.reduce((max, it) => Math.max(max, it.sort_order), -1);
      data.overview_order.push({
        type: 'link',
        id: link.id,
        sort_order: maxOrder + 1,
      });
    }

    this.save(data);
    return link;
  },

  updateLink(id: string, updates: Partial<LinkItem>): LinkItem | null {
    const data = this.get();
    const index = data.links.findIndex(l => l.id === id);
    if (index === -1) return null;

    const prevCategoryId = data.links[index].category_id;
    const nextCategoryId = updates.category_id !== undefined ? (updates.category_id || null) : prevCategoryId;

    data.links[index] = {
      ...data.links[index],
      ...updates,
      category_id: nextCategoryId,
      updated_at: new Date().toISOString(),
    };

    if (prevCategoryId && !nextCategoryId) {
      const existsInOverview = data.overview_order.some(o => o.id === id && o.type === 'link');
      if (!existsInOverview) {
        const maxOrder = data.overview_order.reduce((max, it) => Math.max(max, it.sort_order), -1);
        data.overview_order.push({ type: 'link', id, sort_order: maxOrder + 1 });
      }
    } else if (!prevCategoryId && nextCategoryId) {
      data.overview_order = data.overview_order.filter(o => !(o.type === 'link' && o.id === id));
    }

    this.save(data);
    return data.links[index];
  },

  deleteLink(id: string): boolean {
    const data = this.get();
    const index = data.links.findIndex(l => l.id === id);
    if (index === -1) return false;

    data.links.splice(index, 1);
    data.overview_order = data.overview_order.filter(o => !(o.type === 'link' && o.id === id));
    data.click_events = data.click_events.filter(e => e.link_id !== id);

    this.save(data);
    return true;
  },

  // Categories CRUD
  getCategories(): (Category & { link_count: number })[] {
    const data = this.get();
    return data.categories
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(cat => ({
        ...cat,
        link_count: data.links.filter(l => l.category_id === cat.id).length,
      }));
  },

  createCategory(name: string): Category {
    const data = this.get();
    const now = new Date().toISOString();
    const id = `cat-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const sort_order = data.categories.length;

    const cat: Category = {
      id,
      name,
      is_active: true,
      sort_order,
      created_at: now,
    };

    data.categories.push(cat);

    const maxOrder = data.overview_order.reduce((max, it) => Math.max(max, it.sort_order), -1);
    data.overview_order.push({
      type: 'category',
      id: cat.id,
      sort_order: maxOrder + 1,
    });

    this.save(data);
    return cat;
  },

  updateCategory(id: string, updates: Partial<Category>): Category | null {
    const data = this.get();
    const index = data.categories.findIndex(c => c.id === id);
    if (index === -1) return null;

    data.categories[index] = {
      ...data.categories[index],
      ...updates,
    };

    this.save(data);
    return data.categories[index];
  },

  deleteCategory(id: string): boolean {
    const data = this.get();
    const index = data.categories.findIndex(c => c.id === id);
    if (index === -1) return false;

    data.categories.splice(index, 1);

    data.links.forEach(link => {
      if (link.category_id === id) {
        link.category_id = null;
        const existsInOverview = data.overview_order.some(o => o.id === link.id && o.type === 'link');
        if (!existsInOverview) {
          const maxOrder = data.overview_order.reduce((max, it) => Math.max(max, it.sort_order), -1);
          data.overview_order.push({ type: 'link', id: link.id, sort_order: maxOrder + 1 });
        }
      }
    });

    data.overview_order = data.overview_order.filter(o => !(o.type === 'category' && o.id === id));

    this.save(data);
    return true;
  },

  // Overview Mixed Drag & Drop Reorder
  getOverviewItems() {
    const data = this.get();
    const { categories, links, overview_order } = data;

    const standaloneLinks = links.filter(l => !l.category_id);
    const categoryMap = new Map(categories.map(c => [c.id, c]));
    const linkMap = new Map(standaloneLinks.map(l => [l.id, l]));

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

    ordered.forEach(ord => {
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
        const childCount = links.filter(l => l.category_id === c.id).length;
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

    standaloneLinks.forEach(l => {
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

    categories.forEach(c => {
      if (!processed.has(`cat-${c.id}`)) {
        const childCount = links.filter(l => l.category_id === c.id).length;
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
  },

  updateOverviewOrder(newOrder: { id: string; type: 'link' | 'category' }[]): void {
    const data = this.get();
    data.overview_order = newOrder.map((item, index) => ({
      id: item.id,
      type: item.type,
      sort_order: index,
    }));
    this.save(data);
  },

  // Click Tracking & Analytics
  trackClick(linkId: string, info?: { referrer?: string; user_agent?: string }): boolean {
    const data = this.get();
    const link = data.links.find(l => l.id === linkId);
    if (!link) return false;

    link.click_count = (link.click_count || 0) + 1;
    link.updated_at = new Date().toISOString();

    const event: ClickEvent = {
      id: `clk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      link_id: linkId,
      timestamp: new Date().toISOString(),
      referrer: info?.referrer,
      user_agent: info?.user_agent,
    };

    data.click_events.push(event);
    this.save(data);
    return true;
  },

  getAnalytics(daysRange = 30): AnalyticsSummary {
    const data = this.get();
    const now = new Date();
    const totalClicks = data.links.reduce((acc, l) => acc + (l.click_count || 0), 0);
    const totalLinks = data.links.length;
    const totalActiveLinks = data.links.filter(l => l.is_active).length;
    const totalInactiveLinks = totalLinks - totalActiveLinks;
    const totalCategories = data.categories.length;
    const avgClicksPerLink = totalLinks > 0 ? parseFloat((totalClicks / totalLinks).toFixed(1)) : 0;

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).getTime();

    let clicksToday = 0;
    let clicksThisWeek = 0;
    let clicksThisMonth = 0;

    data.click_events.forEach(e => {
      const time = new Date(e.timestamp).getTime();
      if (time >= startOfToday) clicksToday++;
      if (time >= sevenDaysAgo) clicksThisWeek++;
      if (time >= thirtyDaysAgo) clicksThisMonth++;
    });

    const sortedLinksByDate = [...data.links].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const mostRecentLink = sortedLinksByDate[0] || null;

    const sortedByClicks = [...data.links].sort((a, b) => b.click_count - a.click_count);
    const topLinks = sortedByClicks.slice(0, 10).map(l => ({
      ...l,
      percentage: totalClicks > 0 ? Math.round((l.click_count / totalClicks) * 100) : 0,
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

    data.click_events.forEach(e => {
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
  },

  resetAnalytics(): void {
    const data = this.get();
    data.click_events = [];
    data.links.forEach(l => {
      l.click_count = 0;
    });
    this.save(data);
  },
};

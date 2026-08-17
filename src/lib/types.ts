export interface Profile {
  id: string;
  name: string;
  description: string;
  photo_url: string;
  theme_default: 'dark' | 'light' | 'system';
  updated_at: string;
}

export type SocialPlatform = 'x' | 'instagram' | 'facebook' | 'threads' | 'pinterest' | 'medium' | 'youtube';

export interface SocialLinks {
  x?: string;
  instagram?: string;
  facebook?: string;
  threads?: string;
  pinterest?: string;
  medium?: string;
  youtube?: string;
}

export interface Category {
  id: string;
  name: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface LinkItem {
  id: string;
  title: string;
  url: string;
  thumbnail_url?: string | null;
  category_id?: string | null; // null if standalone
  is_active: boolean;          // manual toggle state
  sort_order: number;          // sequence in mixed or category stream
  click_count: number;
  created_at: string;
  updated_at: string;
}

export interface ClickEvent {
  id: string;
  link_id: string;
  timestamp: string; // ISO date string
  referrer?: string;
  user_agent?: string;
}

export interface OverviewOrderItem {
  type: 'link' | 'category';
  id: string;
  sort_order: number;
}

export interface DatabaseSchema {
  profile: Profile;
  socials: SocialLinks;
  categories: Category[];
  links: LinkItem[];
  click_events: ClickEvent[];
  overview_order: OverviewOrderItem[];
  settings: {
    admin_password_hash: string;
    theme_preference: 'dark' | 'light';
  };
}

export interface AnalyticsSummary {
  totalClicks: number;
  totalLinks: number;
  totalActiveLinks: number;
  totalInactiveLinks: number;
  totalCategories: number;
  avgClicksPerLink: number;
  clicksToday: number;
  clicksThisWeek: number;
  clicksThisMonth: number;
  mostRecentLink?: LinkItem | null;
  topLinks: (LinkItem & { percentage: number })[];
  clicksOverTime: {
    date: string; // YYYY-MM-DD
    clicks: number;
  }[];
}

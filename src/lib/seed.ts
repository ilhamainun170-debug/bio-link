import { DatabaseSchema, ClickEvent } from './types';
import bcrypt from 'bcryptjs';

// Default Admin Password is '051102'
export const DEFAULT_ADMIN_PASSWORD = '051102';

// Precomputed bcrypt hash for '051102' or generated dynamically
export const DEFAULT_PASSWORD_HASH = bcrypt.hashSync(DEFAULT_ADMIN_PASSWORD, 10);

export function generateSeedData(): DatabaseSchema {
  const now = new Date();
  const nowIso = now.toISOString();

  // Generate simulated 30-day click events
  const clickEvents: ClickEvent[] = [];
  const linkIds = ['link-1', 'link-2', 'link-3', 'link-4', 'link-5', 'link-6', 'link-7'];
  const linkWeights = [38, 27, 21, 15, 12, 8, 5];

  // Distribute over past 30 days
  for (let i = 29; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);
    
    // Vary daily volume slightly
    const dailyMultiplier = Math.max(1, Math.floor(Math.sin(i * 0.4) * 5 + 8));
    
    linkIds.forEach((linkId, index) => {
      const count = Math.floor((linkWeights[index] / 10) * dailyMultiplier * 0.4);
      for (let c = 0; c < count; c++) {
        const eventTime = new Date(day);
        eventTime.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
        clickEvents.push({
          id: `click-${i}-${linkId}-${c}`,
          link_id: linkId,
          timestamp: eventTime.toISOString(),
        });
      }
    });
  }

  return {
    profile: {
      id: 'default-profile',
      name: 'Alex Morgan',
      description: 'Product Designer & Full-Stack Builder crafting thoughtful digital products & web tools.',
      photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      theme_default: 'dark',
      updated_at: nowIso,
    },
    socials: {
      x: 'https://x.com/alexmorgan_dev',
      instagram: 'https://instagram.com/alexmorgan.studio',
      threads: 'https://threads.net/@alexmorgan.studio',
      medium: 'https://medium.com/@alexmorgan',
      youtube: 'https://youtube.com/@alexmorgan',
    },
    categories: [
      {
        id: 'cat-1',
        name: '🚀 Featured Work',
        is_active: true,
        sort_order: 1,
        created_at: nowIso,
      },
      {
        id: 'cat-2',
        name: '📚 Curated Tools & Resources',
        is_active: true,
        sort_order: 3,
        created_at: nowIso,
      },
      {
        id: 'cat-3',
        name: '💬 Get in Touch',
        is_active: true,
        sort_order: 5,
        created_at: nowIso,
      }
    ],
    links: [
      {
        id: 'link-1',
        title: 'Portfolio & Case Studies 2026',
        url: 'https://portfolio.example.com',
        thumbnail_url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=300&auto=format&fit=crop&q=80',
        category_id: null, // Standalone hero link
        is_active: true,
        sort_order: 0,
        click_count: 142,
        created_at: nowIso,
        updated_at: nowIso,
      },
      {
        id: 'link-2',
        title: 'SaaS Design System Kit (Figma)',
        url: 'https://figma.com/@alexmorgan',
        thumbnail_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80',
        category_id: 'cat-1',
        is_active: true,
        sort_order: 0,
        click_count: 98,
        created_at: nowIso,
        updated_at: nowIso,
      },
      {
        id: 'link-3',
        title: 'AI Prompt Engineering Handbook',
        url: 'https://read.example.com/ai-handbook',
        thumbnail_url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=300&auto=format&fit=crop&q=80',
        category_id: 'cat-1',
        is_active: true,
        sort_order: 1,
        click_count: 85,
        created_at: nowIso,
        updated_at: nowIso,
      },
      {
        id: 'link-4',
        title: 'Join my Weekly Design Newsletter',
        url: 'https://newsletter.example.com',
        thumbnail_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&auto=format&fit=crop&q=80',
        category_id: null, // Standalone in middle
        is_active: true,
        sort_order: 2,
        click_count: 64,
        created_at: nowIso,
        updated_at: nowIso,
      },
      {
        id: 'link-5',
        title: 'My Favorite Developer Tech Stack',
        url: 'https://blog.example.com/stack-2026',
        thumbnail_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&auto=format&fit=crop&q=80',
        category_id: 'cat-2',
        is_active: true,
        sort_order: 0,
        click_count: 48,
        created_at: nowIso,
        updated_at: nowIso,
      },
      {
        id: 'link-6',
        title: 'Book a 1:1 Mentorship Session',
        url: 'https://cal.com/alexmorgan',
        thumbnail_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=300&auto=format&fit=crop&q=80',
        category_id: 'cat-3',
        is_active: true,
        sort_order: 0,
        click_count: 36,
        created_at: nowIso,
        updated_at: nowIso,
      },
      {
        id: 'link-7',
        title: 'Send an Email Inquiry',
        url: 'mailto:hello@alexmorgan.dev',
        thumbnail_url: null,
        category_id: 'cat-3',
        is_active: true,
        sort_order: 1,
        click_count: 22,
        created_at: nowIso,
        updated_at: nowIso,
      },
    ],
    click_events: clickEvents,
    overview_order: [
      { type: 'link', id: 'link-1', sort_order: 0 },
      { type: 'category', id: 'cat-1', sort_order: 1 },
      { type: 'link', id: 'link-4', sort_order: 2 },
      { type: 'category', id: 'cat-2', sort_order: 3 },
      { type: 'category', id: 'cat-3', sort_order: 4 },
    ],
    settings: {
      admin_password_hash: DEFAULT_PASSWORD_HASH,
      theme_preference: 'dark',
    },
  };
}

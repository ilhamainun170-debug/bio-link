'use client';

import React, { useState } from 'react';
import { Profile, SocialLinks, LinkItem, Category } from '@/lib/types';
import ProfileHeader from './ProfileHeader';
import SocialLinksBar from './SocialLinksBar';
import LinkCard from './LinkCard';
import CategoryAccordion from './CategoryAccordion';
import ThumbnailLightbox from './ThumbnailLightbox';
import ThemeToggle from './ThemeToggle';
import { useBiolink } from '@/context/BiolinkContext';

export type MixedItem =
  | { type: 'link'; data: LinkItem }
  | { type: 'category'; data: Category; links: LinkItem[] };

interface PublicBioViewProps {
  initialData: {
    profile: Profile;
    socials: SocialLinks;
    items: MixedItem[];
  };
  isPreview?: boolean;
}

export default function PublicBioView({ initialData, isPreview = false }: PublicBioViewProps) {
  const { profile: liveProfile, socials: liveSocials, links: liveLinks, categories: liveCategories, overviewItems } = useBiolink();

  const profile = isPreview ? initialData.profile : (liveProfile || initialData.profile);
  const socials = isPreview ? initialData.socials : (liveSocials || initialData.socials);

  let items = initialData.items;
  if (!isPreview && liveLinks) {
    const activeCats = new Map(liveCategories.filter((c) => c.is_active).map((c) => [c.id, c]));
    const linkMap = new Map(liveLinks.filter((l) => l.is_active && !l.category_id).map((l) => [l.id, l]));

    const mixed: MixedItem[] = [];
    const processed = new Set<string>();

    (overviewItems || []).forEach((ord) => {
      if (ord.type === 'link' && linkMap.has(ord.id) && ord.isActive) {
        mixed.push({ type: 'link', data: linkMap.get(ord.id)! });
        processed.add(`link-${ord.id}`);
      } else if (ord.type === 'category' && activeCats.has(ord.id) && ord.isActive) {
        const cat = activeCats.get(ord.id)!;
        const catLinks = liveLinks.filter((l) => l.category_id === cat.id && l.is_active);
        if (catLinks.length > 0) {
          mixed.push({ type: 'category', data: cat, links: catLinks });
        }
        processed.add(`cat-${ord.id}`);
      }
    });

    // Add remaining standalone links
    liveLinks.filter((l) => l.is_active && !l.category_id).forEach((l) => {
      if (!processed.has(`link-${l.id}`)) {
        mixed.push({ type: 'link', data: l });
        processed.add(`link-${l.id}`);
      }
    });

    // Add remaining active categories
    activeCats.forEach((c) => {
      if (!processed.has(`cat-${c.id}`)) {
        const catLinks = liveLinks.filter((l) => l.category_id === c.id && l.is_active);
        if (catLinks.length > 0) {
          mixed.push({ type: 'category', data: c, links: catLinks });
        }
        processed.add(`cat-${c.id}`);
      }
    });

    items = mixed;
  }

  const [lightboxState, setLightboxState] = useState<{ isOpen: boolean; imageUrl: string | null; title: string }>({
    isOpen: false,
    imageUrl: null,
    title: '',
  });

  const handleOpenThumbnail = (imageUrl: string, title: string) => {
    setLightboxState({
      isOpen: true,
      imageUrl,
      title,
    });
  };

  const handleCloseLightbox = () => {
    setLightboxState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <div className={`w-full max-w-lg mx-auto flex flex-col items-center justify-between ${isPreview ? 'p-3' : 'py-6 px-3 sm:px-4'}`}>
      {/* Top Floating Controls */}
      {!isPreview && (
        <div className="w-full flex items-center justify-end mb-4 px-1">
          <ThemeToggle />
        </div>
      )}

      {/* Profile Section */}
      <div className="w-full flex flex-col items-center">
        <ProfileHeader profile={profile} />
        <SocialLinksBar socials={socials} />
      </div>

      {/* Main Mixed Links Stream */}
      <div className="w-full flex flex-col gap-3 my-6">
        {items.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-2xl border border-dashed border-gray-200 dark:border-[#2E3240] text-gray-400 text-sm">
            No active links to display yet.
          </div>
        ) : (
          items.map((item, index) => {
            if (item.type === 'link') {
              return (
                <LinkCard
                  key={`link-${item.data.id}-${index}`}
                  link={item.data}
                  onOpenThumbnail={handleOpenThumbnail}
                />
              );
            } else if (item.type === 'category') {
              return (
                <CategoryAccordion
                  key={`cat-${item.data.id}-${index}`}
                  category={item.data}
                  links={item.links}
                  onOpenThumbnail={handleOpenThumbnail}
                  defaultExpanded={index === 0}
                />
              );
            }
            return null;
          })
        )}
      </div>

      {/* Minimal Footer */}
      {!isPreview && (
        <footer className="mt-8 pb-4 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center justify-center gap-1.5">
            <span>BioLink</span>
            <span>•</span>
            <span>Personal Hub</span>
          </p>
        </footer>
      )}

      {/* Lightbox for Thumbnail Preview */}
      <ThumbnailLightbox
        isOpen={lightboxState.isOpen}
        imageUrl={lightboxState.imageUrl}
        title={lightboxState.title}
        onClose={handleCloseLightbox}
      />
    </div>
  );
}

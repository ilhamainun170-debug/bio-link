'use client';

import React, { useState } from 'react';
import { Profile, SocialLinks, LinkItem, Category } from '@/lib/types';
import ProfileHeader from './ProfileHeader';
import SocialLinksBar from './SocialLinksBar';
import LinkCard from './LinkCard';
import CategoryAccordion from './CategoryAccordion';
import ThumbnailLightbox from './ThumbnailLightbox';
import ThemeToggle from './ThemeToggle';
import Link from 'next/link';
import { Lock } from 'lucide-react';

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
  const { profile, socials, items } = initialData;
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
        <div className="w-full flex items-center justify-between mb-4 px-1">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-200/60 dark:hover:bg-[#20222C] transition-colors border border-transparent hover:border-gray-200 dark:hover:border-[#2E3240]"
            title="Admin Login"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Admin</span>
          </Link>
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
                  defaultExpanded={index === 0} // expand first category by default for great UX
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

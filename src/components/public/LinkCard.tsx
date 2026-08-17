'use client';

import React from 'react';
import { LinkItem } from '@/lib/types';
import { ExternalLink, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

interface LinkCardProps {
  link: LinkItem;
  onOpenThumbnail?: (imageUrl: string, title: string) => void;
  isNested?: boolean;
}

export default function LinkCard({ link, onOpenThumbnail, isNested = false }: LinkCardProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Fire click tracking asynchronously without blocking navigation
    try {
      navigator.sendBeacon?.(
        '/api/analytics/click',
        JSON.stringify({ link_id: link.id })
      );
      // Fallback fetch if beacon not supported
      if (!navigator.sendBeacon) {
        fetch('/api/analytics/click', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ link_id: link.id }),
          keepalive: true,
        }).catch(() => {});
      }
    } catch (err) {
      console.warn('Analytics tracking exception:', err);
    }
  };

  const handleThumbnailClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (link.thumbnail_url && onOpenThumbnail) {
      onOpenThumbnail(link.thumbnail_url, link.title);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.98 }}
      className={`w-full group rounded-xl transition-all duration-200 ${
        isNested
          ? 'bg-gray-50/90 dark:bg-[#1A1C25] hover:bg-gray-100 dark:hover:bg-[#232632] border border-gray-200/70 dark:border-[#2E3240]/80'
          : 'bg-white dark:bg-[#20222C] hover:bg-gray-50/80 dark:hover:bg-[#272A36] border border-gray-200/90 dark:border-[#2E3240] shadow-soft-sm hover:shadow-soft-md'
      }`}
    >
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="flex items-center gap-3.5 p-3.5 sm:p-4 text-left w-full focus:outline-none focus:ring-2 focus:ring-indigo-500/50 rounded-xl"
      >
        {/* Optional Thumbnail */}
        {link.thumbnail_url && (
          <div
            onClick={handleThumbnailClick}
            title="Click to expand image"
            className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-lg overflow-hidden shrink-0 border border-gray-200/80 dark:border-[#2E3240] bg-gray-100 dark:bg-[#181A22] cursor-zoom-in group/thumb"
          >
            <img
              src={link.thumbnail_url}
              alt=""
              className="w-full h-full object-cover transition-transform duration-200 group-hover/thumb:scale-110"
              onError={(e) => {
                // If thumbnail fails to load, hide thumbnail container
                (e.target as HTMLImageElement).parentElement!.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity text-white">
              <Eye className="w-3.5 h-3.5 drop-shadow" />
            </div>
          </div>
        )}

        {/* Title */}
        <span className="flex-1 font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
          {link.title}
        </span>

        {/* Arrow / External Icon */}
        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all">
          <ExternalLink className="w-4 h-4" />
        </div>
      </a>
    </motion.div>
  );
}

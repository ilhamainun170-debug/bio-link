'use client';

import React, { useState } from 'react';
import { Category, LinkItem } from '@/lib/types';
import { ChevronDown, Folder } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LinkCard from './LinkCard';

interface CategoryAccordionProps {
  category: Category;
  links: LinkItem[];
  onOpenThumbnail?: (imageUrl: string, title: string) => void;
  defaultExpanded?: boolean;
}

export default function CategoryAccordion({
  category,
  links,
  onOpenThumbnail,
  defaultExpanded = false,
}: CategoryAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultExpanded);

  if (links.length === 0) return null;

  return (
    <div className="w-full rounded-2xl overflow-hidden bg-white/60 dark:bg-[#20222C]/70 border border-gray-200/90 dark:border-[#2E3240] shadow-soft-sm transition-all duration-200 backdrop-blur-sm">
      {/* Category Header Bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between p-3.5 sm:p-4 text-left font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100 hover:bg-gray-100/60 dark:hover:bg-[#272A36]/60 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50 rounded-2xl select-none"
      >
        <div className="flex items-center gap-2.5 truncate pr-3">
          <Folder className="w-4 h-4 text-indigo-500 shrink-0" />
          <span className="truncate">{category.name}</span>
          <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-gray-100 dark:bg-[#2A2D3A] text-gray-500 dark:text-gray-400">
            {links.length}
          </span>
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="text-gray-400 dark:text-gray-500 shrink-0"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>

      {/* Accordion Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden border-t border-gray-100 dark:border-[#2A2D3A]"
          >
            <div className="p-3 sm:p-3.5 flex flex-col gap-2.5 bg-gray-50/40 dark:bg-[#181A22]/40">
              {links.map((link) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  onOpenThumbnail={onOpenThumbnail}
                  isNested={true}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

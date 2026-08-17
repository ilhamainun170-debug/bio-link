'use client';

import React from 'react';
import { SocialLinks } from '@/lib/types';
import { motion } from 'framer-motion';

// SVG Icons for clean, accurate brand representations
function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" {...props}>
      <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.82 0-1.666.28-1.666 1.442v2.538h3.694l-.597 3.667h-3.097v7.98H9.101z" />
    </svg>
  );
}

function ThreadsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" {...props}>
      <path d="M12.186 24c-3.522 0-6.425-1.222-8.397-3.535C1.865 18.204 1 15.112 1 11.531 1 7.828 2.052 4.795 4.041 2.766 6.096.678 8.956-.002 12.336 0c3.42 0 6.264.673 8.224 2.756 1.935 2.054 2.946 5.093 2.923 8.786v.077h-3.321c0-2.887-.714-5.068-1.954-6.309-1.284-1.284-3.21-1.782-5.872-1.782-2.585 0-4.57.51-5.741 1.765-1.197 1.283-1.804 3.323-1.804 6.065 0 2.825.603 4.978 1.791 6.398 1.173 1.401 2.96 2.112 5.313 2.112 2.793 0 4.67-.978 5.61-2.924.471-.976.711-2.222.711-3.704v-.759h-5.918v-2.924h9.19v3.683c0 2.22-.387 4.103-1.151 5.597C18.252 22.023 15.548 24 12.186 24z" />
    </svg>
  );
}

function PinterestIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" {...props}>
      <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
    </svg>
  );
}

function MediumIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" {...props}>
      <path d="M13.54 12a6.8 6.8 0 0 1-6.77 6.82A6.8 6.8 0 0 1 0 12a6.8 6.8 0 0 1 6.77-6.82A6.8 6.8 0 0 1 13.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
    </svg>
  );
}

function YoutubeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" {...props}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

interface SocialLinksBarProps {
  socials?: SocialLinks;
  className?: string;
}

export default function SocialLinksBar({ socials, className = '' }: SocialLinksBarProps) {
  if (!socials) return null;

  const platforms: { key: keyof SocialLinks; label: string; icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
    { key: 'x', label: 'X (Twitter)', icon: XIcon },
    { key: 'instagram', label: 'Instagram', icon: InstagramIcon },
    { key: 'threads', label: 'Threads', icon: ThreadsIcon },
    { key: 'youtube', label: 'YouTube', icon: YoutubeIcon },
    { key: 'medium', label: 'Medium', icon: MediumIcon },
    { key: 'pinterest', label: 'Pinterest', icon: PinterestIcon },
    { key: 'facebook', label: 'Facebook', icon: FacebookIcon },
  ];

  // Filter only items that have non-empty URLs
  const activeSocials = platforms.filter(
    (item) => socials[item.key] && socials[item.key]!.trim().length > 0
  );

  if (activeSocials.length === 0) return null;

  return (
    <div className={`flex items-center justify-center flex-wrap gap-2.5 my-3 ${className}`}>
      {activeSocials.map(({ key, label, icon: Icon }) => {
        let url = socials[key]!.trim();
        if (!/^https?:\/\//i.test(url) && !/^mailto:/i.test(url)) {
          url = `https://${url}`;
        }

        return (
          <motion.a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            title={label}
            aria-label={label}
            whileHover={{ scale: 1.12, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/90 dark:bg-[#20222C] text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-gray-200/80 dark:border-[#2E3240] shadow-soft-sm hover:shadow-soft-md transition-all duration-200"
          >
            <Icon />
          </motion.a>
        );
      })}
    </div>
  );
}

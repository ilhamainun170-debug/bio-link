'use client';

import React from 'react';
import { Profile } from '@/lib/types';
import { motion } from 'framer-motion';

interface ProfileHeaderProps {
  profile?: Profile;
  className?: string;
}

export default function ProfileHeader({ profile, className = '' }: ProfileHeaderProps) {
  const name = profile?.name || 'BioLink User';
  const description = profile?.description || '';
  const photoUrl = profile?.photo_url;

  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      {/* Profile Photo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative group mb-3.5"
      >
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-gray-200 dark:border-[#2E3240] shadow-soft-md">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={name}
              className="w-full h-full object-cover rounded-full select-none"
              onError={(e) => {
                // Fallback avatar if image fails to load
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=200`;
              }}
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-inner">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </motion.div>

      {/* Name */}
      <motion.h1
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight"
      >
        {name}
      </motion.h1>

      {/* Description / Short Bio */}
      {description && (
        <motion.p
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mt-1.5 text-sm sm:text-[15px] text-gray-600 dark:text-gray-400 max-w-sm sm:max-w-md leading-relaxed px-2 font-normal"
        >
          {description}
        </motion.p>
      )}
    </div>
  );
}

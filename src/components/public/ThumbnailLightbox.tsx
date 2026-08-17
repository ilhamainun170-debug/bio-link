'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ThumbnailLightboxProps {
  isOpen: boolean;
  imageUrl: string | null;
  title: string;
  onClose: () => void;
}

export default function ThumbnailLightbox({ isOpen, imageUrl, title, onClose }: ThumbnailLightboxProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && imageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 max-w-lg w-full bg-[#181A22] rounded-2xl overflow-hidden shadow-dark-lg border border-[#2E3240]"
          >
            <div className="flex items-center justify-between p-3.5 border-b border-[#2E3240]/60 bg-[#20222C]">
              <span className="text-sm font-medium text-gray-200 truncate pr-4">{title}</span>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#2A2D3A] transition-colors"
                aria-label="Close preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-[#14161C] flex items-center justify-center min-h-[260px] max-h-[70vh] overflow-hidden">
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-auto max-h-[60vh] object-contain rounded-lg"
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

interface ThemeToggleProps {
  className?: string;
  defaultTheme?: 'dark' | 'light';
}

export default function ThemeToggle({ className = '', defaultTheme = 'dark' }: ThemeToggleProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('biolink_theme') as 'dark' | 'light' | null;
    const initialTheme = saved || defaultTheme;
    setTheme(initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [defaultTheme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('biolink_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  if (!mounted) {
    return <div className={`w-9 h-9 ${className}`} />;
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle Theme"
      className={`relative p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-white/80 dark:bg-[#20222C]/80 hover:bg-gray-100 dark:hover:bg-[#2A2D3A] border border-gray-200/80 dark:border-[#2E3240] text-gray-700 dark:text-gray-200 shadow-soft-sm backdrop-blur-md ${className}`}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -90, scale: 0.6, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        exit={{ rotate: 90, scale: 0.6, opacity: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="flex items-center justify-center"
      >
        {theme === 'dark' ? (
          <Sun className="w-4 h-4 text-amber-400" />
        ) : (
          <Moon className="w-4 h-4 text-indigo-600" />
        )}
      </motion.div>
    </button>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, ArrowLeft, ShieldCheck, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/ToastContext';
import ThemeToggle from '@/components/public/ThemeToggle';

interface AdminPasswordGateProps {
  onAuthenticated: () => void;
}

export default function AdminPasswordGate({ onAuthenticated }: AdminPasswordGateProps) {
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [cooldown, setCooldown] = useState(0);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          setErrorMsg('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0) return;
    if (!password.trim()) {
      setErrorMsg('Please enter your admin password');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setCooldown(60);
          setErrorMsg(data.error || 'Too many failed attempts. Cooldown 60s.');
        } else {
          setErrorMsg(data.error || 'Incorrect password. Please try again.');
        }
        toast.error('Authentication failed', data.error || 'Please check your password.');
        setIsLoading(false);
        return;
      }

      // Set sessionStorage as specified
      sessionStorage.setItem('tolvane_admin_session', 'active');
      toast.success('Welcome back!', 'Admin authentication successful.');
      onAuthenticated();
    } catch (err) {
      console.error('Login request failed:', err);
      // Client-side fallback check if server fetch is unavailable
      if (password.trim() === '051102') {
        sessionStorage.setItem('tolvane_admin_session', 'active');
        toast.success('Welcome back!', 'Admin authentication successful.');
        onAuthenticated();
      } else {
        setErrorMsg('Network error or incorrect password. Please try again.');
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between p-4 sm:p-6 bg-[#F8F9FA] dark:bg-[#14161C] transition-colors duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between w-full max-w-md mx-auto">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Biolink</span>
        </Link>
        <ThemeToggle />
      </div>

      {/* Main Password Gate Card */}
      <div className="w-full max-w-md mx-auto my-auto py-8">
        <div className="bg-white dark:bg-[#20222C] rounded-3xl p-6 sm:p-8 border border-gray-200/90 dark:border-[#2E3240] shadow-soft-xl">
          {/* Logo & Heading */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-soft-md mb-4 ring-8 ring-indigo-50 dark:ring-indigo-950/40">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              Admin Protected Gate
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1.5 max-w-xs">
              Enter your secret password to unlock the admin dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || cooldown > 0}
                  placeholder="Enter admin password"
                  autoFocus
                  className="w-full pl-4 pr-11 py-3 rounded-2xl bg-gray-50 dark:bg-[#181A22] border border-gray-200 dark:border-[#2E3240] text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error / Cooldown Alert */}
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs animate-shake">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || cooldown > 0}
              className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-soft-md hover:shadow-soft-lg flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {cooldown > 0 ? `Try again in ${cooldown}s` : 'Unlock Admin Session'}
                  </span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-400 dark:text-gray-600">
        Protected by BioLink Session Sentinel
      </div>
    </div>
  );
}

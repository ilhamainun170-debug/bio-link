'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, ArrowLeft, ShieldCheck, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/ToastContext';
import ThemeToggle from '@/components/public/ThemeToggle';

export default function AdminLoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [cooldown, setCooldown] = useState(0);

  // Check if already authenticated
  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          router.replace('/admin');
        }
      })
      .catch(() => {});
  }, [router]);

  // Cooldown countdown timer
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
          setErrorMsg(data.error || 'Too many attempts. Cooldown 60s.');
        } else {
          setErrorMsg(data.error || 'Incorrect password. Try again.');
        }
        toast.error('Authentication failed', data.error || 'Please check your password.');
        setIsLoading(false);
        return;
      }

      toast.success('Welcome back!', 'Admin authentication successful.');
      router.replace('/admin');
    } catch (err) {
      console.error('Login request failed:', err);
      setErrorMsg('Network error. Please try again.');
      setIsLoading(false);
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

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto my-auto py-8">
        <div className="bg-white dark:bg-[#20222C] rounded-2xl p-6 sm:p-8 shadow-soft-lg dark:shadow-dark-md border border-gray-200/90 dark:border-[#2E3240]">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 shadow-inner">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              Admin Access
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Enter your password to manage your BioLink
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
                  placeholder="Enter admin password"
                  disabled={isLoading || cooldown > 0}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#181A22] border border-gray-200 dark:border-[#2E3240] text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all pr-11 text-sm font-mono"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {cooldown > 0 && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400 text-xs text-center font-medium">
                Rate limit active. Please wait {cooldown}s.
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || cooldown > 0}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white font-medium text-sm transition-all duration-200 shadow-soft-sm hover:shadow-soft-md focus:outline-none focus:ring-2 focus:ring-indigo-500/50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Log In to Dashboard</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer info */}
      <div className="text-center text-xs text-gray-400 dark:text-gray-500">
        Default credentials configured • Secure session
      </div>
    </div>
  );
}

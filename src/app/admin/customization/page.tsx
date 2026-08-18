'use client';

import React, { useState, useEffect, useRef } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import PublicBioView, { MixedItem } from '@/components/public/PublicBioView';
import {
  Upload,
  Image as ImageIcon,
  Check,
  Smartphone,
  Sparkles,
  Download,
  Database,
  Cloud,
  RefreshCw,
} from 'lucide-react';
import { Profile, SocialLinks, DatabaseSchema } from '@/lib/types';
import { useToast } from '@/components/ui/ToastContext';
import { useBiolink } from '@/context/BiolinkContext';

export default function CustomizationPage() {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    profile: contextProfile,
    socials: contextSocials,
    overviewItems,
    links,
    categories,
    updateProfile,
    importDatabase,
    exportDatabase,
    refreshData,
    isCloudKV,
    loading,
  } = useBiolink();

  const [profile, setProfile] = useState<Profile>(contextProfile);
  const [socials, setSocials] = useState<SocialLinks>(contextSocials);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (contextProfile) setProfile(contextProfile);
    if (contextSocials) setSocials(contextSocials);
  }, [contextProfile, contextSocials]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large', 'Max image size is 5MB.');
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error('Upload failed', data.error || 'Failed to upload photo.');
        setUploadingAvatar(false);
        return;
      }

      setProfile((prev) => ({ ...prev, photo_url: data.url }));
      toast.success('Avatar updated', 'Image uploaded successfully.');
    } catch (err) {
      console.error('Avatar upload error:', err);
      toast.error('Upload error', 'Please try again or use an image URL.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await updateProfile(profile, socials);
      toast.success('Saved!', 'Your profile and social media links have been updated.');
    } catch (err) {
      console.error('Profile save error:', err);
      toast.error('Error', 'Failed to save customization.');
    } finally {
      setIsSaving(false);
    }
  };

  // Export Backup
  const handleExportBackup = () => {
    exportDatabase();
    toast.success('Backup exported', 'Saved complete biolink database JSON.');
  };

  // Import Backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const parsed: DatabaseSchema = JSON.parse(content);

        const success = await importDatabase(parsed);
        if (success) {
          toast.success('Backup restored!', 'All links, categories, and customizations have been restored.');
        } else {
          toast.error('Restore failed', 'Invalid BioLink database format.');
        }
      } catch (err) {
        console.error('Parse error:', err);
        toast.error('Invalid file', 'Could not parse JSON file.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Manual Sync Now
  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await refreshData();
      toast.success('Synced!', 'Client and server state are in sync.');
    } catch (err) {
      console.error('Sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Build real-time preview items
  const previewItems: MixedItem[] = [];
  links.forEach((l) => {
    if (!l.category_id && l.is_active) {
      previewItems.push({ type: 'link', data: l });
    }
  });
  categories.forEach((c) => {
    if (c.is_active) {
      const catLinks = links.filter((l) => l.category_id === c.id && l.is_active);
      if (catLinks.length > 0) {
        previewItems.push({ type: 'category', data: c, links: catLinks });
      }
    }
  });

  const socialFields: { key: keyof SocialLinks; label: string; placeholder: string }[] = [
    { key: 'x', label: 'X (formerly Twitter)', placeholder: 'https://x.com/yourhandle' },
    { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/yourhandle' },
    { key: 'threads', label: 'Threads', placeholder: 'https://threads.net/@yourhandle' },
    { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@yourchannel' },
    { key: 'medium', label: 'Medium', placeholder: 'https://medium.com/@yourprofile' },
    { key: 'pinterest', label: 'Pinterest', placeholder: 'https://pinterest.com/yourboard' },
    { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/yourpage' },
  ];

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Customization"
        subtitle="Personalize your identity, social accounts, and review live changes"
      />

      <div className="p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form Column (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleSave} className="space-y-6">
              {/* Profile Identity Card */}
              <div className="bg-white dark:bg-[#20222C] rounded-2xl p-5 sm:p-6 border border-gray-200/90 dark:border-[#2E3240] shadow-soft-sm space-y-5">
                <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 dark:border-[#2E3240]">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                  <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">
                    Profile Identity
                  </h3>
                </div>

                {/* Avatar Uploader */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                    Profile Photo (1:1 Ratio)
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-indigo-500/30 bg-gray-100 dark:bg-[#181A22] shrink-0">
                      {profile.photo_url ? (
                        <img
                          src={profile.photo_url}
                          alt="Profile Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ImageIcon className="w-7 h-7" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          id="avatar-upload"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                        <label
                          htmlFor="avatar-upload"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/50 hover:bg-indigo-100 cursor-pointer transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{uploadingAvatar ? 'Uploading...' : 'Upload New Photo'}</span>
                        </label>

                        {profile.photo_url && (
                          <button
                            type="button"
                            onClick={() => setProfile((p) => ({ ...p, photo_url: '' }))}
                            className="text-xs text-rose-500 hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <input
                        type="url"
                        value={profile.photo_url}
                        onChange={(e) => setProfile((p) => ({ ...p, photo_url: e.target.value }))}
                        placeholder="Or enter image URL (https://...)"
                        className="w-full px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-[#181A22] border border-gray-200 dark:border-[#2E3240] text-gray-900 dark:text-gray-100 placeholder-gray-400 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Display Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Alex Morgan"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-[#181A22] border border-gray-200 dark:border-[#2E3240] text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm font-medium"
                  />
                </div>

                {/* Description / Bio */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Short Bio / Description
                    </label>
                    <span
                      className={`text-xs ${
                        profile.description.length > 150
                          ? 'text-amber-500 font-semibold'
                          : 'text-gray-400'
                      }`}
                    >
                      {profile.description.length}/150
                    </span>
                  </div>
                  <textarea
                    value={profile.description}
                    onChange={(e) => setProfile((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Brief intro about yourself or what you do..."
                    rows={3}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-[#181A22] border border-gray-200 dark:border-[#2E3240] text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm leading-relaxed"
                  />
                </div>
              </div>

              {/* Social Media Links Card */}
              <div className="bg-white dark:bg-[#20222C] rounded-2xl p-5 sm:p-6 border border-gray-200/90 dark:border-[#2E3240] shadow-soft-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#2E3240]">
                  <div>
                    <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">
                      Social Media Handles
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Empty links are automatically hidden on your biolink.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {socialFields.map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        {label}
                      </label>
                      <input
                        type="url"
                        value={socials[key] || ''}
                        onChange={(e) =>
                          setSocials((s) => ({ ...s, [key]: e.target.value }))
                        }
                        placeholder={placeholder}
                        className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-[#181A22] border border-gray-200 dark:border-[#2E3240] text-gray-900 dark:text-gray-100 placeholder-gray-400 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={isSaving || loading}
                className="w-full py-3 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-soft-md flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>Save All Customizations</span>
              </button>
            </form>

            {/* Database & Cloud Backup Card */}
            <div className="bg-white dark:bg-[#20222C] rounded-2xl p-5 sm:p-6 border border-gray-200/90 dark:border-[#2E3240] shadow-soft-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#2E3240]">
                <div className="flex items-center gap-2.5">
                  <Database className="w-5 h-5 text-indigo-500" />
                  <div>
                    <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">
                      Data Persistence & Cloud Backup
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Export, restore, or sync your BioLink database
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      isCloudKV
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900'
                        : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900'
                    }`}
                  >
                    <Cloud className="w-3.5 h-3.5" />
                    <span>{isCloudKV ? 'Cloud Redis Active' : 'Master Store Active'}</span>
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Your data is stored permanently in your browser master storage and synchronized with the server. You can also export or import your entire link database anytime as a JSON backup.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-gray-100 dark:bg-[#181A22] hover:bg-gray-200 dark:hover:bg-[#2A2D3A] text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-[#2E3240] transition-colors"
                >
                  <Download className="w-4 h-4 text-indigo-500" />
                  <span>Export Backup (.json)</span>
                </button>

                <input
                  type="file"
                  accept=".json"
                  ref={fileInputRef}
                  onChange={handleImportBackup}
                  className="hidden"
                  id="import-backup-file"
                />
                <label
                  htmlFor="import-backup-file"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-gray-100 dark:bg-[#181A22] hover:bg-gray-200 dark:hover:bg-[#2A2D3A] text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-[#2E3240] cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4 text-emerald-500" />
                  <span>Import / Restore Backup</span>
                </label>

                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Sync Now</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Live Preview Column (5 cols on lg) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="sticky top-20 w-full flex flex-col items-center">
              <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <Smartphone className="w-4 h-4 text-indigo-500" />
                <span>Live Interactive Preview</span>
              </div>

              {/* Smartphone Frame */}
              <div className="relative w-full max-w-[340px] aspect-[9/18.5] bg-[#14161C] rounded-[44px] p-3 shadow-2xl border-[6px] border-[#2A2D3A] overflow-hidden flex flex-col justify-between">
                {/* Dynamic island / Notch pill */}
                <div className="w-24 h-4 bg-black rounded-full mx-auto mb-2 shrink-0 z-20" />

                {/* Inner Screen Scroll View */}
                <div className="flex-1 w-full overflow-y-auto rounded-[32px] bg-[#14161C] text-[#E8E8ED]">
                  <PublicBioView
                    initialData={{
                      profile,
                      socials,
                      items: previewItems,
                    }}
                    isPreview={true}
                  />
                </div>

                {/* Home indicator bar */}
                <div className="w-28 h-1 bg-white/20 rounded-full mx-auto mt-2 shrink-0 z-20" />
              </div>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2.5 text-center">
                Updates in real-time as you type or change photos
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

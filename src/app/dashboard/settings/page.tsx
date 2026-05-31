'use client';

import React, { useState, useEffect } from 'react';
import { User, Save, CheckCircle2, Loader2 } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { validateSupabaseEnv } from '@/lib/supabase/env';

const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai',
  'Asia/Kolkata', 'Australia/Sydney', 'Pacific/Auckland',
];

interface Profile {
  id: string;
  full_name: string;
  email: string;
  slug: string;
  headline: string;
  bio: string;
  avatar_url: string;
  website_url: string;
  linkedin_url: string;
  x_url: string;
  youtube_url: string;
  timezone: string;
  is_public: boolean;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [envError, setEnvError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userId, setUserId] = useState('');

  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [headline, setHeadline] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [xUrl, setXUrl] = useState('');

  useEffect(() => {
    async function loadProfile() {
      const envCheck = validateSupabaseEnv();
      if (!envCheck.valid) {
        setEnvError(envCheck.error || 'Supabase not configured');
        setLoading(false);
        return;
      }

      try {
        const supabase = getSupabaseBrowserClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setEnvError('not-authenticated');
          setLoading(false);
          return;
        }

        setUserId(session.user.id);

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found

        if (data) {
          const p = data as Profile;
          setProfile(p);
          setFullName(p.full_name || '');
          setBio(p.bio || '');
          setTimezone(p.timezone || 'UTC');
          setHeadline(p.headline || '');
          setWebsiteUrl(p.website_url || '');
          setLinkedinUrl(p.linkedin_url || '');
          setXUrl(p.x_url || '');
        }
        setEnvError(null);
      } catch (err: any) {
        console.error('Load profile error:', err);
        setEnvError(err?.message || 'Failed to load profile');
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const updates = {
        full_name: fullName,
        bio,
        timezone,
        headline,
        website_url: websiteUrl,
        linkedin_url: linkedinUrl,
        x_url: xUrl,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', session.user.id);

      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      alert(err?.message || 'Failed to save profile');
    }
    setSaving(false);
  }

  if (envError?.startsWith('Supabase is not configured')) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
          <p className="text-amber-700 text-sm">{envError}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <header className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-500">Manage your profile and scheduling preferences.</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <><CheckCircle2 size={16} /> Saved!</> : <><Save size={16} /> Save All</>}
        </button>
      </header>

      {saved && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-700 text-sm">
          <CheckCircle2 size={18} /> Settings saved successfully!
        </div>
      )}

      {/* Profile Section */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><User size={18} className="text-indigo-500" /> Profile</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Full Name</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Email</label>
              <input type="email" value={profile?.email || ''} disabled
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500 cursor-not-allowed" />
              <p className="text-xs text-slate-400 mt-1">Email managed by Supabase Auth</p>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Headline</label>
            <input type="text" value={headline} onChange={e => setHeadline(e.target.value)}
              placeholder="e.g. Senior Full-Stack Engineer & UX Strategist"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Bio</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Timezone</label>
            <select value={timezone} onChange={e => setTimezone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white">
              {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Profile Slug</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">/</span>
              <input type="text" value={profile?.slug || ''} disabled
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500 font-mono cursor-not-allowed" />
            </div>
            <p className="text-xs text-slate-400 mt-1">Slug is set at signup and cannot be changed here yet.</p>
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Social Links</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Website</label>
            <input type="url" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)}
              placeholder="https://yourwebsite.com"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">LinkedIn</label>
            <input type="url" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/yourname"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">X / Twitter</label>
            <input type="url" value={xUrl} onChange={e => setXUrl(e.target.value)}
              placeholder="https://x.com/yourhandle"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
          </div>
        </div>
      </div>

      {/* Scheduling Defaults — TEMPORARY: still localStorage */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-6 opacity-75">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-500">Scheduling Defaults</h2>
          <span className="px-2 py-0.5 bg-amber-100 text-amber-600 text-[10px] font-bold uppercase rounded">Local storage — Supabase migration pending</span>
        </div>
        <p className="text-sm text-slate-400">
          Min notice, buffer times, and max bookings per day are currently stored locally.
          These will migrate to Supabase in a future phase.
        </p>
      </div>

      {/* Testimonials — TEMPORARY: still localStorage */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-6 opacity-75">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-500">Testimonials</h2>
          <span className="px-2 py-0.5 bg-amber-100 text-amber-600 text-[10px] font-bold uppercase rounded">Local storage — Supabase migration pending</span>
        </div>
        <p className="text-sm text-slate-400">
          Testimonials are currently stored locally. These will migrate to Supabase in a future phase.
        </p>
      </div>
    </div>
  );
}

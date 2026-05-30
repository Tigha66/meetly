
'use client';

import React, { useState } from 'react';
import { User, Save, RefreshCw, Globe, Clock, Shield, CheckCircle2, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai',
  'Asia/Kolkata', 'Australia/Sydney', 'Pacific/Auckland',
];

export default function SettingsPage() {
  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem('meetly_profile') || '{}'); }
    catch { return {}; }
  });
  const [settings, setSettings] = useState(() => {
    try { return JSON.parse(localStorage.getItem('meetly_global_settings') || '{}'); }
    catch { return {}; }
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [fullName, setFullName] = useState(profile.full_name || 'Abdelhak');
  const [email, setEmail] = useState(profile.email || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [timezone, setTimezone] = useState(profile.timezone || 'UTC');
  const [minNotice, setMinNotice] = useState(settings.min_notice_hours ?? 24);
  const [bufferBefore, setBufferBefore] = useState(settings.default_buffer_before ?? 0);
  const [bufferAfter, setBufferAfter] = useState(settings.default_buffer_after ?? 0);
  const [maxDaily, setMaxDaily] = useState(settings.max_bookings_per_day ?? 10);
  const [socials, setSocials] = useState(profile.socials || []);
  const [testimonials, setTestimonials] = useState(profile.testimonials || []);
  const [newSoc, setNewSoc] = useState({ platform: '', url: '' });

  function handleSave() {
    setSaving(true);
    const updatedProfile = { ...profile, full_name: fullName, email, bio, timezone, socials, testimonials };
    const updatedSettings = { ...settings, min_notice_hours: minNotice, default_buffer_before: bufferBefore, default_buffer_after: bufferAfter, max_bookings_per_day: maxDaily };
    localStorage.setItem('meetly_profile', JSON.stringify(updatedProfile));
    localStorage.setItem('meetly_global_settings', JSON.stringify(updatedSettings));
    setProfile(updatedProfile);
    setSettings(updatedSettings);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function addSocial() {
    if (!newSoc.platform || !newSoc.url) return;
    setSocials([...socials, { ...newSoc }]);
    setNewSoc({ platform: '', url: '' });
  }

  function removeSocial(i: number) {
    setSocials(socials.filter((_: any, idx: number) => idx !== i));
  }

  function addTestimonial() {
    setTestimonials([...testimonials, { name: '', role: '', text: '', avatar: '' }]);
  }

  function updateTestimonial(i: number, field: string, value: string) {
    const updated = [...testimonials];
    (updated[i] as any)[field] = value;
    setTestimonials(updated);
  }

  function removeTestimonial(i: number) {
    setTestimonials(testimonials.filter((_: any, idx: number) => idx !== i));
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
          {saved ? <><CheckCircle2 size={16} /> Saved!</> : <><Save size={16} /> Save All</>}
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
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            </div>
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
        </div>
      </div>

      {/* Scheduling Defaults */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><Clock size={18} className="text-indigo-500" /> Scheduling Defaults</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Min Notice (hours)</label>
            <input type="number" value={minNotice} onChange={e => setMinNotice(Number(e.target.value))} min={0}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Max Bookings/Day</label>
            <input type="number" value={maxDaily} onChange={e => setMaxDaily(Number(e.target.value))} min={1}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Buffer Before (min)</label>
            <input type="number" value={bufferBefore} onChange={e => setBufferBefore(Number(e.target.value))} min={0}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Buffer After (min)</label>
            <input type="number" value={bufferAfter} onChange={e => setBufferAfter(Number(e.target.value))} min={0}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><Globe size={18} className="text-indigo-500" /> Social Links</h2>
        <div className="space-y-2 mb-3">
          {socials.map((s: any, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <span className="px-3 py-2 bg-slate-100 rounded-lg text-sm font-medium min-w-[100px]">{s.platform}</span>
              <span className="text-sm text-slate-500 truncate flex-1">{s.url}</span>
              <button onClick={() => removeSocial(i)} className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg"><X size={14} /></button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="text" value={newSoc.platform} onChange={e => setNewSoc({ ...newSoc, platform: e.target.value })}
            placeholder="Platform (e.g. twitter)" className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
          <input type="url" value={newSoc.url} onChange={e => setNewSoc({ ...newSoc, url: e.target.value })}
            placeholder="https://..." className="flex-[2] px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
          <button onClick={addSocial} className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all"><Plus size={18} /></button>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Shield size={18} className="text-indigo-500" /> Testimonials</h2>
          <button onClick={addTestimonial} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-all">
            + Add
          </button>
        </div>
        <div className="space-y-4">
          {testimonials.map((t: any, i: number) => (
            <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">Testimonial {i + 1}</span>
                <button onClick={() => removeTestimonial(i)} className="p-1 text-slate-400 hover:text-rose-500 rounded"><X size={14} /></button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input type="text" value={t.name} onChange={e => updateTestimonial(i, 'name', e.target.value)}
                  placeholder="Name" className="px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                <input type="text" value={t.role} onChange={e => updateTestimonial(i, 'role', e.target.value)}
                  placeholder="Role" className="px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <textarea value={t.text} onChange={e => updateTestimonial(i, 'text', e.target.value)}
                placeholder="Quote text..." rows={2}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
              <input type="url" value={t.avatar} onChange={e => updateTestimonial(i, 'avatar', e.target.value)}
                placeholder="Avatar URL (https://...)" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          ))}
          {testimonials.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No testimonials yet. Add one above!</p>}
        </div>
      </div>
    </div>
  );
}

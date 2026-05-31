'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit3, Trash2, ToggleLeft, ToggleRight, X, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { validateSupabaseEnv } from '@/lib/supabase/env';

interface EventType {
  id: string;
  user_id: string;
  slug: string;
  title: string;
  description: string;
  duration_minutes: number;
  location_type: string;
  location_value: string;
  color: string;
  is_active: boolean;
  is_public: boolean;
}

const COLORS = ['#4f46e5', '#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'];

export default function EventTypesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [envError, setEnvError] = useState<string | null>(null);
  const [events, setEvents] = useState<EventType[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<EventType | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', duration_minutes: 30, description: '', color: '#4f46e5' });

  const loadEvents = useCallback(async () => {
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

      const { data, error } = await supabase
        .from('event_types')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
      setEnvError(null);
    } catch (err: any) {
      console.error('Load event types error:', err);
      setEnvError(err?.message || 'Failed to load event types');
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  function openCreate() {
    setForm({ name: '', slug: '', duration_minutes: 30, description: '', color: '#4f46e5' });
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(e: EventType) {
    setForm({ name: e.title, slug: e.slug, duration_minutes: e.duration_minutes, description: e.description, color: e.color });
    setEditing(e);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) return;
    setSaving(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      if (editing) {
        const { error } = await supabase
          .from('event_types')
          .update({
            slug: form.slug,
            title: form.name,
            description: form.description,
            duration_minutes: form.duration_minutes,
            color: form.color,
          })
          .eq('id', editing.id)
          .eq('user_id', session.user.id); // safety: only update own
        if (error) throw error;
      } else {
        const { error } = await supabase.from('event_types').insert({
          user_id: session.user.id,
          slug: form.slug,
          title: form.name,
          description: form.description,
          duration_minutes: form.duration_minutes,
          color: form.color,
          location_type: 'video',
          is_active: true,
          is_public: true,
        });
        if (error) throw error;
      }

      setShowForm(false);
      await loadEvents();
    } catch (err: any) {
      alert(err?.message || 'Failed to save event type');
    }
    setSaving(false);
  }

  async function toggleActive(evt: EventType) {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { error } = await supabase
        .from('event_types')
        .update({ is_active: !evt.is_active })
        .eq('id', evt.id)
        .eq('user_id', session.user.id);
      if (error) throw error;
      await loadEvents();
    } catch (err: any) {
      alert(err?.message || 'Failed to update');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this event type? This cannot be undone.')) return;
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { error } = await supabase
        .from('event_types')
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id);
      if (error) throw error;
      await loadEvents();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete');
    }
  }

  if (envError?.startsWith('Supabase is not configured')) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
          <p className="text-amber-700 text-sm">{envError}</p>
          <p className="text-amber-600 text-xs mt-2">Add Supabase env vars to Vercel and redeploy.</p>
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
    <div className="p-8 max-w-5xl mx-auto">
      <header className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Event Types</h1>
          <p className="text-slate-500">Create and manage your booking events.</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-sm">
          <Plus size={16} /> New Event
        </button>
      </header>

      {showForm && (
        <div className="mb-8 p-6 bg-white border border-slate-200 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">{editing ? 'Edit Event' : 'Create New Event'}</h3>
            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-lg"><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Event Name</label>
                <input
                  type="text" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') })}
                  placeholder="e.g. 30-minute Consultation"
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Duration (minutes)</label>
                <select
                  value={form.duration_minutes}
                  onChange={e => setForm({ ...form, duration_minutes: Number(e.target.value) })}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-sm"
                >
                  {[15, 30, 45, 60, 90, 120].map(d => <option key={d} value={d}>{d} minutes</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Slug (URL path)</label>
              <input
                type="text" value={form.slug}
                onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                placeholder="e.g. consultation"
                className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-sm font-mono"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="What is this meeting about?"
                rows={2}
                className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Color</label>
              <div className="flex gap-2">
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                    className={cn('w-8 h-8 rounded-full transition-all', form.color === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-110')}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <button type="submit" disabled={saving}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check size={16} />}
              {editing ? 'Save Changes' : 'Create Event'}
            </button>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {events.map(evt => (
          <div key={evt.id} className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-3 h-12 rounded-full" style={{ backgroundColor: evt.color }} />
              <div>
                <h3 className="font-bold text-slate-900">{evt.title}</h3>
                <p className="text-sm text-slate-500">{evt.duration_minutes}{evt.description ? ` min • ${evt.description}` : ' min'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => toggleActive(evt)}
                className={cn('p-2 rounded-lg transition-all', evt.is_active ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-50')}
                title={evt.is_active ? 'Active — click to deactivate' : 'Inactive — click to activate'}>
                {evt.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
              </button>
              <button onClick={() => openEdit(evt)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                <Edit3 size={16} />
              </button>
              <button onClick={() => handleDelete(evt.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            No event types yet. Create your first one above!
          </div>
        )}
      </div>
    </div>
  );
}


'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit3, Trash2, ToggleLeft, ToggleRight, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import {
  initDefaults, getEventTypes, addEventType, updateEventType, deleteEventType,
  type MeetlyEventType
} from '@/lib/storage';

const COLORS = ['#4f46e5', '#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'];

export default function EventTypesPage() {
  const [events, setEvents] = useState<MeetlyEventType[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MeetlyEventType | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', duration_minutes: 30, description: '', color: '#4f46e5' });

  const load = useCallback(() => {
    initDefaults();
    setEvents(getEventTypes());
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setForm({ name: '', slug: '', duration_minutes: 30, description: '', color: '#4f46e5' });
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(e: MeetlyEventType) {
    setForm({ name: e.name, slug: e.slug, duration_minutes: e.duration_minutes, description: e.description, color: e.color });
    setEditing(e);
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) return;

    if (editing) {
      updateEventType(editing.id, form);
    } else {
      addEventType({ ...form, host_id: 'host_1', is_active: true });
    }
    setShowForm(false);
    load();
  }

  function toggleActive(e: MeetlyEventType) {
    updateEventType(e.id, { is_active: !e.is_active });
    load();
  }

  function handleDelete(id: string) {
    if (confirm('Delete this event type? This cannot be undone.')) {
      deleteEventType(id);
      load();
    }
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
              <p className="text-xs text-slate-400 mt-1">Your booking URL: meetly.app/abdelhak/{form.slug || '...'}</p>
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
                  <button
                    key={c} type="button"
                    onClick={() => setForm({ ...form, color: c })}
                    className={cn('w-8 h-8 rounded-full transition-all', form.color === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-110')}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <button type="submit" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all flex items-center gap-2">
              <Check size={16} /> {editing ? 'Save Changes' : 'Create Event'}
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
                <h3 className="font-bold text-slate-900">{evt.name}</h3>
                <p className="text-sm text-slate-500">{evt.duration_minutes} min &bull; {evt.description || 'No description'}</p>
                <p className="text-xs text-slate-400 font-mono mt-1">/book/abdelhak/{evt.slug}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleActive(evt)}
                className={cn('p-2 rounded-lg transition-all', evt.is_active ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-50')}
                title={evt.is_active ? 'Active — click to deactivate' : 'Inactive — click to activate'}
              >
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

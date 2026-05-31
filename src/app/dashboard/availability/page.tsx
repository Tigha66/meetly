'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { validateSupabaseEnv } from '@/lib/supabase/env';

interface AvailabilityRule {
  id: string;
  user_id: string;
  event_type_id: string | null;
  day_of_week: number;
  start_time: string;
  end_time: string;
  timezone: string;
  is_active: boolean;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function timeToMins(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function minsToTime(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

const TIME_OPTIONS: string[] = [];
for (let m = 0; m < 1440; m += 30) {
  TIME_OPTIONS.push(minsToTime(m));
}

const DEFAULT_RULES: AvailabilityRule[] = Array.from({ length: 7 }, (_, i) => ({
  id: `default_${i}`,
  user_id: '',
  event_type_id: null,
  day_of_week: i,
  start_time: '09:00',
  end_time: '17:00',
  timezone: 'UTC',
  is_active: i >= 1 && i <= 5, // Mon-Fri default
}));

export default function AvailabilityPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [envError, setEnvError] = useState<string | null>(null);
  const [rules, setRules] = useState<AvailabilityRule[]>(DEFAULT_RULES);

  const loadRules = useCallback(async () => {
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
        .from('availability_rules')
        .select('*')
        .eq('user_id', session.user.id)
        .order('day_of_week', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setRules(data);
      }
      // If no rules exist, keep defaults (they'll be saved on first save)
      setEnvError(null);
    } catch (err: any) {
      console.error('Load availability error:', err);
      setEnvError(err?.message || 'Failed to load availability');
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadRules(); }, [loadRules]);

  function toggleDay(dayOfWeek: number) {
    setRules(rules.map(r =>
      r.day_of_week === dayOfWeek ? { ...r, is_active: !r.is_active } : r
    ));
    setSaved(false);
  }

  function updateTime(dayOfWeek: number, field: 'start_time' | 'end_time', value: string) {
    setRules(rules.map(r =>
      r.day_of_week === dayOfWeek ? { ...r, [field]: value } : r
    ));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const userId = session.user.id;

      // Upsert each rule
      for (const rule of rules) {
        const { id, user_id, ...ruleData } = rule;

        // Check if rule exists in Supabase
        const { data: existing } = await supabase
          .from('availability_rules')
          .select('id')
          .eq('user_id', userId)
          .eq('day_of_week', rule.day_of_week)
          .maybeSingle();

        if (existing) {
          // Update existing
          await supabase
            .from('availability_rules')
            .update({ ...ruleData, user_id: userId })
            .eq('id', existing.id);
        } else {
          // Insert new
          await supabase
            .from('availability_rules')
            .insert({ ...ruleData, user_id: userId });
        }
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      await loadRules(); // Reload to get real IDs
    } catch (err: any) {
      alert(err?.message || 'Failed to save availability');
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
    <div className="p-8 max-w-4xl mx-auto">
      <header className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Availability</h1>
          <p className="text-slate-500">Set when you are available for bookings.</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <>Saved!</> : <><Save size={16} /> Save</>}
        </button>
      </header>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <div className="col-span-3">Day</div>
          <div className="col-span-3">Start</div>
          <div className="col-span-3">End</div>
          <div className="col-span-3 text-right">Active</div>
        </div>
        <div className="divide-y divide-slate-100">
          {DAYS.map((day, idx) => {
            const rule = rules.find(r => r.day_of_week === idx) || DEFAULT_RULES[idx];
            const endOptions = TIME_OPTIONS.filter(t => timeToMins(t) > timeToMins(rule.start_time));
            return (
              <div key={idx} className={cn('grid grid-cols-12 px-6 py-4 items-center transition-colors', rule.is_active ? 'bg-white' : 'bg-slate-50/50')}>
                <div className="col-span-3 font-medium text-sm text-slate-900">{day}</div>
                <div className="col-span-3">
                  <select
                    value={rule.start_time}
                    onChange={e => updateTime(idx, 'start_time', e.target.value)}
                    disabled={!rule.is_active}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white disabled:opacity-50 disabled:bg-slate-100 outline-none"
                  >
                    {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="col-span-3">
                  <select
                    value={rule.end_time}
                    onChange={e => updateTime(idx, 'end_time', e.target.value)}
                    disabled={!rule.is_active}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white disabled:opacity-50 disabled:bg-slate-100 outline-none"
                  >
                    {endOptions.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="col-span-3 text-right">
                  <button
                    onClick={() => toggleDay(idx)}
                    className={cn('relative inline-flex h-6 w-11 items-center rounded-full transition-colors', rule.is_active ? 'bg-indigo-600' : 'bg-slate-200')}
                  >
                    <span className={cn('inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm', rule.is_active ? 'translate-x-6' : 'translate-x-1')} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

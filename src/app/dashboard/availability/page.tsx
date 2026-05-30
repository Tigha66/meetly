
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Save, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { initDefaults, getAvailability, updateAvailability, type MeetlyAvailabilityRule } from '@/lib/storage';

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

export default function AvailabilityPage() {
  const [rules, setRules] = useState<MeetlyAvailabilityRule[]>([]);
  const [saved, setSaved] = useState(false);

  const load = useCallback(() => {
    initDefaults();
    setRules(getAvailability());
  }, []);

  useEffect(() => { load(); }, [load]);

  function toggleDay(dayOfWeek: number) {
    setRules(rules.map(r =>
      r.day_of_week === dayOfWeek ? { ...r, is_enabled: !r.is_enabled } : r
    ));
    setSaved(false);
  }

  function updateTime(dayOfWeek: number, field: 'start_time' | 'end_time', value: string) {
    setRules(rules.map(r =>
      r.day_of_week === dayOfWeek ? { ...r, [field]: value } : r
    ));
    setSaved(false);
  }

  function applyToAll(start: string, end: string) {
    setRules(rules.map(r => ({ ...r, start_time: start, end_time: end, is_enabled: true })));
    setSaved(false);
  }

  function handleSave() {
    rules.forEach(r => updateAvailability(r));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Availability</h1>
          <p className="text-slate-500">Set when you are available for bookings.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => applyToAll('09:00', '17:00')} className="px-3 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all">
            Set All 9-5
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-sm">
            {saved ? <><RefreshCw size={14} /> Saved!</> : <><Save size={16} /> Save</>}
          </button>
        </div>
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
            const rule = rules.find(r => r.day_of_week === idx) || {
              id: `avail_${idx}`,
              host_id: 'host_1',
              day_of_week: idx,
              start_time: '09:00',
              end_time: '17:00',
              is_enabled: false,
            };
            const endOptions = TIME_OPTIONS.filter(t => timeToMins(t) > timeToMins(rule.start_time));
            return (
              <div key={idx} className={cn('grid grid-cols-12 px-6 py-4 items-center transition-colors', rule.is_enabled ? 'bg-white' : 'bg-slate-50/50')}>
                <div className="col-span-3 font-medium text-sm text-slate-900">{day}</div>
                <div className="col-span-3">
                  <select
                    value={rule.start_time}
                    onChange={e => updateTime(idx, 'start_time', e.target.value)}
                    disabled={!rule.is_enabled}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white disabled:opacity-50 disabled:bg-slate-100 outline-none"
                  >
                    {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="col-span-3">
                  <select
                    value={rule.end_time}
                    onChange={e => updateTime(idx, 'end_time', e.target.value)}
                    disabled={!rule.is_enabled}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white disabled:opacity-50 disabled:bg-slate-100 outline-none"
                  >
                    {endOptions.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="col-span-3 text-right">
                  <button
                    onClick={() => toggleDay(idx)}
                    className={cn('relative inline-flex h-6 w-11 items-center rounded-full transition-colors', rule.is_enabled ? 'bg-indigo-600' : 'bg-slate-200')}
                  >
                    <span className={cn('inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm', rule.is_enabled ? 'translate-x-6' : 'translate-x-1')} />
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

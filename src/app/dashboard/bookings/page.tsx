'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { format, parseISO, isPast } from 'date-fns';
import { Calendar, RefreshCw, XCircle, Loader2 } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { validateSupabaseEnv } from '@/lib/supabase/env';

interface DashboardBooking {
  id: string;
  guest_name: string;
  guest_email: string;
  start_time: string;
  status: string;
  event_name: string;
}

export default function BookingsPage() {
  const [loading, setLoading] = useState(true);
  const [envError, setEnvError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<DashboardBooking[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadBookings = useCallback(async () => {
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
        .from('bookings')
        .select(`
          id, guest_name, guest_email, start_time, status,
          event_types (name)
        `)
        .eq('host_user_id', session.user.id)
        .order('start_time', { ascending: true });

      if (error) throw error;

      setBookings(
        (data || []).map((b: any) => ({
          id: b.id,
          guest_name: b.guest_name,
          guest_email: b.guest_email,
          start_time: b.start_time,
          status: b.status,
          event_name: b.event_types?.name || 'Event',
        }))
      );
      setEnvError(null);
    } catch (err: any) {
      console.error('Load bookings error:', err);
      setEnvError(err?.message || 'Failed to load bookings');
    }
    setLoading(false);
  }, [refreshKey]);

  useEffect(() => { loadBookings(); }, [loadBookings]);

  async function handleCancel(id: string) {
    if (!confirm('Cancel this booking?')) return;
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
        .eq('id', id)
        .eq('host_user_id', session.user.id);
      if (error) throw error;
      await loadBookings();
    } catch (err: any) {
      alert(err?.message || 'Failed to cancel booking');
    }
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
    <div className="p-8 max-w-6xl mx-auto">
      <header className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Bookings</h1>
          <p className="text-slate-500">All your appointments from Supabase.</p>
        </div>
        <button onClick={() => { setLoading(true); setRefreshKey(k => k + 1); }} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all">
          <RefreshCw size={16} className="text-slate-500" />
        </button>
      </header>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="hidden md:grid grid-cols-12 px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <div className="col-span-3">Guest</div>
          <div className="col-span-2">Event</div>
          <div className="col-span-3">Date &amp; Time</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
        <div className="divide-y divide-slate-100">
          {bookings.length === 0 ? (
            <div className="px-6 py-16 text-center text-slate-400">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-200" />
              <p className="font-medium">No bookings yet</p>
              <p className="text-sm mt-1">Share your booking page and guests will appear here.</p>
            </div>
          ) : (
            bookings.map(booking => {
              const date = parseISO(booking.start_time);
              const past = isPast(date);
              return (
                <div key={booking.id} className="grid grid-cols-1 md:grid-cols-12 px-6 py-4 items-center hover:bg-slate-50 transition-colors gap-2 md:gap-0">
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs shrink-0">
                      {booking.guest_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{booking.guest_name}</p>
                      <p className="text-xs text-slate-500 truncate">{booking.guest_email}</p>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm text-slate-700 font-medium">{booking.event_name}</span>
                  </div>
                  <div className="col-span-3 text-sm text-slate-600">
                    {format(date, 'EEE, MMM d, yyyy')} at {format(date, 'h:mm a')}
                  </div>
                  <div className="col-span-2">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                      booking.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                      past ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {booking.status === 'cancelled' ? 'Cancelled' : past ? 'Completed' : 'Confirmed'}
                    </span>
                  </div>
                  <div className="col-span-2 text-right">
                    {booking.status === 'confirmed' && !past && (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="Cancel"
                      >
                        <XCircle size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, ArrowUpRight, CalendarDays, RefreshCw, Loader2, Settings, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { format, parseISO, isPast } from 'date-fns';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { validateSupabaseEnv } from '@/lib/supabase/env';

interface DashboardProfile {
  id: string;
  full_name: string;
  email: string;
  slug: string;
  timezone: string;
}

interface DashboardBooking {
  id: string;
  guest_name: string;
  guest_email: string;
  start_time: string;
  status: string;
  event_name?: string;
}

export default function DashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [envError, setEnvError] = useState<string | null>(null);
  const [profile, setProfile] = useState<DashboardProfile | null>(null);
  const [bookings, setBookings] = useState<DashboardBooking[]>([]);
  const [eventCount, setEventCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadData = useCallback(async () => {
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

      const userId = session.user.id;

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, full_name, email, slug, timezone')
        .eq('id', userId)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch event types count
      const { count: evtCount } = await supabase
        .from('event_types')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_active', true);
      setEventCount(evtCount || 0);

      // Fetch upcoming bookings with event type names
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select(`
          id, guest_name, guest_email, start_time, status,
          event_types (name)
        `)
        .eq('host_user_id', userId)
        .eq('status', 'confirmed')
        .order('start_time', { ascending: true })
        .limit(10);

      if (bookingsData) {
        setBookings(
          bookingsData.map((b: any) => ({
            id: b.id,
            guest_name: b.guest_name,
            guest_email: b.guest_email,
            start_time: b.start_time,
            status: b.status,
            event_name: b.event_types?.name || 'Event',
          }))
        );
      }

      setEnvError(null);
    } catch (err: any) {
      console.error('Dashboard data load error:', err);
      setEnvError('Failed to load dashboard data. ' + (err?.message || ''));
    }

    setLoading(false);
  }, [refreshKey]);

  useEffect(() => { loadData(); }, [loadData]);

  // Env var missing state
  if (envError && envError !== 'not-authenticated') {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="w-6 h-6 text-amber-600" />
          </div>
          <h2 className="text-lg font-bold text-amber-900 mb-2">Supabase Not Configured</h2>
          <p className="text-amber-700 text-sm mb-4">{envError}</p>
          <div className="bg-white rounded-xl p-4 text-left text-xs text-slate-600 space-y-2">
            <p className="font-semibold">To fix this:</p>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Create a Supabase project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">supabase.com</a></li>
              <li>Get your URL and anon key from Settings → API</li>
              <li>Add them to Vercel environment variables:
                <code className="block bg-slate-50 p-2 rounded mt-1 font-mono">NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co<br/>NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...</code>
              </li>
              <li>Run the SQL migration in <code className="bg-slate-50 px-1 rounded">SUPABASE_SCHEMA.sql</code> in Supabase SQL editor</li>
              <li>Run the RLS migration in <code className="bg-slate-50 px-1 rounded">supabase/migrations/001_rls_policies.sql</code></li>
              <li>Redeploy and sign up</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  // Not authenticated (shouldn't happen due to proxy, but safe fallback)
  if (envError === 'not-authenticated' || !profile) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center">
          <p className="text-slate-600 mb-4">Please sign in to view your dashboard.</p>
          <a href="/login" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  const upcomingCount = bookings.filter(b => !isPast(parseISO(b.start_time))).length;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://meetly-6vwn.vercel.app';

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome back, {profile.full_name.split(' ')[0]}!</h1>
          <p className="text-slate-500">Here is what is happening with your bookings.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setLoading(true); setRefreshKey(k => k + 1); }}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all"
            title="Refresh"
          >
            <RefreshCw size={16} className="text-slate-500" />
          </button>
          <a
            href="/dashboard/event-types"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-sm"
          >
            <Plus size={16} />
            New Event Type
          </a>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard label="Upcoming Bookings" value={String(upcomingCount)} sub="Next appointments" />
        <StatCard label="Active Events" value={String(eventCount)} sub="Live on your page" />
        <StatCard label="Calendar" value="Coming Soon" sub="Google Calendar sync" status="neutral" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bookings Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Upcoming Bookings</h3>
            <a href="/dashboard/bookings" className="text-xs font-medium text-indigo-600 hover:underline">View all</a>
          </div>
          <div className="divide-y divide-slate-100">
            {bookings.length === 0 ? (
              <div className="px-6 py-12 text-center text-slate-400 text-sm">
                No upcoming bookings yet. Share your booking link to get started!
              </div>
            ) : (
              bookings.slice(0, 5).map(booking => (
                <BookingRow key={booking.id} booking={booking} />
              ))
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-6">
          <div className="p-6 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform">
              <CalendarDays size={120} strokeWidth={1} />
            </div>
            <h3 className="text-lg font-bold mb-2 relative z-10">Your Booking Page</h3>
            <p className="text-indigo-100 text-sm mb-6 relative z-10">Share your link to receive bookings.</p>
            <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/20 relative z-10">
              <span className="text-sm font-mono truncate flex-1">{appUrl}/{profile.slug}/...</span>
              <a href={`/book/${profile.slug}`} target="_blank" className="p-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors">
                <ArrowUpRight size={16} />
              </a>
            </div>
          </div>

          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <a href="/dashboard/availability" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all border border-transparent hover:border-slate-200">
                <CalendarDays size={18} className="text-slate-400" />
                Update Availability
              </a>
              <a href="/dashboard/settings" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all border border-transparent hover:border-slate-200">
                <CheckCircle2 size={18} className="text-slate-400" />
                Edit Profile
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, status }: { label: string; value: string; sub: string; status?: string }) {
  return (
    <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
      <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
      <h4 className="text-2xl font-bold text-slate-900 mb-2">{value}</h4>
      <p className="text-xs text-slate-400">{sub}</p>
    </div>
  );
}

function BookingRow({ booking }: { booking: DashboardBooking }) {
  const date = parseISO(booking.start_time);
  return (
    <div className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs shrink-0">
          {booking.guest_name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">{booking.guest_name}</p>
          <p className="text-xs text-slate-500 truncate">{booking.guest_email}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <div className="text-right">
          <p className="text-xs font-semibold text-slate-700">{booking.event_name}</p>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>{format(date, 'MMM d, yyyy')}</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full" />
            <span>{format(date, 'h:mm a')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

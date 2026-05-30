
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, ArrowUpRight, Trash2, CheckCircle2, XCircle, CalendarDays, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { format, parseISO, isPast } from 'date-fns';
import {
  initDefaults, getUpcomingBookings, getEventTypes, getCalendarConnection,
  cancelBooking, type MeetlyBooking, type MeetlyEventType
} from '@/lib/storage';

export default function DashboardOverview() {
  const [bookings, setBookings] = useState<MeetlyBooking[]>([]);
  const [events, setEvents] = useState<MeetlyEventType[]>([]);
  const [calStatus, setCalStatus] = useState({ connected: false, email: null as string | null });
  const [refreshKey, setRefreshKey] = useState(0);

  const loadData = useCallback(() => {
    initDefaults();
    setBookings(getUpcomingBookings('host_1'));
    setEvents(getEventTypes().filter(e => e.is_active));
    setCalStatus(getCalendarConnection());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData, refreshKey]);

  function handleCancel(id: string) {
    if (confirm('Cancel this booking?')) {
      cancelBooking(id);
      setRefreshKey(k => k + 1);
    }
  }

  const totalBookings = bookings.length;
  const upcomingCount = bookings.filter(b => !isPast(parseISO(b.start_time))).length;
  const activeEvents = events.length;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome back!</h1>
          <p className="text-slate-500">Here is what is happening with your bookings.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setRefreshKey(k => k + 1)}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard label="Upcoming Bookings" value={String(upcomingCount)} change="Next 7 days" trend="neutral" />
        <StatCard label="Total Confirmed" value={String(totalBookings)} change="All time" trend="neutral" />
        <StatCard label="Active Events" value={String(activeEvents)} change="Live on your page" trend="neutral" />
        <StatCard
          label="Calendar"
          value={calStatus.connected ? 'Connected' : 'Not Connected'}
          change={calStatus.connected ? calStatus.email || 'Google sync active' : 'Click to connect'}
          trend={calStatus.connected ? 'up' : 'neutral'}
        />
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
              bookings.slice(0, 10).map(booking => {
                const evt = events.find(e => e.id === booking.event_type_id);
                return (
                  <BookingRow
                    key={booking.id}
                    booking={booking}
                    event={evt}
                    onCancel={() => handleCancel(booking.id)}
                  />
                );
              })
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
              <span className="text-sm font-mono truncate flex-1">meetly.app/abdelhak/intro-call</span>
              <a href="/book/abdelhak/intro-call" target="_blank" className="p-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors">
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
              <a href="/dashboard/integrations" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all border border-transparent hover:border-slate-200">
                <CheckCircle2 size={18} className="text-slate-400" />
                Connect Calendar
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, change, trend }: { label: string; value: string; change: string; trend: string }) {
  return (
    <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
      <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
      <h4 className="text-2xl font-bold text-slate-900 mb-2">{value}</h4>
      <div className={cn(
        'text-xs font-medium flex items-center gap-1',
        trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-rose-600' : 'text-slate-400'
      )}>
        {trend === 'up' && <ArrowUpRight size={12} />}
        {change}
      </div>
    </div>
  );
}

function BookingRow({ booking, event, onCancel }: { booking: MeetlyBooking; event?: MeetlyEventType; onCancel: () => void }) {
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
          <p className="text-xs font-semibold text-slate-700">{event?.name || 'Event'}</p>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>{format(date, 'MMM d, yyyy')}</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full" />
            <span>{format(date, 'h:mm a')}</span>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
          title="Cancel booking"
        >
          <XCircle size={16} />
        </button>
      </div>
    </div>
  );
}

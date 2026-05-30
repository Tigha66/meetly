
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { format, parseISO, isPast } from 'date-fns';
import { Calendar, RefreshCw, XCircle } from 'lucide-react';
import {
  initDefaults, getEventTypes, getBookingsForHost as getBookingsForHostFn, cancelBooking,
  type MeetlyBooking, type MeetlyEventType
} from '@/lib/storage';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<(MeetlyBooking & { event_name?: string })[]>([]);
  const [events, setEvents] = useState<MeetlyEventType[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const load = useCallback(() => {
    initDefaults();
    setEvents(getEventTypes());
    const evts = getEventTypes();
    const raw = getBookingsForHostFn('host_1')
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
    const enriched = raw.map(b => ({ ...b, event_name: evts.find(e => e.id === b.event_type_id)?.name || 'Event' }));
    setBookings(enriched);
  }, []);

  useEffect(() => { load(); }, [load, refreshKey]);

  function handleCancel(id: string) {
    if (confirm('Cancel this booking?')) {
      cancelBooking(id);
      setRefreshKey(k => k + 1);
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Bookings</h1>
          <p className="text-slate-500">All your confirmed appointments.</p>
        </div>
        <button onClick={() => setRefreshKey(k => k + 1)} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all">
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
              <a href="/book/abdelhak/intro-call" target="_blank" className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all">
                View Your Booking Page
              </a>
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

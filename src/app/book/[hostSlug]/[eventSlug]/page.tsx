'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  Calendar, Clock, CheckCircle, ChevronRight, ChevronLeft, Globe, User, Mail, FileText,
  ArrowLeft, Zap, RefreshCw, Shield, Hash, AtSign, AlertCircle, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { format, addDays, subDays, startOfDay, parseISO, isSameDay, isToday, getDay } from 'date-fns';
import { generateAvailableSlots } from '@/lib/scheduling';

/* ── Types ─────────────────────────────────────────────────── */

interface HostProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string;
  timezone: string;
  slug: string;
  bio: string | null;
}

interface EventType {
  id: string;
  host_id: string;
  name: string;
  slug: string;
  duration_minutes: number;
  description: string | null;
  color: string;
  is_active: boolean;
}

interface AvailabilityRule {
  id: string;
  host_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_enabled: boolean;
}

interface ConfirmedBooking {
  start_time: string;
  end_time: string;
}

type PageState =
  | { status: 'loading' }
  | { status: 'error'; code: string; message: string }
  | { status: 'ready'; host: HostProfile; eventTypes: EventType[]; rules: AvailabilityRule[] };

type BookingStep = 'select' | 'form' | 'done';

/* ── API helpers ───────────────────────────────────────────── */

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) {
    throw data;
  }
  return data as T;
}

/* ── Social icons ──────────────────────────────────────────── */

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  twitter: <AtSign size={16} />,
  linkedin: <Hash size={16} />,
  github: <Hash size={16} />,
  website: <Globe size={16} />,
};

/* ── Component ─────────────────────────────────────────────── */

interface Props {
  params: Promise<{ hostSlug: string; eventSlug: string }>;
}

export default function GuestBookingPage({ params }: Props) {
  const { hostSlug, eventSlug } = React.use(params);

  // Page-level state
  const [pageState, setPageState] = useState<PageState>({ status: 'loading' });

  // Booking interaction state
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; isoStart: string; isoEnd: string } | null>(null);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestNotes, setGuestNotes] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');
  const [conflict, setConflict] = useState('');
  const [bookings, setBookings] = useState<ConfirmedBooking[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<BookingStep>('select');

  // Load host data from Supabase on mount
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // Fetch profile, event types, and availability in parallel
        const [profileRes, eventsRes, availRes] = await Promise.all([
          fetchJson<{ profile: HostProfile }>(`/api/host/${hostSlug}`),
          fetchJson<{ eventTypes: EventType[] }>(`/api/host/${hostSlug}/events`),
          fetchJson<{ rules: AvailabilityRule[] }>(`/api/host/${hostSlug}/availability`),
        ]);

        if (cancelled) return;

        const host = profileRes.profile;
        const eventTypes = eventsRes.eventTypes.filter((e) => e.is_active);
        const rules = availRes.rules || [];

        if (eventTypes.length === 0 && !cancelled) {
          setPageState({
            status: 'error',
            code: 'NO_EVENT_TYPES',
            message: 'This host has not made any event types available yet.',
          });
          return;
        }

        if (!cancelled) {
          setPageState({ status: 'ready', host, eventTypes, rules });

          // Auto-select the event from URL param, or first available
          const fromUrl = eventTypes.find((e) => e.slug === eventSlug);
          if (fromUrl) {
            setSelectedEvent(fromUrl);
          } else if (eventTypes.length > 0) {
            setSelectedEvent(eventTypes[0]);
          }
        }
      } catch (err: any) {
        if (cancelled) return;

        const code = err?.error || err?.code || 'UNKNOWN';
        const message = err?.message || 'Something went wrong.';

        if (code === 'SUPABASE_NOT_CONFIGURED') {
          setPageState({
            status: 'error',
            code: 'SUPABASE_NOT_CONFIGURED',
            message:
              'Booking system is not yet fully configured. The site owner needs to connect the database.',
          });
        } else if (code === 'HOST_NOT_FOUND') {
          setPageState({
            status: 'error',
            code: 'HOST_NOT_FOUND',
            message: 'This booking link is invalid or the host profile does not exist.',
          });
        } else {
          setPageState({
            status: 'error',
            code: 'FETCH_ERROR',
            message: message || 'Failed to load booking data. Please try again later.',
          });
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [hostSlug, eventSlug]);

  // Load bookings for the host when ready (for slot conflict checking)
  const hostId = pageState.status === 'ready' ? pageState.host.id : null;

  const loadBookings = useCallback(async () => {
    if (!hostId) return;
    try {
      const from = startOfDay(new Date()).toISOString();
      const to = addDays(new Date(), 60).toISOString();
      const data = await fetchJson<{ bookings: ConfirmedBooking[] }>(
        `/api/bookings?hostId=${hostId}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
      );
      setBookings(data.bookings || []);
    } catch {
      // Non-critical: slot checking will just be best-effort
      console.warn('[Booking] Failed to load existing bookings');
    }
  }, [hostId]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // Redirect event when URL eventSlug doesn't match loaded events
  useEffect(() => {
    if (pageState.status !== 'ready') return;
    const fromUrl = pageState.eventTypes.find((e) => e.slug === eventSlug);
    if (fromUrl && (!selectedEvent || selectedEvent.slug !== eventSlug)) {
      setSelectedEvent(fromUrl);
    }
  }, [pageState, eventSlug, selectedEvent]);

  // ── Derived data (only when ready) ──
  const host = pageState.status === 'ready' ? pageState.host : null;
  const eventTypes = pageState.status === 'ready' ? pageState.eventTypes : [];
  const rules = pageState.status === 'ready' ? pageState.rules : [];

  const activeRules = useMemo(() => rules.filter((r) => r.is_enabled), [rules]);

  function getBookingsForDate(date: Date): number {
    const dayStart = startOfDay(date).getTime();
    return bookings.filter((b) => {
      const bt = new Date(b.start_time).getTime();
      return bt >= dayStart && bt < dayStart + 86400000;
    }).length;
  }

  const slots = useMemo(() => {
    if (!selectedEvent || pageState.status !== 'ready') return [];
    const dayBookings = getBookingsForDate(selectedDate);
    // Default: 24h notice, 10 max per day
    return generateAvailableSlots(
      activeRules,
      selectedEvent.duration_minutes,
      selectedDate,
      0, // buffer_before (not yet in schema)
      0, // buffer_after (not yet in schema)
      24, // min_notice_hours
      dayBookings,
      10 // max per day default
    );
  }, [selectedDate, selectedEvent, activeRules, bookings, pageState]);

  function isSlotTaken(isoStart: string): boolean {
    const start = new Date(isoStart).getTime();
    return bookings.some((b) => Math.abs(new Date(b.start_time).getTime() - start) < 60000);
  }

  // ── Event handlers ──

  function handleDateChange(d: Date) {
    setSelectedDate(d);
    setSelectedSlot(null);
  }

  function handleEventChange(evt: EventType) {
    setSelectedEvent(evt);
    setSelectedSlot(null);
    setStep('select');
  }

  function handleSlotSelect(slot: { start: string; isoStart: string; isoEnd: string }) {
    if (isSlotTaken(slot.isoStart)) return;
    setSelectedSlot(slot);
    setError('');
    setConflict('');
    setStep('form');
    setTimeout(() => {
      document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setConflict('');

    if (!guestName.trim()) { setError('Name is required'); return; }
    if (!guestEmail.trim() || !guestEmail.includes('@')) { setError('Valid email is required'); return; }
    if (!selectedSlot) { setError('Please select a time slot'); return; }
    if (!selectedEvent) { setError('No event selected'); return; }
    if (!host) { setError('Host data not loaded'); return; }

    setSubmitting(true);

    try {
      const res = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host_id: host.id,
          event_type_id: selectedEvent.id,
          guest_name: guestName.trim(),
          guest_email: guestEmail.trim(),
          guest_notes: guestNotes.trim(),
          start_time: selectedSlot.isoStart,
          end_time: selectedSlot.isoEnd,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setConfirmed(true);
        setStep('done');
        return;
      }

      // Handle known error codes
      switch (data.error) {
        case 'SLOT_TAKEN':
          setConflict('This slot was just taken. Please select another time.');
          // Refresh bookings so the slot shows as taken
          loadBookings();
          break;
        case 'SUPABASE_NOT_CONFIGURED':
          setError('The booking system is not yet fully configured. Please try again later.');
          break;
        case 'HOST_NOT_FOUND':
          setError('Host not found. This booking link may be invalid.');
          break;
        case 'EVENT_NOT_FOUND':
          setError('This event type no longer exists.');
          break;
        case 'EVENT_INACTIVE':
          setError('This event type is no longer available.');
          break;
        case 'OUTSIDE_AVAILABILITY':
          setError('The selected time is outside the host\'s availability.');
          break;
        case 'DURATION_MISMATCH':
          setError('Booking duration does not match the event type.');
          break;
        case 'PAST_SLOT':
          setError('Cannot book a time in the past.');
          break;
        case 'DUPLICATE_BOOKING':
          setConflict('This booking already exists.');
          break;
        default:
          setError(data.message || 'Failed to create booking. Please try again.');
      }
    } catch (err) {
      console.error('[Booking] Submit error:', err);
      setError('Failed to submit booking. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Render: Loading ──
  if (pageState.status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading booking page…</p>
        </div>
      </div>
    );
  }

  // ── Render: Error ──
  if (pageState.status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa] p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {pageState.code === 'HOST_NOT_FOUND'
              ? 'Booking Link Not Found'
              : pageState.code === 'SUPABASE_NOT_CONFIGURED'
                ? 'Booking System Not Ready'
                : pageState.code === 'NO_EVENT_TYPES'
                  ? 'No Events Available'
                  : 'Something Went Wrong'}
          </h1>
          <p className="text-slate-500 mb-6 leading-relaxed">{pageState.message}</p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all"
          >
            <ArrowLeft size={16} /> Back to Meetly
          </a>
        </div>
      </div>
    );
  }

  // From here: pageState.status === 'ready'
  const currentEvent = selectedEvent || eventTypes[0];
  if (!currentEvent) return null; // Shouldn't happen — caught in error state

  // ── Render: Confirmation ──
  if (step === 'done' && confirmed && selectedSlot) {
    const calDate = parseISO(selectedSlot.isoStart);
    const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(currentEvent.name + ' with ' + host!.full_name)}&dates=${format(calDate, 'yyyyMMdd')}T${format(calDate, 'HHmmss')}/${format(parseISO(selectedSlot.isoEnd), 'yyyyMMdd')}T${format(parseISO(selectedSlot.isoEnd), 'HHmmss')}&details=${encodeURIComponent(guestNotes || 'Meetly booking')}`;
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
        <div className="max-w-lg w-full">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-200 rounded-full animate-ping opacity-20" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl shadow-indigo-200">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">You&apos;re Booked!</h1>
            <p className="text-slate-500 mb-6">
              {guestName}, your <strong>{currentEvent.name}</strong> with {host!.full_name} is confirmed.
            </p>

            <div className="bg-slate-50 rounded-2xl p-5 mb-6 text-left space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <Calendar size={16} className="text-indigo-500" />
                <span className="text-slate-700">{format(calDate, 'EEEE, MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock size={16} className="text-indigo-500" />
                <span className="text-slate-700">{format(calDate, 'h:mm a')} ({currentEvent.duration_minutes} min)</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <User size={16} className="text-indigo-500" />
                <span className="text-slate-700">{host!.full_name}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail size={16} className="text-indigo-500" />
                <span className="text-slate-700">{guestEmail}</span>
              </div>
            </div>

            <div className="flex gap-3 mb-6">
              <a href={gCalUrl} target="_blank" rel="noopener noreferrer"
                className="flex-1 py-2.5 px-4 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-medium hover:bg-indigo-100 transition-all text-center">
                + Google Calendar
              </a>
              <a href={`data:text/calendar;charset=utf8,BEGIN:VCALENDAR%0AVERSION:2.0%0ABEGIN:VEVENT%0ADTSTART:${format(calDate, 'yyyyMMdd')}T${format(calDate, 'HHmmss')}%0ADTEND:${format(parseISO(selectedSlot.isoEnd), 'yyyyMMdd')}T${format(parseISO(selectedSlot.isoEnd), 'HHmmss')}%0ASUMMARY:${encodeURIComponent(currentEvent.name)}%0AEND:VEVENT%0AEND:VCALENDAR`}
                download="meetly-booking.ics"
                className="flex-1 py-2.5 px-4 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-all text-center">
                + Apple/Outlook
              </a>
            </div>

            <p className="text-xs text-slate-400 mb-6">Calendar invite saved to your device.</p>

            <a href={`/book/${host!.slug}/${currentEvent.slug}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
              <RefreshCw size={16} /> Book Another
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── Render: Main Booking Page ──
  const calendarDays = getCalendarDays(selectedDate);

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900">
      {/* Back */}
      <div className="px-6 pt-4">
        <a href="/" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-indigo-600 transition-colors">
          <ArrowLeft size={14} /> Back to Meetly
        </a>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-24">
        {/* === HOST HERO === */}
        <header className="py-10 text-center">
          <div className="relative inline-block mb-5">
            <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-indigo-100 shadow-xl mx-auto">
              <img
                src={host!.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(host!.slug)}`}
                alt={host!.full_name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-400 rounded-full border-[3px] border-[#fafafa]" title="Available" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{host!.full_name}</h1>
          {host!.bio && (
            <p className="text-slate-500 max-w-md mx-auto text-sm leading-relaxed">{host!.bio}</p>
          )}
          <div className="mt-3 flex items-center justify-center gap-1 text-xs text-slate-400">
            <Globe size={12} /> {host!.timezone}
          </div>
        </header>

        {/* === TRUST BAR — only verified items === */}
        <div className="flex items-center justify-center gap-6 py-4 mb-10 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="text-indigo-500"><Zap size={14} /></span> Instant confirmation
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="text-indigo-500"><Globe size={14} /></span> Timezone aware ({host!.timezone})
          </div>
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <Shield size={14} className="text-slate-300" /> Encrypted & private <span className="px-1.5 py-0.5 bg-slate-100 text-slate-400 text-[9px] font-bold uppercase rounded">Soon</span>
          </span>
        </div>

        {/* === EVENT TYPE SELECTOR === */}
        {eventTypes.length > 1 && (
          <div className="mb-10">
            <h2 className="text-center text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Select an Event</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 justify-center flex-wrap">
              {eventTypes.map((evt) => (
                <button
                  key={evt.id}
                  onClick={() => handleEventChange(evt)}
                  className={cn(
                    'flex items-center gap-3 px-5 py-3 rounded-2xl border-2 transition-all shrink-0',
                    currentEvent.id === evt.id
                      ? 'border-indigo-500 bg-indigo-50 shadow-md'
                      : 'border-slate-200 bg-white hover:border-indigo-300 shadow-sm'
                  )}
                >
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: evt.color }} />
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-900">{evt.name}</p>
                    <p className="text-xs text-slate-500">{evt.duration_minutes} min</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* === EVENT DETAIL + CALENDAR === */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden mb-8">
          {/* Event Header */}
          <div className="px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: currentEvent.color }} />
                  <h2 className="text-xl font-bold text-slate-900">{currentEvent.name}</h2>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1"><Clock size={14} /> {currentEvent.duration_minutes} min</span>
                  <span className="flex items-center gap-1"><Globe size={14} /> {host!.timezone}</span>
                </div>
              </div>
            </div>
            {currentEvent.description && (
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">{currentEvent.description}</p>
            )}
          </div>

          {/* Month Nav */}
          <div className="px-8 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Calendar size={18} />
              {format(selectedDate, 'MMMM yyyy')}
            </h3>
            <div className="flex items-center gap-1">
              <button onClick={() => handleDateChange(subDays(selectedDate, 1))}
                className="p-2 rounded-xl hover:bg-slate-100 transition-all">
                <ChevronLeft size={18} className="text-slate-500" />
              </button>
              <button onClick={() => handleDateChange(new Date())}
                className="px-3 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                Today
              </button>
              <button onClick={() => handleDateChange(addDays(selectedDate, 1))}
                className="p-2 rounded-xl hover:bg-slate-100 transition-all">
                <ChevronRight size={18} className="text-slate-500" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5">
            {/* Calendar */}
            <div className="lg:col-span-3 p-8 border-r border-slate-100">
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 mb-3">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={i}>{d}</span>)}
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {calendarDays.map((day, i) => {
                  const past = day.date < startOfDay(new Date());
                  const todayFlag = isToday(day.date);
                  const selected = day.inMonth && isSameDay(day.date, selectedDate);
                  const hasBookings = day.inMonth && getBookingsForDate(day.date) > 0;
                  const hasSlots = day.inMonth && !past && activeRules.some((r) => r.day_of_week === getDay(day.date));

                  return (
                    <button
                      key={i}
                      disabled={!day.inMonth || past}
                      onClick={() => handleDateChange(day.date)}
                      className={cn(
                        'relative aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-semibold transition-all',
                        !day.inMonth && 'invisible',
                        day.inMonth && past && 'text-slate-300 cursor-not-allowed',
                        day.inMonth && !past && !selected && 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-600',
                        selected && 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105',
                        todayFlag && !selected && 'ring-2 ring-indigo-200 text-indigo-600'
                      )}
                    >
                      {format(day.date, 'd')}
                      {day.inMonth && !past && hasSlots && !selected && (
                        <span className="absolute bottom-1 w-1 h-1 rounded-full bg-indigo-400" />
                      )}
                      {hasBookings && (
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slots */}
            <div className="lg:col-span-2 p-8 bg-slate-50/50">
              <h4 className="text-sm font-bold text-slate-900 mb-4">
                {format(selectedDate, 'EEEE, MMM d')}
              </h4>
              {slots.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  <Clock className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                  {activeRules.length === 0
                    ? 'No availability configured for this host.'
                    : 'No available slots for this date.'}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-[380px] overflow-y-auto pr-1">
                  {slots.map((slot) => {
                    const taken = isSlotTaken(slot.isoStart);
                    const isSelected = selectedSlot?.isoStart === slot.isoStart;
                    return (
                      <button
                        key={slot.start}
                        disabled={taken}
                        onClick={() => handleSlotSelect(slot)}
                        className={cn(
                          'p-3 rounded-xl text-sm font-semibold transition-all text-center',
                          taken && 'opacity-30 line-through cursor-not-allowed bg-slate-100 text-slate-400 border border-slate-100',
                          !taken && isSelected && 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 ring-2 ring-indigo-300 scale-105',
                          !taken && !isSelected && 'bg-white border border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-600 hover:shadow-sm'
                        )}
                      >
                        {slot.start}
                        {taken && <span className="block text-[10px] font-normal mt-0.5">Booked</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* === BOOKING FORM === */}
        {selectedSlot && step === 'form' && (
          <div id="booking-form" className="max-w-lg mx-auto scroll-mt-8">
            {/* Summary Card */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 mb-6">
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">Booking Summary</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">{currentEvent.name}</p>
                  <p className="text-sm text-slate-600">{format(selectedDate, 'EEEE, MMM d')} at {selectedSlot.start}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-indigo-600">{currentEvent.duration_minutes} min</p>
                  <p className="text-xs text-slate-500">{host!.full_name}</p>
                </div>
              </div>
            </div>

            {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-medium">{error}</div>}
            {conflict && <div className="mb-4 p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl text-sm font-medium">{conflict}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-3.5 text-slate-400" />
                  <input type="text" value={guestName} onChange={e => setGuestName(e.target.value)}
                    placeholder="Your name"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white text-sm"
                    required />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-3.5 text-slate-400" />
                  <input type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white text-sm"
                    required />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">What would you like to discuss?</label>
                <div className="relative">
                  <FileText size={16} className="absolute left-4 top-3.5 text-slate-400" />
                  <textarea value={guestNotes} onChange={e => setGuestNotes(e.target.value)}
                    placeholder="Tell us a bit about your goals..."
                    rows={3}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white text-sm resize-none" />
                </div>
              </div>
              <button type="submit"
                disabled={submitting}
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed">
                {submitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Confirming&hellip;
                  </>
                ) : (
                  <>
                    Confirm Appointment
                    <CheckCircle size={20} className="group-hover:scale-110 transition-transform" />
                  </>
                )}
              </button>
              <p className="text-center text-xs text-slate-400">Free booking during early access.</p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Calendar helper ────────────────────────────────────────── */

function getCalendarDays(currentDate: Date) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay();
  const days: { date: Date; inMonth: boolean }[] = [];
  for (let i = startDow - 1; i >= 0; i--) { days.push({ date: new Date(year, month, -i), inMonth: false }); }
  for (let d = 1; d <= lastDay.getDate(); d++) { days.push({ date: new Date(year, month, d), inMonth: true }); }
  const remaining = 42 - days.length;
  for (let d = 1; d <= remaining; d++) { days.push({ date: new Date(year, month + 1, d), inMonth: false }); }
  return days;
}

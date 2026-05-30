
'use client';

import React, { useState, useMemo } from 'react';
import { Calendar, Clock, CheckCircle, ChevronRight, Globe, User, Mail, FileText, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { format, addDays, subDays, startOfDay, parseISO, isSameDay } from 'date-fns';
import { generateAvailableSlots } from '@/lib/scheduling';
import { getProfile, getEventTypeBySlug, getAvailability, addBooking, getConfirmedBookings } from '@/lib/storage';

interface Props {
  params: { hostSlug: string; eventSlug: string };
}

export default function GuestBookingPage({ params }: Props) {
  const host = getProfile();
  const eventType = getEventTypeBySlug(params.eventSlug);
  const availability = getAvailability();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; isoStart: string; isoEnd: string } | null>(null);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestNotes, setGuestNotes] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');
  const [conflict, setConflict] = useState('');

  const slots = useMemo(() => {
    if (!eventType) return [];
    const rules = availability.filter(r => r.is_enabled);
    return generateAvailableSlots(rules, eventType.duration_minutes, selectedDate);
  }, [selectedDate, eventType, availability]);

  const [allBookings, setAllBookings] = useState<any[]>([]);

  React.useEffect(() => {
    setAllBookings(getConfirmedBookings(host.id));
  }, [confirmed]); // refresh after booking

  function isSlotTaken(isoStart: string): boolean {
    const start = new Date(isoStart).getTime();
    return allBookings.some((b: any) => {
      const bStart = new Date(b.start_time).getTime();
      return Math.abs(bStart - start) < 60000; // within 1 min
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setConflict('');

    if (!guestName.trim()) { setError('Name is required'); return; }
    if (!guestEmail.trim() || !guestEmail.includes('@')) { setError('Valid email is required'); return; }
    if (!selectedSlot) { setError('Please select a time slot'); return; }

    if (isSlotTaken(selectedSlot.isoStart)) {
      setConflict('This slot was just taken. Please select another time.');
      return;
    }

    addBooking({
      event_type_id: eventType!.id,
      host_id: host.id,
      guest_name: guestName.trim(),
      guest_email: guestEmail.trim(),
      guest_notes: guestNotes.trim(),
      start_time: selectedSlot.isoStart,
      end_time: selectedSlot.isoEnd,
      status: 'confirmed',
    });

    setConfirmed(true);
  }

  if (!eventType) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Event Not Found</h1>
          <p className="text-slate-500 mb-6">This booking link is invalid or the event has been removed.</p>
          <a href="/" className="text-indigo-600 hover:underline">Go to Meetly</a>
        </div>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-10 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Booking Confirmed!</h1>
          <p className="text-slate-500 mb-6">
            {guestName}, your {eventType.name} with {host.full_name} has been scheduled for{' '}
            <strong>{format(parseISO(selectedSlot!.isoStart), 'MMMM d, yyyy')}</strong> at{' '}
            <strong>{format(parseISO(selectedSlot!.isoStart), 'h:mm a')}</strong>.
          </p>
          <p className="text-sm text-slate-400 mb-8">A confirmation email has been sent to {guestEmail}.</p>
          <a
            href={`/book/${host.slug}/${eventType.slug}`}
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all"
          >
            Book Another
          </a>
        </div>
      </div>
    );
  }

  const calendarDays = getCalendarDays(selectedDate);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Back button */}
      <div className="px-6 pt-4">
        <a href="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 transition-colors">
          <ArrowLeft size={14} /> Back to Meetly
        </a>
      </div>

      {/* Header */}
      <header className="px-6 py-8 flex flex-col md:flex-row items-center gap-6 max-w-6xl mx-auto">
        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg">
          <img src={host.avatar_url} alt={host.full_name} />
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-2xl font-bold text-slate-900">{host.full_name}</h1>
          <p className="text-slate-500 flex items-center justify-center md:justify-start gap-2">
            <Clock size={16} />
            {eventType.name} &bull; {eventType.duration_minutes} min
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Event Info */}
        <div className="lg:col-span-4 space-y-8">
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-3">About this event</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{eventType.description}</p>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-medium">
            <Globe size={16} />
            <span>Timezone: {host.timezone} (Host local time)</span>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 text-xs font-medium">
            <Clock size={16} />
            <span>{eventType.duration_minutes} minute meeting</span>
          </div>
        </div>

        {/* Right: Calendar & Form */}
        <div className="lg:col-span-8">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
            {/* Month Nav */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Calendar size={18} /> Select a Date &amp; Time
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedDate(subDays(selectedDate, 1))}
                    className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-all"
                  >
                    <ChevronRight size={16} className="rotate-180" />
                  </button>
                  <span className="text-sm font-bold px-3 py-1 bg-white border border-slate-200 rounded-lg min-w-[160px] text-center">
                    {format(selectedDate, 'MMMM yyyy')}
                  </span>
                  <button
                    onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                    className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-all"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Calendar Grid */}
              <div className="p-6 border-r border-slate-100">
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 mb-2">
                  {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => <span key={d}>{d}</span>)}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((day, i) => {
                    const isPast = day.date < startOfDay(new Date());
                    const isToday = isSameDay(day.date, new Date());
                    const isSelected = isSameDay(day.date, selectedDate);
                    return (
                      <button
                        key={i}
                        disabled={isPast}
                        onClick={() => { setSelectedDate(day.date); setSelectedSlot(null); }}
                        className={cn(
                          'aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all',
                          day.inMonth ? 'text-slate-900' : 'text-slate-300',
                          isSelected && 'bg-indigo-600 text-white shadow-md shadow-indigo-200',
                          !isSelected && !isPast && 'hover:bg-slate-100',
                          isToday && !isSelected && 'ring-2 ring-indigo-300',
                          isPast && 'opacity-40 cursor-not-allowed'
                        )}
                      >
                        {format(day.date, 'd')}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots */}
              <div className="p-6 bg-slate-50/30">
                <h4 className="text-sm font-bold text-slate-900 mb-4">
                  Available &mdash; {format(selectedDate, 'EEE, MMM d')}
                </h4>
                {slots.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-sm">
                    No available slots for this date.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {slots.map((slot) => {
                      const taken = isSlotTaken(slot.isoStart);
                      const isSelected = selectedSlot?.isoStart === slot.isoStart;
                      return (
                        <button
                          key={slot.start}
                          disabled={taken}
                          onClick={() => setSelectedSlot(taken ? null : slot)}
                          className={cn(
                            'w-full p-3 rounded-xl bg-white border text-sm font-medium transition-all text-left flex items-center justify-between group',
                            taken && 'opacity-40 line-through cursor-not-allowed border-slate-100',
                            isSelected && !taken && 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-200',
                            !isSelected && !taken && 'border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-600'
                          )}
                        >
                          {slot.start}
                          {taken ? (
                            <span className="text-xs text-red-400">Taken</span>
                          ) : (
                            <ChevronRight size={14} className={cn('opacity-0 group-hover:opacity-100 transition-opacity', isSelected && 'opacity-100')} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking Form */}
          {selectedSlot && (
            <div className="mt-12 p-8 rounded-3xl bg-slate-50 border border-slate-200 shadow-sm max-w-xl mx-auto">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Confirm Your Booking</h3>
              <p className="text-sm text-slate-500 mb-6">
                {eventType.name} with {host.full_name} on {format(selectedDate, 'EEEE, MMMM d')} at {selectedSlot.start}
              </p>
              {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">{error}</div>}
              {conflict && <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-600 rounded-lg text-sm">{conflict}</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Full Name</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={guestName}
                        onChange={e => setGuestName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-3.5 text-slate-400" />
                      <input
                        type="email"
                        value={guestEmail}
                        onChange={e => setGuestEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Notes (Optional)</label>
                  <div className="relative">
                    <FileText size={16} className="absolute left-3 top-3.5 text-slate-400" />
                    <textarea
                      value={guestNotes}
                      onChange={e => setGuestNotes(e.target.value)}
                      placeholder="What would you like to discuss?"
                      rows={3}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 group"
                >
                  Confirm Appointment
                  <CheckCircle size={20} className="group-hover:scale-110 transition-transform" />
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function getCalendarDays(currentDate: Date) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay();

  const days: { date: Date; inMonth: boolean }[] = [];

  // Days from previous month
  for (let i = startDow - 1; i >= 0; i--) {
    days.push({ date: new Date(year, month, -i), inMonth: false });
  }
  // Days in current month
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push({ date: new Date(year, month, d), inMonth: true });
  }
  // Days from next month
  const remaining = 42 - days.length;
  for (let d = 1; d <= remaining; d++) {
    days.push({ date: new Date(year, month + 1, d), inMonth: false });
  }
  return days;
}

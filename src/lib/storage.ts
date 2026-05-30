
'use client';

// Meetly Local Storage Data Layer
// A fully functional offline-first data layer using localStorage.
// Replace the storage calls with Supabase calls to go production.

export interface MeetlyProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string;
  timezone: string;
  slug: string;
}

export interface MeetlyEventType {
  id: string;
  host_id: string;
  name: string;
  slug: string;
  duration_minutes: number;
  description: string;
  color: string;
  is_active: boolean;
  created_at: string;
}

export interface MeetlyAvailabilityRule {
  id: string;
  host_id: string;
  day_of_week: number; // 0-6
  start_time: string;  // "09:00"
  end_time: string;    // "17:00"
  is_enabled: boolean;
}

export interface MeetlyBooking {
  id: string;
  event_type_id: string;
  host_id: string;
  guest_name: string;
  guest_email: string;
  guest_notes: string;
  start_time: string; // ISO
  end_time: string;   // ISO
  status: 'confirmed' | 'cancelled';
  created_at: string;
}

export interface MeetlyCalendarConnection {
  user_id: string;
  connected: boolean;
  email: string | null;
}

const KEY_PREFIX = 'meetly_';

function getKey(key: string): string {
  return `${KEY_PREFIX}${key}`;
}

function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(getKey(key));
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getKey(key), JSON.stringify(data));
}

// Defaults
const DEFAULT_HOST: MeetlyProfile = {
  id: 'host_1',
  full_name: 'Abdelhak',
  email: 'abdelhak@meetly.app',
  avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Abdelhak',
  timezone: 'Europe/London',
  slug: 'abdelhak',
};

const DEFAULT_EVENTS: MeetlyEventType[] = [
  {
    id: 'evt_1',
    host_id: 'host_1',
    name: '15-minute Intro Call',
    slug: 'intro-call',
    duration_minutes: 15,
    description: 'Quick 15-minute introduction call to discuss your needs.',
    color: '#4f46e5',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'evt_2',
    host_id: 'host_1',
    name: '30-minute Consultation',
    slug: 'consultation',
    duration_minutes: 30,
    description: 'A focused 30-minute session for consultations and advice.',
    color: '#7c3aed',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'evt_3',
    host_id: 'host_1',
    name: '60-minute Deep Dive',
    slug: 'deep-dive',
    duration_minutes: 60,
    description: 'Extended 60-minute deep dive for complex projects and architecture planning.',
    color: '#06b6d4',
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

const DEFAULT_AVAILABILITY: MeetlyAvailabilityRule[] = (() => {
  const rules: MeetlyAvailabilityRule[] = [];
  // Mon-Fri 9am-5pm
  for (let d = 1; d <= 5; d++) {
    rules.push({
      id: `avail_${d}_1`,
      host_id: 'host_1',
      day_of_week: d,
      start_time: '09:00',
      end_time: '17:00',
      is_enabled: true,
    });
  }
  return rules;
})();

const DEFAULT_BOOKINGS: MeetlyBooking[] = [];

// Initialize defaults on first load
export function initDefaults(): void {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(getKey('profile'))) {
    save('profile', DEFAULT_HOST);
  }
  if (!localStorage.getItem(getKey('event_types'))) {
    save('event_types', DEFAULT_EVENTS);
  }
  if (!localStorage.getItem(getKey('availability'))) {
    save('availability', DEFAULT_AVAILABILITY);
  }
  if (!localStorage.getItem(getKey('bookings'))) {
    save('bookings', DEFAULT_BOOKINGS);
  }
  if (!localStorage.getItem(getKey('calendar_connection'))) {
    save('calendar_connection', { user_id: 'host_1', connected: false, email: null });
  }
}

// Profile
export function getProfile(): MeetlyProfile {
  return load<MeetlyProfile>('profile', DEFAULT_HOST);
}

// Event Types
export function getEventTypes(): MeetlyEventType[] {
  return load<MeetlyEventType[]>('event_types', DEFAULT_EVENTS);
}

export function getEventTypeBySlug(slug: string): MeetlyEventType | undefined {
  return getEventTypes().find(e => e.slug === slug && e.is_active);
}

export function addEventType(event: Omit<MeetlyEventType, 'id' | 'created_at'>): MeetlyEventType {
  const events = getEventTypes();
  const newEvent: MeetlyEventType = {
    ...event,
    id: `evt_${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  save('event_types', [...events, newEvent]);
  return newEvent;
}

export function updateEventType(id: string, updates: Partial<MeetlyEventType>): void {
  const events = getEventTypes();
  save('event_types', events.map(e => e.id === id ? { ...e, ...updates } : e));
}

export function deleteEventType(id: string): void {
  const events = getEventTypes();
  save('event_types', events.filter(e => e.id !== id));
}

// Availability
export function getAvailability(): MeetlyAvailabilityRule[] {
  return load<MeetlyAvailabilityRule[]>('availability', DEFAULT_AVAILABILITY);
}

export function updateAvailability(rule: MeetlyAvailabilityRule): void {
  const rules = getAvailability();
  const idx = rules.findIndex(r => r.id === rule.id);
  if (idx >= 0) {
    rules[idx] = rule;
  }
  save('availability', rules);
}

// Bookings
export function getBookings(): MeetlyBooking[] {
  return load<MeetlyBooking[]>('bookings', DEFAULT_BOOKINGS);
}

export function getBookingsForHost(hostId: string): MeetlyBooking[] {
  return getBookings().filter(b => b.host_id === hostId);
}

export function getUpcomingBookings(hostId: string): MeetlyBooking[] {
  const now = new Date().toISOString();
  return getBookings()
    .filter(b => b.host_id === hostId && b.start_time > now && b.status === 'confirmed')
    .sort((a, b) => a.start_time.localeCompare(b.start_time));
}

export function getConfirmedBookings(hostId: string): MeetlyBooking[] {
  return getBookings()
    .filter(b => b.host_id === hostId && b.status === 'confirmed')
    .sort((a, b) => a.start_time.localeCompare(b.start_time));
}

export function addBooking(booking: Omit<MeetlyBooking, 'id' | 'created_at'>): MeetlyBooking {
  const bookings = getBookings();
  const newBooking: MeetlyBooking = {
    ...booking,
    id: `bk_${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  save('bookings', [...bookings, newBooking]);
  return newBooking;
}

export function cancelBooking(id: string): void {
  const bookings = getBookings();
  save('bookings', bookings.map(b => b.id === id ? { ...b, status: 'cancelled' as const } : b));
}

export function deleteBooking(id: string): void {
  const bookings = getBookings();
  save('bookings', bookings.filter(b => b.id !== id));
}

// Calendar Connection
export function getCalendarConnection(): MeetlyCalendarConnection {
  return load<MeetlyCalendarConnection>('calendar_connection', {
    user_id: 'host_1',
    connected: false,
    email: null,
  });
}

export function setCalendarConnected(connected: boolean, email?: string): void {
  const current = getCalendarConnection();
  save('calendar_connection', {
    ...current,
    connected,
    email: email || current.email,
  });
}

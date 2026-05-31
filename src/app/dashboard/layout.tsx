'use client';

import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Clock,
  Settings,
  LogOut,
  Link2,
  User,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

const NAV_ITEMS = [
  { icon: <LayoutDashboard size={20} />, label: 'Overview', href: '/dashboard' },
  { icon: <CalendarDays size={20} />, label: 'Event Types', href: '/dashboard/event-types' },
  { icon: <Users size={20} />, label: 'Bookings', href: '/dashboard/bookings' },
  { icon: <Clock size={20} />, label: 'Availability', href: '/dashboard/availability' },
  { icon: <Settings size={20} />, label: 'Integrations', href: '/dashboard/integrations' },
  { icon: <User size={20} />, label: 'Settings', href: '/dashboard/settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserEmail(session.user.email || '');
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <a href="/dashboard" className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <CalendarDays className="text-white w-4 h-4" />
          </div>
          <span className="text-lg font-bold">Meetly</span>
        </a>

        <nav className="flex-1 px-4 space-y-1">
          {NAV_ITEMS.map(item => (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              <span className="text-slate-400">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-1">
          <a
            href="/book/demo/intro-call"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all"
          >
            <Link2 size={20} className="text-slate-400" />
            View Booking Page
          </a>
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group">
            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-300 shrink-0">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=User" alt="User" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{userEmail || 'User'}</p>
              <p className="text-xs text-slate-500 truncate">Early Access</p>
            </div>
            <button
              onClick={async () => {
                const supabase = getSupabaseBrowserClient();
                await supabase.auth.signOut();
                window.location.href = '/login';
              }}
              className="p-1 text-slate-400 group-hover:text-red-500 transition-colors"
              title="Log out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        {children}
      </main>
    </div>
  );
}

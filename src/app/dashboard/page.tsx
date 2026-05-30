
'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Clock, 
  Settings, 
  Users, 
  LogOut, 
  Plus, 
  ArrowUpRight,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function DashboardOverview() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome back, Abdelhak!</h1>
          <p className="text-slate-500">Here is what's happening with your bookings today.</p>
        </div >
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-sm">
          <Plus size={16} />
          New Event Type
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard label="Total Bookings" value="128" change="+12% this month" trend="up" />
        <StatCard label="Upcoming" value="14" change="Next 7 days" trend="neutral" />
        <StatCard label="Active Events" value="4" change="3 types live" trend="neutral" />
        <StatCard label="Calendar Status" value="Connected" change="Google sync active" trend="up" />
      </div >

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Upcoming Bookings</h3>
            <button className="text-xs font-medium text-indigo-600 hover:underline">View all</button>
          </div >
          <div className="divide-y divide-slate-100">
             {/* Mock-ing a dynamic list for now */}
            <BookingRow 
              name="Sarah Connor" 
              email="sarah@sky.net" 
              event="60m Deep Dive" 
              date="Oct 24, 2026" 
              time="10:00 AM" 
              onCancel={() => alert('Booking Cancelled')}
            />
            <BookingRow 
              name="Miles Dyson" 
              email="miles@cyberdyne.com" 
              event="30m Consulting" 
              date="Oct 24, 2026" 
              time="2:3 la PM" 
              onCancel={() => alert('Booking Cancelled')}
            />
          </div >
        </div >

        <div className="space-y-6">
          <div className="p-6 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform">
              <Calendar size={120} strokeWidth={1} />
            </div >
            <h3 className="text-lg font-bold mb-2 relative z-10">Your Booking Page</h3>
            <p className="text-indigo-100 text-sm mb-6 relative z-10">Share your link to start receiving bookings automatically.</p>
            <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/20 relative z-10">
              <span className="text-sm font-mono truncate flex-1">meetly.com/abdelhak</span>
              <button className="p-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors">
                <ArrowUpRight size={16} />
              </button>
            </div >
          </div >
        </div >
      </div >
    </div >
  );
}

function StatCard({ label, value, change, trend }: { label: string, value: string, change: string, trend: 'up' | 'down' | 'neutral' }) {
  return (
    <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
      <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
      <h4 className="text-2xl font-bold text-slate-900 mb-2">{value}</h4>
      <div className={cn(
        "text-xs font-medium flex items-center gap-1",
        trend === 'up' ? "text-emerald-600" : trend === 'down' ? "text-rose-600" : "text-slate-400"
      )}>
        {trend === 'up' && <ArrowUpRight size={12} />}
        {change}
      </div >
    </div >
  );
}

function BookingRow({ name, email, event, date, time, onCancel }: { name: string, email: string, event: string, date: string, time: string, onCancel: () => void }) {
  return (
    <div className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs">
          {name.charAt(0)}
        </div >
        <div>
          <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{name}</p>
          <p className="text-xs text-slate-500">{email}</p>
        </div >
      </div >
      <div className="flex items-center gap-6">
        <div className="text-right flex flex-col items-end gap-1">
           <p className="text-xs font-semibold text-slate-700">{event}</p>
           <div className="flex items-center gap-3 text-xs text-slate-400">
             <span>{date}</span>
             <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
             <span>{time}</span>
           </div >
        </div >
        <button 
          onClick={onCancel}
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
        >
          <Trash2 size={16} />
        </button>
      </div >
    </div >
  );
}

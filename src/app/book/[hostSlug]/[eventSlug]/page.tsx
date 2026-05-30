
'use client';

import React from 'react';
import { Calendar, Clock, CheckCircle, ChevronRight, Globe, User, Mail, FileText } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { format, addDays, startOfWeek, addMinutes } from 'date-fns';

export default function GuestBookingPage() {
  // Mock data for host and event
  const host = { name: "Abdelhak", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Abdelhak" };
  const event = { 
    name: "60-minute Deep Dive", 
    description: "Focused session to tackle complex technical problems or architectural planning.", 
    duration: 60 
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Header */}
      <header className="px-6 py-8 border-b border-slate-100 flex flex-col md:flex-row items-center gap-6 max-w-6xl mx-auto">
        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg relative">
          <img src={host.avatar} alt={host.name} />
        </div >
        <div className="text-center md:text-left">
          <h1 className="text-2xl font-bold text-slate-900">{host.name}</h1>
          <p className="text-slate-500 flex items-center justify-center md:justify-start gap-2">
            <Clock size={16} /> 
            {event.name} • {event.duration} min
          </p>
        </div >
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Event Info */}
        <div className="lg:col-span-4 space-y-8">
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-3">About this event</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {event.description}
            </p>
          </div >
          
          <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-medium">
            <Globe size={16} />
            <span>Timezone: UTC (Auto-detected)</span>
          </div >
        </div >

        {/* Right: Booking Calendar */}
        <div className="lg:col-span-8">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
            {/* Date Selector */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Calendar size={18} />
                  Select a Date
                </h3>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-all">
                    <ChevronRight size={16} className="rotate-180" />
                  </button>
                  <span className="text-sm font-bold px-3 py-1 bg-white border border-slate-200 rounded-lg">
                    {format(new Date(), 'MMMM yyyy')}
                  </span>
                  <button className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-all">
                    <ChevronRight size={16} />
                  </button>
                </div >
              </div >
            </div >

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Mock Calendar Grid */}
              <div className="p-6 border-r border-slate-100">
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 mb-2">
                  <span>SUN</span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span>
                </div >
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 31 }).map((_, i) => (
                    <button 
                      key={i} 
                      className={cn(
                        "aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all",
                        i === 14 ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "hover:bg-slate-100 text-slate-600"
                      )}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div >
              </div >

              {/* Time Slots */}
              <div className="p-6 bg-slate-50/30">
                <h4 className="text-sm font-bold text-slate-900 mb-4">Available Slots</h4>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {['09:00 AM', '09:30 AM', '10:00 AM', '11:00 AM', '12:30 PM', '02:00 PM', '03:30 PM', '04:00 PM'].map((time) => (
                    <button 
                      key={time}
                      className="w-full p-3 rounded-xl bg-white border border-slate-200 text-sm text-slate-700 font-medium hover:border-indigo-500 hover:text-indigo-600 transition-all text-left flex items-center justify-between group"
                    >
                      {time}
                      <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div >
              </div >
            </div >
          </div >

          {/* Booking Form (Hidden until time selected) */}
          <div className="mt-12 p-8 rounded-3xl bg-slate-50 border border-slate-200 shadow-sm max-w-xl mx-auto">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Confirm Booking</h3>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-3 text-slate-400" />
                    <input type="text" placeholder="John Doe" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                  </div >
                </div >
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
                    <input type="email" placeholder="john@example.com" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                  </div >
                </div >
              </div >
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Notes (Optional)</label>
                <div className="relative">
                  <FileText size={16} className="absolute left-3 top-3 text-slate-400" />
                  <textarea placeholder="Tell us about your goals..." rows={3} className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                </div >
              </div >
              <button className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 group">
                Confirm Appointment
                <CheckCircle size={20} className="group-hover:scale-110 transition-transform" />
              </button>
            </form>
          </div >
        </div >
      </main>
    </div >
  );
}

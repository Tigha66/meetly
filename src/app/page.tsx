
import React from 'react';
import { Calendar, Clock, CheckCircle, ArrowRight, Globe } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Calendar className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">Meetly</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
          <a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-3">
          <a href="/login" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Log in
          </a>
          <a href="/dashboard" className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md">
            Get started
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 md:py-32 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold mb-6 border border-indigo-100">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          Now available for consultants
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
          Scheduling that feels <br /> 
          <span className="text-indigo-600">effortless.</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          Stop the back-and-forth email dance. Meetly gives you a professional booking page that syncs with your calendar and lets clients book you in seconds.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-full font-semibold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 group">
            Create your page
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="w-full sm:w-auto px-8 py-4 bg-white text-slate-600 border border-slate-200 rounded-full font-semibold text-lg hover:bg-slate-50 transition-all">
            View Demo
          </button>
        </div>

        {/* Mockup Preview */}
        <div className="mt-20 relative max-w-4xl mx-auto">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-20"></div>
          <div className="relative bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden aspect-video flex items-center justify-center text-slate-400">
            <div className="flex flex-col items-center gap-4 text-center p-8">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                <Calendar className="w-8 h-8 text-slate-300" />
              </div>
              <p className="font-medium text-slate-500">Meetly Dashboard Preview</p>
              <div className="flex gap-2">
                <div className="h-2 w-2 bg-slate-200 rounded-full"></div>
                <div className="h-2 w-2 bg-slate-200 rounded-full"></div>
                <div className="h-2 w-2 bg-slate-200 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="px-6 py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Everything you need to book</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              Focus on the work, not the logistics. Meetly handles the timezones, availability, and notifications.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Clock className="w-6 h-6 text-indigo-600" />}
              title="Flexible Event Types"
              description="Create different types of meetings, from 15-minute intros to a full hour deep dive. Customize each one."
            />
            <FeatureCard 
              icon={<Globe className="w-6 h-6 text-indigo-600" />}
              title="Global Time Zones"
              description="No more calculating UTC. Meetly automatically detects your guest's timezone for a friction-less experience."
            />
            <FeatureCard 
              icon={<CheckCircle className="w-6 h-6 text-indigo-600" />}
              title="Google Calendar Sync"
              description="Connect your Google Calendar to prevent double-bookings and automatically add confirmed events to your schedule."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-slate-900 text-slate-400 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
            <Calendar className="text-white w-4 h-4" />
          </div>
          <span className="text-white font-bold">Meetly</span>
        </div>
        <p className="text-sm">© 2026 Meetly Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors group">
      <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

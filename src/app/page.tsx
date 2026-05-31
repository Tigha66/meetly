import React from 'react';
import { Calendar, Clock, CheckCircle, ArrowRight, Globe, Shield, RefreshCw } from 'lucide-react';

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
          <a href="/contact" className="hover:text-indigo-600 transition-colors">Contact</a>
        </div>
        <div className="flex items-center gap-3">
          <a href="/login" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Log in
          </a>
          <a href="/dashboard" className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md">
            Create your booking page
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
          Early Access — shaping the product with early users
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
          Turn your booking link into a page that<br />
          <span className="text-indigo-600">sells you first.</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          A premium booking page for consultants, creators, and service providers. Build trust, qualify leads, and book better calls.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-full font-semibold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 group">
            Create your booking page
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <a href="/book/abdelhak/intro-call" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-600 border border-slate-200 rounded-full font-semibold text-lg hover:bg-slate-50 transition-all">
            View demo page
          </a>
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
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Everything you need to book better calls</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              Focus on the work, not the logistics. Meetly handles the scheduling so you can focus on your clients.
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
              title="Timezone Aware"
              description="No more calculating UTC. Meetly detects your guest's timezone for a friction-less booking experience."
            />
            <FeatureCard
              icon={<CheckCircle className="w-6 h-6 text-indigo-600" />}
              title="Instant Confirmation"
              description="Bookings are confirmed instantly with clear details for you and your guest."
            />
          </div>

          {/* Coming Soon section */}
          <div className="mt-16 pt-16 border-t border-slate-100">
            <h3 className="text-center text-sm font-semibold text-slate-400 uppercase tracking-wider mb-8">Coming Soon</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCardComingSoon
                icon={<Shield className="w-6 h-6 text-slate-400" />}
                title="Google Calendar Sync"
                description="Prevent double-bookings and auto-add events to your calendar."
              />
              <FeatureCardComingSoon
                icon={<RefreshCw className="w-6 h-6 text-slate-400" />}
                title="Automated Reminders"
                description="Email reminders before every meeting so nobody forgets."
              />
              <FeatureCardComingSoon
                icon={<Calendar className="w-6 h-6 text-slate-400" />}
                title="Self-Rescheduling"
                description="Let guests reschedule without the back-and-forth."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
                <Calendar className="text-white w-4 h-4" />
              </div>
              <span className="text-white font-bold">Meetly</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-white transition-colors">Terms</a>
              <a href="/contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <p className="text-sm">© {new Date().getFullYear()} Meetly. All rights reserved.</p>
          </div>
        </div>
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

function FeatureCardComingSoon({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-slate-50/50 border border-slate-100 opacity-75">
      <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6">
        {icon}
      </div>
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-xl font-bold text-slate-500">{title}</h3>
        <span className="px-2 py-0.5 bg-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded-full">Soon</span>
      </div>
      <p className="text-slate-500 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

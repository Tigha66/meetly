
'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, AlertCircle, ExternalLink, RefreshCw, Calendar, Mail, Bell, MessageCircle, Settings
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { getCalendarConnection, setCalendarConnected } from '@/lib/storage';

export default function IntegrationsPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);
  const [automations, setAutomations] = useState({
    confirmation: true,
    reminder: true,
    followup: false,
  });

  useEffect(() => {
    const conn = getCalendarConnection();
    setIsConnected(conn.connected);
    setConnectedEmail(conn.email);
    try {
      const saved = localStorage.getItem('meetly_automations');
      if (saved) setAutomations(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  function toggleGoogle() {
    if (isConnected) {
      setCalendarConnected(false);
      setIsConnected(false);
      setConnectedEmail(null);
    } else {
      setCalendarConnected(true, 'abdelhak@meetly.app');
      setIsConnected(true);
      setConnectedEmail('abdelhak@meetly.app');
    }
  }

  function toggleAutomation(key: keyof typeof automations) {
    const updated = { ...automations, [key]: !automations[key] };
    setAutomations(updated);
    localStorage.setItem('meetly_automations', JSON.stringify(updated));
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900">Integrations</h1>
        <p className="text-slate-500">Connect your tools and automate your workflow.</p>
      </header>

      {/* Calendar Connection */}
      <div className="grid grid-cols-1 gap-6 mb-10">
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <Calendar size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Google Calendar</h3>
              <p className="text-sm text-slate-500 max-w-md">
                Sync your availability and automatically add bookings to your calendar.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            {isConnected ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100">
                  <CheckCircle2 size={12} />
                  Connected {connectedEmail && `(${connectedEmail})`}
                </div>
                <button onClick={toggleGoogle}
                  className="px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100">
                  Disconnect
                </button>
              </>
            ) : (
              <button onClick={toggleGoogle}
                className="w-full md:w-auto px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm flex items-center justify-center gap-2">
                Connect Google Account
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Workflow Automations */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-900 mb-1">Workflow Automations</h2>
        <p className="text-sm text-slate-500">Automatically communicate with your guests.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-10">
        <AutomationCard
          icon={<Mail size={20} />}
          title="Confirmation Email"
          description="Send an instant confirmation email to guests after they book."
          enabled={automations.confirmation}
          onToggle={() => toggleAutomation('confirmation')}
        />
        <AutomationCard
          icon={<Bell size={20} />}
          title="24h Reminder"
          description="Remind guests about their upcoming meeting one day before."
          enabled={automations.reminder}
          onToggle={() => toggleAutomation('reminder')}
        />
        <AutomationCard
          icon={<MessageCircle size={20} />}
          title="Follow-up Message"
          description="Send a thank-you message after the meeting ends."
          enabled={automations.followup}
          onToggle={() => toggleAutomation('followup')}
        />
      </div>

      {/* Setup Guide */}
      <div className="mt-12 p-8 rounded-3xl bg-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500 rounded-full blur-3xl opacity-20" />
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <ExternalLink size={20} />
          Google Cloud Setup
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          <div className="space-y-4">
            <p className="text-slate-400 text-sm leading-relaxed">
              To enable real Google Calendar sync, configure your Google Cloud Project following the guide.
            </p>
            <ul className="space-y-3">
              {['Create OAuth 2.0 Client ID', 'Add Redirect URIs', 'Enable Calendar API'].map((step, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/30 border border-indigo-500 flex items-center justify-center text-[10px] font-bold">{i + 1}</div>
                  {step}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
            <p className="text-xs font-mono text-indigo-300 mb-4 uppercase tracking-widest">Required Env Vars</p>
            {['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'NEXTAUTH_SECRET'].map(v => (
              <div key={v} className="flex justify-between py-2 border-b border-white/5 text-xs font-mono text-slate-300 last:border-0">
                <span>{v}</span>
                <span className="text-white/50">REQUIRED</span>
              </div>
            ))}
            <a href="/GOOGLE_SETUP.md"
              className="block mt-6 text-center py-3 bg-white text-slate-900 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors">
              View Detailed Guide
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function AutomationCard({ icon, title, description, enabled, onToggle }: {
  icon: React.ReactNode; title: string; description: string; enabled: boolean; onToggle: () => void;
}) {
  return (
    <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
          {icon}
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>
      <button onClick={onToggle}
        className={cn('relative inline-flex h-6 w-11 items-center rounded-full transition-colors', enabled ? 'bg-indigo-600' : 'bg-slate-200')}>
        <span className={cn('inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm', enabled ? 'translate-x-6' : 'translate-x-1')} />
      </button>
    </div>
  );
}

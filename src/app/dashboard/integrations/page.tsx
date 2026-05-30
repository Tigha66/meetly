
import React from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  RefreshCw, 
  Calendar, 
  Lock, 
  Unlock 
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function IntegrationsPage() {
  // Mock state for local demo
  const [isConnected, setIsConnected] = React.useState(false);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900">Integrations</h1>
        <p className="text-slate-500">Connect your external tools to automate your booking workflow.</p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {/* Google Calendar Card */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <Calendar size={24} />
            </div >
            <div>
              <h3 className="font-bold text-slate-900">Google Calendar</h3>
              <p className="text-sm text-slate-500 max-w-md">
                Sync your availability and automatically add guest bookings to your primary calendar.
              </p>
            </div >
          </div >

          <div className="flex items-center gap-4 w-full md:w-auto">
            {isConnected ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100">
                  <CheckCircle2 size={12} />
                  Connected
                </div >
                <button 
                  onClick={() => setIsConnected(false)} 
                  className="px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button 
                onClick={() => setIsConnected(true)}
                className="w-full md:w-auto px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Lock size={14} />
                Connect Google Account
              </button>
            )}
          </div >
        </div >

        {/* Placeholder for other integrations */}
        <div className="p-6 bg-slate-50 border border-dashed border-slate-300 rounded-2xl flex items-center justify-center py-12 text-slate-400 grayscale opacity-60">
          <div className="text-center">
            <div className="mx-auto w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center mb-2">
              <RefreshCw size={18} />
            </div >
            <p className="text-sm font-medium">More integrations coming soon...</p>
          </div >
        </div >
      </div >

      {/* Setup Checklist Section */}
      <div className="mt-12 p-8 rounded-3xl bg-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <ExternalLink size={20} />
          Developer Setup Guide
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          <div className="space-y-4">
            <p className="text-slate-400 text-sm leading-relaxed">
              To make these integrations work in production, you need to configure your Google Cloud Project.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-5 h-5 rounded-full bg-indigo-500/30 border border-indigo-500 flex items-center justify-center text-[10px] font-bold">1</div>
                Create OAuth 2.0 Client ID
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-5 h-5 rounded-full bg-indigo-500/30 border border-indigo-500 flex items-center justify-center text-[10px] font-bold">2</div>
                Add Redirect URIs
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-5 h-5 rounded-full bg-indigo-500/30 border border-indigo-500 flex items-center justify-center text-[10px] font-bold">3</div>
                Enable Calendar API
              </li>
            </ul >
          </div >
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
            <p className="text-xs font-mono text-indigo-300 mb-4 uppercase tracking-widest">Required Env Vars</p>
            <div className="space-y-2 font-mono text-xs text-slate-300">
              <div className="flex justify-between py-2 border-b border-white/5">
                <span>GOOGLE_CLIENT_ID</span>
                <span className="text-white/50">SURELY_REQUIRED</span>
              </div >
              <div className="flex justify-between py-2 border-b border-white/5">
                <span>GOOGLE_CLIENT_SECRET</span>
                <span className="text-white/50">SURELY_REQUIRED</span>
              </div >
              <div className="flex justify-between py-2">
                <span>NEXTAUTH_SECRET</span>
                <span className="text-white/50">REQUIRED</span>
              </div >
            </div >
            <a 
              href="/GOOGLE_SETUP.md" 
              className="block mt-6 text-center py-3 bg-white text-slate-900 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors"
            >
              View Detailed Guide
            </a>
          </div >
        </div >
      </div >
    </div >
  );
}


'use client';

import React from 'react';
import { Calendar, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-10 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Calendar className="w-10 h-10 text-slate-300" />
        </div >
        <h1 className="text-2xl font-bold text-slate-900 mb-2">You&apos;re Offline</h1>
        <p className="text-slate-500 mb-8 leading-relaxed">
          Meetly needs an internet connection to show your bookings. Check your network and try again.
        </p >
        <button 
          onClick={() => window.location.reload()}
          className="w-full py-3 px-6 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw size={18} />
          Try Again
        </button>
      </div >
    </div >
  );
}

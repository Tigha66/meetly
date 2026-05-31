'use client';

import React, { useState } from 'react';
import { Calendar, Mail, Lock, ArrowRight } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();

      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });

        if (signUpError) {
          setError(signUpError.message);
          setLoading(false);
          return;
        }

        // Bootstrap profile for new user
        if (data?.user) {
          try {
            const res = await fetch('/api/profile/bootstrap', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: data.user.id,
                email: data.user.email,
                fullName: email.split('@')[0] || 'New User',
              }),
            });
            if (!res.ok) console.error('Profile bootstrap failed:', res.status);
          } catch (err) {
            console.error('Profile bootstrap error:', err);
          }
        }

        setSuccess(true);
        // If email confirmation is required, show message
        if (data?.user && !data.session) {
          setSuccess(true);
          setError(''); // Clear any error
          // Show confirmation message
          setTimeout(() => {
            setError('check-email');
          }, 100);
        } else {
          // Session created immediately (email confirmation disabled in Supabase)
          window.location.href = '/dashboard';
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (signInError) {
          setError(signInError.message);
          setLoading(false);
          return;
        }

        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Calendar className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Meetly</span>
          </a>
          <h1 className="text-xl font-bold text-slate-900">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {isSignUp
              ? 'Start taking bookings in minutes'
              : 'Sign in to your dashboard'}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-8">
          {/* Success state for signup with email confirmation */}
          {success && error === 'check-email' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-indigo-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">Check your email</h2>
              <p className="text-slate-500 text-sm mb-6">
                We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
              </p>
              <button
                onClick={() => { setSuccess(false); setError(''); }}
                className="text-indigo-600 text-sm font-medium hover:underline"
              >
                ← Back to sign up
              </button>
            </div>
          )}

          {/* Success state for immediate session */}
          {success && error !== 'check-email' && !error && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm text-center">
              {isSignUp ? 'Account created! Redirecting...' : 'Logged in! Redirecting...'}
            </div>
          )}

          {/* Error state */}
          {error && error !== 'check-email' && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Hide form if showing check-email success */}
          {!(success && error === 'check-email') && (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</label>
                  <div className="relative mt-1">
                    <Mail size={16} className="absolute left-3 top-3.5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                  <div className="relative mt-1">
                    <Lock size={16} className="absolute left-3 top-3.5 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      required
                      minLength={6}
                      disabled={loading}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {isSignUp ? 'Create Account' : 'Sign In'}
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-slate-500 mt-6">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccess(false); }}
                  className="text-indigo-600 font-semibold hover:underline"
                  disabled={loading}
                >
                  {isSignUp ? 'Sign in' : 'Sign up'}
                </button>
              </p>
            </>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          By continuing, you agree to our{' '}
          <a href="/terms" className="text-indigo-500 hover:underline">Terms</a> and{' '}
          <a href="/privacy" className="text-indigo-500 hover:underline">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}

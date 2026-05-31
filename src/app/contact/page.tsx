import { Calendar, Mail, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
        <a href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Calendar className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">Meetly</span>
        </a>
        <a href="/" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Back to home</a>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Contact Us</h1>
        <p className="text-lg text-slate-600 mb-12">
          Have a question, feedback, or need help with Meetly? We&apos;d love to hear from you.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white border border-slate-200 rounded-2xl p-8">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-indigo-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Email Us</h2>
            <p className="text-slate-600 text-sm mb-4">For general inquiries and support:</p>
            <a href="mailto:support@meetly.app" className="text-indigo-600 font-medium hover:underline">support@meetly.app</a>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-8">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-indigo-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Feedback</h2>
            <p className="text-slate-600 text-sm mb-4">Meetly is in early access. Your feedback shapes the product:</p>
            <a href="mailto:feedback@meetly.app" className="text-indigo-600 font-medium hover:underline">feedback@meetly.app</a>
          </div>
        </div>

        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-8 text-center">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Early Access</h2>
          <p className="text-slate-600 text-sm">
            Meetly is currently in early access. If you encounter any issues or have suggestions, please reach out — we read every message.
          </p>
        </div>
      </main>

      <footer className="px-6 py-12 bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
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
      </footer>
    </div>
  );
}

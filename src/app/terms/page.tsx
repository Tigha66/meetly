import { Calendar } from 'lucide-react';

export default function TermsPage() {
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
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Terms of Service</h1>
        <p className="text-sm text-slate-400 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="prose prose-slate max-w-none space-y-6 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing and using Meetly (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Description of Service</h2>
            <p>Meetly is a booking page platform that helps consultants, creators, and service providers create premium booking pages, manage availability, and receive meeting reservations from guests.</p>
            <p className="mt-2">Meetly is currently in <strong>Early Access / Beta</strong>. Features may change, and the service may experience interruptions as we improve the product.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Account Responsibilities</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You must provide accurate and complete information when creating an account.</li>
              <li>You are responsible for maintaining the security of your account credentials.</li>
              <li>You are responsible for all activity that occurs under your account.</li>
              <li>You must notify us immediately of any unauthorized use of your account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Use the service for any illegal or unauthorized purpose</li>
              <li>Attempt to access other users&apos; accounts or data</li>
              <li>Interfere with or disrupt the service or servers</li>
              <li>Create fake bookings or abuse the booking system</li>
              <li>Use the service to send spam or unsolicited communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Service Availability</h2>
            <p>We strive to maintain service availability but do not guarantee uptime. During Early Access, the service may be modified, suspended, or discontinued at any time without notice.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">6. Limitation of Liability</h2>
            <p>Meetly is provided &quot;as is&quot; without warranties of any kind. We are not liable for any damages arising from your use of the service, including missed meetings, data loss, or business interruption.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">7. Changes to Terms</h2>
            <p>We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the new terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">8. Contact</h2>
            <p>For questions about these terms, contact us at <a href="mailto:support@meetly.app" className="text-indigo-600 hover:underline">support@meetly.app</a>.</p>
          </section>
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

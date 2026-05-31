import { Calendar } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
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
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Privacy Policy</h1>
        <p className="text-sm text-slate-400 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="prose prose-slate max-w-none space-y-6 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Information We Collect</h2>
            <p>When you use Meetly, we collect information you provide directly:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Account information:</strong> Name, email address, and password when you create an account.</li>
              <li><strong>Profile information:</strong> Bio, avatar, social links, timezone, and scheduling preferences.</li>
              <li><strong>Booking information:</strong> Event types, availability rules, and booking records.</li>
              <li><strong>Guest information:</strong> When guests book a meeting, we collect their name, email, and any notes they provide.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Provide, maintain, and improve Meetly</li>
              <li>Process bookings and send confirmations</li>
              <li>Communicate with you about your account and bookings</li>
              <li>Protect the security and integrity of our service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Data Storage</h2>
            <p>Your data is stored using Supabase (PostgreSQL) with appropriate security measures. During the early access period, some data may be stored locally in your browser.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Third-Party Services</h2>
            <p>Meetly may use third-party services for:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Supabase</strong> for authentication and database hosting</li>
              <li><strong>Vercel</strong> for application hosting</li>
              <li>Future integrations such as Google Calendar (with your explicit consent)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Your Rights</h2>
            <p>You may request deletion of your account and associated data at any time by contacting us at <a href="mailto:privacy@meetly.app" className="text-indigo-600 hover:underline">privacy@meetly.app</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">6. Changes to This Policy</h2>
            <p>We may update this privacy policy from time to time. We will notify you of any changes by updating the &quot;Last updated&quot; date at the top of this page.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">7. Contact</h2>
            <p>For questions about this privacy policy, contact us at <a href="mailto:privacy@meetly.app" className="text-indigo-600 hover:underline">privacy@meetly.app</a>.</p>
          </section>
        </div>
      </main>

      {/* Footer */}
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

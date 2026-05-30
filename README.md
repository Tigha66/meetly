
# Meetly - Professional Scheduling SaaS

Meetly is a high-performance, Calendly-style booking platform designed for consultants, coaches, and freelancers.

## 🚀 Quick Start

### Local Development
1. **Install Dependencies:**
   ```bash
   npm install
   ```
2. **Environment Setup:**
   Create a `.env.local` file based on `.env.example` and fill in your credentials.
3. **Run Development Server:**
   ```bash
   npm run dev
   ```
4. **Access the App:**
   - Landing Page: `http://localhost:3000`
   - Host Dashboard: `http://localhost:3000/dashboard`
   - Public Booking Page: `http://localhost:3000/book/abdelhak/deep-dive`

## 🛠️ Technical Architecture

### Stack
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS + Lucide Icons
- **Database & Auth:** Supabase (PostgreSQL + GoTrue)
- **Scheduling Logic:** Custom `date-fns` based slot generator
- **Testing:** Playwright

### Data Model
The system relies on five core tables:
- `profiles`: Extended user data including slugs and timezones.
- `event_types`: Definition of meeting types (duration, name, color).
- `availability_rules`: Weekly time-range patterns for hosts.
- `bookings`: The final appointments linked to hosts and events.
- `calendar_connections`: OAuth tokens for Google Calendar integration.

## ☁️ Deployment

### Supabase
1. Create a new project in Supabase.
2. Run the commands found in `SUPABASE_SCHEMA.sql` in the SQL Editor.
3. Enable Google OAuth in the Supabase Auth settings.

### Vercel
1. Connect your GitHub repository to Vercel.
2. Add the environment variables from `.env.example`.
3. Deploy.

## 📅 Google Calendar Integration
Detailed setup for the Google Cloud Console is located in `GOOGLE_SETUP.md`.

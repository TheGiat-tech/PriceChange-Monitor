# PricePing - Website Price & Content Change Monitor

A production-ready micro-SaaS application for monitoring website price and content changes. Like Visualping but simpler, easier, and cheaper.

## Features

- 🎯 **Precise Monitoring** - Monitor specific elements using CSS selectors
- ⚡ **Instant Alerts** - Get email notifications when changes are detected
- 📊 **Change History** - Track all changes over time
- 💰 **Affordable Plans** - Free tier with 1 monitor, Pro with up to 20 monitors
- 🔒 **Secure** - Built-in SSRF protection and authentication
- 📱 **Mobile-Friendly** - Responsive design with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **Email**: Resend
- **Scheduling**: GitHub Actions
- **Monitoring**: cheerio for HTML parsing, crypto for hashing

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Stripe account (for payments)
- Resend account (for emails)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/TheGiat-tech/PriceChange-Monitor.git
cd PriceChange-Monitor
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and fill in your credentials:
- Supabase URL and keys
- Stripe secret key, webhook secret, and price ID
- Resend API key
- App URL
- Cron secret (generate a secure random string)

4. Set up the database:

In your Supabase project, run the migration file:
```sql
-- Execute the contents of supabase/migrations/001_initial_schema.sql
-- in your Supabase SQL Editor
```

This will create the necessary tables (profiles, monitors, events) and RLS policies.

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Production Deployment

1. Deploy to Vercel (recommended):
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

2. Set up environment variables in Vercel dashboard

3. Configure Stripe webhook:
   - Add webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy webhook signing secret to `.env`

4. Configure GitHub Actions secrets:
   - Add `APP_URL` (your deployed app URL)
   - Add `CRON_SECRET` (same as in your .env)

5. Enable the GitHub Actions workflow in your repository

## How It Works

### User Flow

1. **Sign Up** - Create an account with email and password
2. **Add Monitor** - Enter URL, CSS selector, and notification settings
3. **Test Selector** - Verify the selector extracts the correct content
4. **Get Alerts** - Receive emails when changes are detected

### Monitoring Process

1. GitHub Actions runs every 10 minutes
2. Calls `/api/cron/check` with authorization
3. Fetches all active monitors that are due for checking
4. For each monitor:
   - Fetches the URL
   - Extracts content using CSS selector
   - Normalizes and hashes the value
   - Compares with previous hash
   - If changed: creates event and sends email
   - Updates monitor status

### Security Features

- **SSRF Protection**: Blocks private IP ranges and local addresses
- **URL Validation**: Only allows HTTP/HTTPS protocols
- **Input Validation**: Zod schemas for all user inputs
- **Rate Limiting**: Cron endpoint requires secret token
- **RLS Policies**: Row-level security in Supabase
- **Timeouts**: 10-second timeout on HTTP requests

## Project Structure

```
/app
  /page.tsx                    - Landing page
  /login/page.tsx              - Authentication
  /dashboard/page.tsx          - User dashboard
  /monitors/new/page.tsx       - Add monitor form
  /monitors/[id]/page.tsx      - Monitor details
  /pricing/page.tsx            - Pricing plans
  /api
    /monitors/route.ts         - CRUD monitors
    /monitors/test/route.ts    - Test selector
    /monitors/[id]/route.ts    - Single monitor ops
    /cron/check/route.ts       - Scheduled checks
    /stripe/checkout/route.ts  - Create checkout
    /stripe/webhook/route.ts   - Stripe webhooks
    /auth/callback/route.ts    - Auth callback
/lib
  /supabase                    - Supabase clients
  /monitoring                  - Fetch, parse, hash, SSRF
  /email                       - Email with Resend
  /stripe                      - Stripe helpers
  /utils                       - Validation schemas
/supabase/migrations           - Database schema
/.github/workflows             - GitHub Actions
/scripts                       - Utility scripts
```

## Database Schema

### profiles
- User profiles with plan information
- Links to Stripe customer

### monitors
- Monitor configurations
- Tracks last value, hash, check time, status

### events
- Change history
- Old and new values with timestamps

## API Routes

### Public
- `GET /` - Landing page
- `GET /login` - Auth page
- `GET /pricing` - Pricing page

### Protected
- `GET /dashboard` - User dashboard
- `GET /monitors/new` - Add monitor
- `GET /monitors/[id]` - Monitor details

### API Endpoints
- `GET /api/monitors` - List monitors
- `POST /api/monitors` - Create monitor
- `POST /api/monitors/test` - Test selector
- `GET /api/monitors/[id]` - Get monitor
- `PATCH /api/monitors/[id]` - Update monitor
- `DELETE /api/monitors/[id]` - Delete monitor
- `POST /api/cron/check` - Run checks (protected)
- `POST /api/stripe/checkout` - Create checkout
- `POST /api/stripe/webhook` - Stripe webhook

## Environment Variables

Required environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Cron
CRON_SECRET=your_secure_random_string

# Email
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@yourdomain.com
```

## Testing

Run the smoke tests:
```bash
npm run dev
# In another terminal:
node scripts/smoke-check.js
```

## Plan Limits

- **Free**: 1 active monitor
- **Pro**: Up to 20 active monitors

Limits are enforced server-side when creating monitors.

## Monitoring Intervals

Available check intervals:
- Every hour (60 minutes)
- Every 4 hours (240 minutes)
- Daily (1440 minutes)

## Contributing

This is a production MVP. Feel free to fork and customize for your needs.

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
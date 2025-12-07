# XpandoraX - Video Directory Platform

A modern video directory platform built with Remix v2, Cloudflare Workers, and TypeScript.

## Tech Stack

- **Framework**: Remix v2 with Vite
- **Runtime**: Cloudflare Workers (Edge)
- **Database**: Cloudflare D1 (SQLite) with Drizzle ORM
- **Authentication**: Lucia v3 (Session-based)
- **Payments**: Lemon Squeezy (Premium subscriptions)
- **Styling**: Tailwind CSS + shadcn/ui
- **Video Hosting**: Abyss.to embeds
- **Ads**: ExoClick banners + JuicyAds pop-under

## Project Structure

```
├── app/
│   ├── components/       # React components
│   │   ├── ui/          # shadcn/ui components
│   │   └── ...          # Custom components
│   ├── db/              # Database schema (Drizzle)
│   ├── lib/             # Utilities and services
│   │   └── auth/        # Lucia authentication
│   ├── routes/          # Remix routes
│   └── types/           # TypeScript types
├── collections/          # Payload CMS collections
├── drizzle/             # Database migrations
├── functions/           # Cloudflare Pages functions
└── public/              # Static assets
```

## Getting Started

### Prerequisites

- Node.js 20+
- Wrangler CLI (`npm install -g wrangler`)
- Cloudflare account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/xpandorax.com.git
   cd xpandorax.com
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment file:
   ```bash
   cp .env.example .env
   ```

4. Set up Cloudflare D1 database:
   ```bash
   wrangler d1 create xpandorax-db
   ```

5. Update `wrangler.toml` with your D1 database ID.

6. Run migrations:
   ```bash
   wrangler d1 execute xpandorax-db --file=drizzle/0001_initial_schema.sql
   ```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Environment Variables

Configure these in `.env` for local development and in Cloudflare dashboard for production:

| Variable | Description |
|----------|-------------|
| `SESSION_SECRET` | Secret for session encryption |
| `LEMON_SQUEEZY_API_KEY` | Lemon Squeezy API key |
| `LEMON_SQUEEZY_STORE_ID` | Your store ID |
| `LEMON_SQUEEZY_VARIANT_ID` | Premium subscription variant ID |
| `LEMON_SQUEEZY_WEBHOOK_SECRET` | Webhook signing secret |
| `EXOCLICK_ZONE_ID` | ExoClick banner zone ID |
| `JUICYADS_ZONE_ID` | JuicyAds pop-under zone ID |
| `SITE_URL` | Your production URL |

### Production Deployment

Deploy to Cloudflare Pages:
```bash
npm run deploy
```

Or push to `main` branch for automatic deployment via GitHub Actions.

## Features

### For Users
- Browse videos by category or model
- Search across videos, models, and categories
- Age verification gate
- Premium subscription (ad-free experience)
- User account management

### For Admins
- Payload CMS admin panel at `/admin`
- Manage videos, categories, and models
- View subscription analytics

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/webhooks/lemon-squeezy` | POST | Lemon Squeezy webhook handler |

## Database Schema

### Tables
- `users` - User accounts
- `sessions` - Auth sessions
- `videos` - Video content
- `categories` - Video categories
- `actresses` - Models/performers
- `video_categories` - Many-to-many junction
- `video_actresses` - Many-to-many junction
- `subscriptions` - Premium subscriptions

## License

Proprietary - All rights reserved.

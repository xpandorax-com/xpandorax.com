# XpandoraX - Premium Adult Content Platform

A modern, high-performance adult content platform built with **Next.js 14**, **React 18**, **Tailwind CSS**, and **Supabase**.

## ✨ Features

### Core Functionality
- 🔞 **Age Verification System** - Cookie-based age gate for legal compliance
- 🎥 **Video Browsing** - Browse, search, and filter videos
- 👤 **Model Profiles** - Detailed model pages with video collections
- 📂 **Category Pages** - Organize content by categories
- 🔍 **Advanced Search** - Search videos and models
- 🖼️ **Photo Galleries** - Picture browsing (placeholder ready)
- 🏢 **Producer/Studio Pages** - Content organized by studios

### User Experience
- 🌓 **Dark/Light Mode** - Toggle between themes
- 📱 **Fully Responsive** - Works on all devices
- 🌍 **Multi-language Support** - Language selector (framework ready)
- ⚡ **Fast Performance** - Server-side rendering with Next.js
- ♿ **Accessible** - WCAG compliant

### Technical Features
- 🗄️ **Supabase Integration** - PostgreSQL database with real-time capabilities
- 🎨 **Modern UI** - Built with Tailwind CSS
- 🔒 **Security Headers** - XSS, clickjacking protection
- 📊 **SEO Optimized** - Meta tags, Open Graph, structured data
- 🚀 **Production Ready** - Optimized build and deployment

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- Supabase account (optional, falls back to mock data)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/KenTheGreat19/xpandorax.com.git
cd xpandorax.com
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
# Copy the example file
copy .env.local.example .env.local

# Edit .env.local with your credentials
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

4. **Run development server**
```bash
npm run dev
```

5. **Open your browser**
```
http://localhost:3000
```

## 📁 Project Structure

```
xpandorax.com/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.js             # Root layout
│   │   ├── page.js               # Homepage
│   │   ├── globals.css           # Global styles
│   │   ├── age-gate/             # Age verification
│   │   ├── videos/               # Videos listing
│   │   ├── models/               # Models listing
│   │   ├── pictures/             # Photo galleries
│   │   ├── producers/            # Studios/Producers
│   │   ├── contact/              # Contact form
│   │   ├── upload-request/       # Upload request form
│   │   ├── search/               # Search results
│   │   ├── video/[id]/           # Video detail page
│   │   ├── model/[slug]/         # Model profile page
│   │   └── category/[slug]/      # Category page
│   ├── components/               # React components
│   │   ├── Header.js             # Site header
│   │   ├── Footer.js             # Site footer
│   │   ├── VideoGrid.js          # Video grid display
│   │   ├── VideoPlayer.js        # Video player
│   │   ├── SearchForm.js         # Search component
│   │   ├── LanguageSelector.js   # Language switcher
│   │   └── ThemeProvider.js      # Dark mode provider
│   ├── lib/                      # Library code
│   │   ├── supabase.js           # Supabase client
│   │   └── data.js               # Data fetching functions
│   └── utils/                    # Utility functions
│       ├── helpers.js            # Helper functions
│       └── config.js             # App configuration
├── public/                       # Static assets
│   ├── manifest.json             # PWA manifest
│   ├── robots.txt                # SEO robots file
│   └── favicon.svg               # Site favicon
├── middleware.js                 # Age gate middleware
├── next.config.js                # Next.js configuration
├── tailwind.config.js            # Tailwind CSS config
├── postcss.config.js             # PostCSS config
├── jsconfig.json                 # Path aliases
├── .env.local.example            # Environment template
├── .gitignore                    # Git ignore rules
├── package.json                  # Dependencies
└── README.md                     # This file
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with:

```env
# Supabase Configuration (Required for database features)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Server-only (do not expose in the browser):
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://xpandorax.com
NEXT_PUBLIC_SITE_NAME=XpandoraX

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

### Cloudflare R2 (Optional for media storage)

If you want to store media (logos, images, thumbnails) in Cloudflare R2, add these env vars to `.env.local`:

```env
R2_ACCOUNT_ID=your_account_id
R2_BUCKET=your_bucket
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_ENDPOINT=https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com
NEXT_PUBLIC_R2_URL=https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET}
```

This repo includes a test upload endpoint (`/api/upload`) and a test page at `/upload` which you can use to upload test files to R2. The API uses an S3-compatible AWS SDK client.

### Logo setup (Cloudflare R2)

To use a site logo stored in your Cloudflare R2 bucket, you have two options:

- Set `NEXT_PUBLIC_LOGO_URL` to the full public URL to the logo image (recommended):

```env
NEXT_PUBLIC_LOGO_URL=https://<R2_URL>/xpandorax_logo.png
```

- Or set the `NEXT_PUBLIC_LOGO_FILENAME` to the filename (e.g., `xpandorax_logo.png` or `uploads/xpandorax_logo.png`) and ensure `NEXT_PUBLIC_R2_URL` is set:

```env
NEXT_PUBLIC_R2_URL=https://<R2_URL>
NEXT_PUBLIC_LOGO_FILENAME=xpandorax_logo.png
```

If neither variable is provided, the app will attempt to load `xpandorax_logo.png` from the `NEXT_PUBLIC_R2_URL` path by default.


## 🔧 Where to find Supabase keys

To connect your app to Supabase, you'll need the Project URL and a Publishable (anon) key. If you need to perform server-only admin operations, you can also use the Service Role (secret) key — do NOT expose this in the browser.

Find them in the Supabase dashboard for your project:
- Project URL: Settings → Data API (or Home → Project URL)
- Publishable (anon) key: Settings → API Keys → Publishable key (safe to use on the client)
- Service Role (server-only): Settings → API Keys → Secret keys → Service Role key (server only — do not commit)

Example `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (server-only)
```

Then run:

```bash
npm run check-env
npm run dev
```


### Supabase Database Schema

If using Supabase, create these tables:

```sql
-- Content table for videos
CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT,
  video_url TEXT,
  duration INTEGER,
  views INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  categories TEXT[],
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Models table
CREATE TABLE models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  bio TEXT,
  avatar TEXT,
  nationality TEXT,
  age INTEGER,
  height TEXT,
  video_count INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  followers INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE models ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public read access" ON content FOR SELECT USING (true);
CREATE POLICY "Public read access" ON models FOR SELECT USING (true);
```

## 🛠️ Development

### Available Scripts

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build for production
npm start        # Run production build
npm run lint     # Run ESLint
```

### Adding New Features

1. **Add a new page**: Create a file in `src/app/your-page/page.js`
2. **Add a component**: Create in `src/components/YourComponent.js`
3. **Add data fetching**: Add function to `src/lib/data.js`
4. **Add utility**: Add to `src/utils/helpers.js`

## 🚀 Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy**
```bash
vercel
```

3. **Set environment variables** in Vercel dashboard

### Other Platforms

Build the application:
```bash
npm run build
```

Deploy the `.next` folder to any Node.js hosting provider.

## 🎨 Customization

### Colors

Edit `tailwind.config.js` to change the primary color:

```js
colors: {
  primary: {
    // Your custom color palette
    600: '#your-color',
  }
}
```

### Site Information

Edit `src/utils/config.js` for site-wide settings:

```js
export const siteConfig = {
  name: 'Your Site Name',
  description: 'Your description',
  // ... more settings
}
```

## 📝 Key Files to Update

Before going live, update these with your real data:

1. **`src/lib/data.js`** - Replace mock data with real Supabase queries
2. **`.env.local`** - Add your Supabase credentials
3. **`src/utils/config.js`** - Update site configuration
4. **`public/manifest.json`** - Update PWA manifest
5. **`src/app/layout.js`** - Update metadata

## 🔒 Security

- Age verification via cookie-based middleware
- Security headers configured in `next.config.js`
- Supabase Row Level Security policies
- Input validation on forms
- XSS protection enabled

## 📱 PWA Support

The site includes PWA manifest. To make it fully installable:

1. Add service worker in `public/sw.js`
2. Register service worker in layout
3. Add app icons to `public/images/`

## 🐛 Troubleshooting

### Age Gate Issues
- Clear cookies: `document.cookie = "age_verified=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"`
- Check middleware.js is working

### Build Errors
- Delete `.next` folder and node_modules
- Run `npm install` again
- Check Node.js version (18+)

### Supabase Connection
- Verify environment variables are set
- Check Supabase dashboard for errors
- Falls back to mock data if unavailable

## 📄 License

This project is private and proprietary.

## 🤝 Support

For issues or questions:
- **Email**: support@xpandorax.com
- **GitHub Issues**: https://github.com/KenTheGreat19/xpandorax.com/issues

---

**Built with ❤️ using Next.js 14**

**⚠️ Adult Content Notice**: This is an adult entertainment platform. All users must be 18 years or older. All models are 18+.

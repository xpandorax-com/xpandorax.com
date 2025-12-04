# Payload CMS Integration for Xpandorax

## Setup Instructions

### 1. Install MongoDB
You need MongoDB installed and running for Payload CMS to work.

**For local development:**
- Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
- Install and start MongoDB service
- Default connection: `mongodb://localhost:27017/xpandorax`

**For production:**
- Use MongoDB Atlas (free tier available): https://www.mongodb.com/cloud/atlas
- Get your connection string and update in `.env.local`

### 2. Configure Environment Variables
Create a `.env.local` file in the project root with the following:

```env
# Supabase Configuration (existing)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Payload CMS Configuration (new)
PAYLOAD_SECRET=your-secure-random-secret-key-here
DATABASE_URI=mongodb://localhost:27017/xpandorax
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

**Important:** Generate a secure secret for `PAYLOAD_SECRET` - you can use: 
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Access the Admin Panel
Once the server is running:
1. Start dev server: `npm run dev`
2. Visit: http://localhost:3000/admin
3. Create your first admin user account

### 4. Collections Available
Payload CMS provides the following collections:

- **Videos** - Manage video content with thumbnails, categories, models, producers
- **Categories** - Organize content by categories
- **Models** - Manage model profiles
- **Producers** - Manage content producer information
- **Users** - User authentication and management

### 5. API Access
Payload automatically creates REST and GraphQL APIs:

- REST API: `http://localhost:3000/api/videos`, `/api/models`, etc.
- Admin Panel: `http://localhost:3000/admin`

### 6. Using Payload in Your Pages
Example of fetching data in a Next.js page:

```javascript
// In your page component
async function getVideos() {
  const res = await fetch('http://localhost:3000/api/videos')
  return res.json()
}

export default async function Page() {
  const { docs: videos } = await getVideos()
  // Use videos data
}
```

### 7. Migration from Supabase (Optional)
You can continue using Supabase alongside Payload CMS, or migrate data:
- Export data from Supabase
- Import into Payload via API or admin panel
- Update your components to fetch from Payload API

## Folder Structure
```
src/
  collections/         # Payload collection schemas
    Videos.js
    Categories.js
    Models.js
    Producers.js
    Users.js
  app/
    (payload)/         # Payload admin UI routes
      admin/
    api/               # Payload REST API routes
payload.config.js      # Main Payload configuration
```

## Next Steps
1. Set up MongoDB
2. Add environment variables
3. Run `npm run dev`
4. Visit `/admin` to create your first user
5. Start adding content through the CMS!

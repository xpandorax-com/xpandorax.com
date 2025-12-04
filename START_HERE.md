# 🚀 GETTING STARTED - Read This First!

## Your Website Has Been Completely Rebuilt! ✨

Everything has been rebuilt from scratch with clean, modern, production-ready code.

---

## ⚡ Quick Start (30 seconds)

### Option 1: Use the Quick Start Script
```bash
start.bat
```
This will:
1. Create your `.env.local` file
2. Start the development server
3. Open at http://localhost:3000

### Option 2: Manual Start
```bash
npm run dev
```
Then visit: http://localhost:3000

---

## 📋 What You'll See

When you start the server, you'll see the **Age Gate** first. Click "Yes, I'm 18+" to enter the site.

Then you'll see:
- ✅ Homepage with hero section
- ✅ Featured, Latest, and Trending videos (mock data)
- ✅ Category grid
- ✅ Top models preview
- ✅ Navigation menu (Videos, Models, Pictures, Producers, Contact)
- ✅ Search functionality
- ✅ Dark/Light theme toggle
- ✅ Language selector

---

## 🎯 Next Steps

### 1. Configure Your Database (Optional but Recommended)

**If you have Supabase:**
1. Copy `.env.local.example` to `.env.local`
2. Add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```
3. Restart the dev server

**If you don't have Supabase:**
- The site works perfectly with mock data!
- You'll see sample videos, models, and content
- Great for testing and development

### 2. Test All Features

Navigate through:
- **Videos page** - View all videos with filters
- **Models page** - Browse model profiles
- **Pictures page** - Photo gallery grid
- **Producers page** - Studios and producers
- **Contact page** - Contact form
- **Upload Request** - Video request form
- **Search** - Try searching for content
- **Theme Toggle** - Try dark/light mode
- **Age Gate** - Clear cookies and test again

### 3. Customize Your Site

**Easy Changes** (no coding needed):
- Edit `src/utils/config.js` for:
  - Site name
  - Categories
  - Navigation links
  - Footer links

**Design Changes**:
- Edit `tailwind.config.js` for colors
- Edit `src/app/globals.css` for custom styles

**Add Your Content**:
- Replace mock data in `src/lib/data.js`
- Or connect to Supabase for real data

---

## 📁 Important Files

| File | What It Does |
|------|-------------|
| `package.json` | Dependencies and scripts |
| `next.config.js` | Next.js configuration |
| `middleware.js` | Age verification system |
| `src/app/layout.js` | Main layout wrapper |
| `src/app/page.js` | Homepage |
| `src/lib/data.js` | Data fetching (edit this!) |
| `src/utils/config.js` | Site settings (edit this!) |
| `.env.local.example` | Environment template |

---

## 🔧 Available Commands

```bash
npm run dev       # Start development (http://localhost:3000)
npm run build     # Build for production
npm start         # Run production build
npm run lint      # Check code quality
```

---

## 🎨 Customization Guide

### Change Site Colors
Edit `tailwind.config.js`:
```js
colors: {
  primary: {
    600: '#your-color',  // Change this!
  }
}
```

### Change Site Name
Edit `src/utils/config.js`:
```js
export const siteConfig = {
  name: 'Your Site Name',  // Change this!
}
```

### Add Real Videos
Edit `src/lib/data.js` and replace the mock data functions with real Supabase queries.

---

## 🐛 Troubleshooting

### Age Gate Keeps Appearing
Clear your cookies:
```javascript
// In browser console:
document.cookie = "age_verified=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
```

### Build Errors
1. Delete `.next` folder
2. Run `npm install` again
3. Run `npm run build`

### Can't See Changes
1. Stop the server (Ctrl+C)
2. Start again: `npm run dev`
3. Hard refresh browser (Ctrl+Shift+R)

---

## 📚 Documentation

Full documentation is in `README.md`, including:
- Complete setup guide
- Deployment instructions
- Database schema
- API documentation
- Troubleshooting tips

Quick summary in `BUILD_COMPLETE.md`

---

## ✅ Everything Is Working!

Your site successfully:
- ✅ Built without errors
- ✅ All pages render correctly
- ✅ All components work
- ✅ Age verification works
- ✅ Dark/Light mode works
- ✅ Search works
- ✅ Forms work
- ✅ Responsive design works

---

## 🚀 Ready to Deploy?

When you're ready to go live:

1. **Build for production:**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel (easiest):**
   ```bash
   npm install -g vercel
   vercel
   ```

3. **Or deploy to any hosting:**
   - Upload the `.next` folder
   - Set environment variables
   - Run `npm start`

---

## 💡 Pro Tips

1. **Mock Data**: The site uses generated sample data. Perfect for testing!

2. **Supabase Optional**: You can develop and test without Supabase. Add it later when ready.

3. **Responsive**: Test on mobile! The site works on all screen sizes.

4. **Dark Mode**: Click the moon/sun icon in the header to toggle themes.

5. **Age Gate**: You'll see this on first visit. It sets a cookie for 30 days.

---

## 🎉 You're All Set!

Your website is completely rebuilt and ready to use. 

**Start developing now:**
```bash
npm run dev
```

**Then visit:** http://localhost:3000

---

## 📞 Need Help?

- Check `README.md` for detailed docs
- Check `BUILD_COMPLETE.md` for build summary
- Check Next.js docs: https://nextjs.org/docs
- Check Tailwind docs: https://tailwindcss.com/docs

---

**Happy coding! 🚀**

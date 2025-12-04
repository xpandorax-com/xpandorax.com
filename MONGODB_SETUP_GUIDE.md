# MongoDB Setup Guide for XpandoraX

This guide will help you connect your project to MongoDB and resolve the connection error.

## Quick Fix for Current Error

The error `ECONNREFUSED ::1:27017` means MongoDB is not running on your local machine. You have two options:

### Option 1: Use MongoDB Atlas (Cloud - Recommended for Quick Start)
### Option 2: Install MongoDB Locally

---

## Option 1: MongoDB Atlas (Cloud) - Recommended

MongoDB Atlas is free and easier to set up. No local installation required.

### Steps:

1. **Create a MongoDB Atlas Account**
   - Go to [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
   - Sign up for a free account

2. **Create a Free Cluster**
   - Click "Build a Database"
   - Choose "FREE" (M0 Sandbox)
   - Select a cloud provider and region close to you
   - Click "Create Cluster"

3. **Create Database User**
   - Go to "Database Access" in the left menu
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `xpandorax_admin` (or your choice)
   - Password: Generate a secure password (save it!)
   - Database User Privileges: "Atlas admin"
   - Click "Add User"

4. **Whitelist Your IP Address**
   - Go to "Network Access" in the left menu
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Or add your current IP address
   - Click "Confirm"

5. **Get Your Connection String**
   - Go to "Database" in the left menu
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like):
     ```
     mongodb+srv://xpandorax_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```

6. **Update Your .env.local File**
   - Open `.env.local` in your project root
   - Replace the `MONGODB_URI` line with your connection string
   - **IMPORTANT**: Replace `<password>` with your actual password
   - Add the database name at the end:
   
   ```env
   MONGODB_URI=mongodb+srv://xpandorax_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/xpandorax?retryWrites=true&w=majority
   ```

7. **Update PAYLOAD_SECRET**
   - Generate a secure secret (32+ random characters)
   - Or use this command in PowerShell:
     ```powershell
     -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
     ```
   - Update in `.env.local`:
     ```env
     PAYLOAD_SECRET=your-generated-secret-here
     ```

8. **Restart Your Development Server**
   - Stop the current server (Ctrl+C in terminal)
   - Run: `npm run dev`
   - Navigate to `http://localhost:3000/admin`

---

## Option 2: Local MongoDB Installation (Windows)

### Steps:

1. **Download MongoDB Community Server**
   - Go to [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
   - Version: Latest (7.0+)
   - Platform: Windows
   - Package: MSI
   - Click "Download"

2. **Install MongoDB**
   - Run the downloaded `.msi` file
   - Choose "Complete" installation
   - Install MongoDB as a Service: ✅ (checked)
   - Service Name: `MongoDB`
   - Data Directory: `C:\Program Files\MongoDB\Server\7.0\data`
   - Log Directory: `C:\Program Files\MongoDB\Server\7.0\log`
   - Click "Next" and "Install"

3. **Verify MongoDB is Running**
   - Open PowerShell as Administrator
   - Check service status:
     ```powershell
     Get-Service -Name MongoDB
     ```
   - Should show: `Status: Running`

   - If not running, start it:
     ```powershell
     Start-Service -Name MongoDB
     ```

4. **Install MongoDB Shell (mongosh) - Optional but Recommended**
   - Download from [https://www.mongodb.com/try/download/shell](https://www.mongodb.com/try/download/shell)
   - Extract to `C:\Program Files\MongoDB\mongosh`
   - Add to PATH or use full path

5. **Test Connection**
   - Open PowerShell
   - Run:
     ```powershell
     Test-NetConnection -ComputerName 127.0.0.1 -Port 27017
     ```
   - Should show: `TcpTestSucceeded: True`

   - Or test with mongosh:
     ```powershell
     mongosh "mongodb://localhost:27017"
     ```

6. **Your .env.local is Already Configured**
   - The default connection string should work:
     ```env
     MONGODB_URI=mongodb://localhost:27017/xpandorax
     ```

7. **Update PAYLOAD_SECRET**
   - Generate a secure secret (see Atlas instructions above)
   - Update in `.env.local`

8. **Restart Your Development Server**
   - Stop the current server (Ctrl+C)
   - Run: `npm run dev`
   - Navigate to `http://localhost:3000/admin`

---

## Creating Your First Admin User

Once MongoDB is connected and the server starts successfully:

1. **Access Payload Admin**
   - Go to `http://localhost:3000/admin`
   - You'll see the "Create First User" screen

2. **Fill in the Form**
   - Email: Your email address
   - Password: A secure password (8+ characters)
   - Confirm Password: Same password

3. **Click "Create"**
   - You'll be logged in automatically
   - You can now manage content through Payload CMS

---

## Troubleshooting

### Error: "ECONNREFUSED ::1:27017"
- **Cause**: MongoDB is not running
- **Solution**: 
  - For Atlas: Check your connection string and IP whitelist
  - For Local: Start MongoDB service: `Start-Service -Name MongoDB`

### Error: "Authentication failed"
- **Cause**: Wrong username/password in connection string
- **Solution**: Double-check your Atlas credentials or regenerate password

### Error: "Network timeout"
- **Cause**: Firewall blocking connection or wrong IP whitelist
- **Solution**: 
  - Add your IP to Atlas whitelist
  - Or allow access from anywhere (0.0.0.0/0) for development

### Error: "PAYLOAD_SECRET is required"
- **Cause**: Missing or empty PAYLOAD_SECRET in .env.local
- **Solution**: Generate and add a secret (see instructions above)

### Server starts but /admin shows error
- **Cause**: MongoDB connected but no collections yet
- **Solution**: This is normal on first run. Create your first user to initialize.

---

## Verifying Everything Works

After setup, verify with these checks:

1. **Check MongoDB Connection**
   - Server should start without connection errors
   - Look for: "Connected to MongoDB" in terminal logs

2. **Access Admin Panel**
   - Navigate to `http://localhost:3000/admin`
   - Should see login or create user form (not error page)

3. **Create Test Content**
   - Log in to admin
   - Create a test video, category, or model
   - Check if it saves successfully

4. **View Collections in MongoDB**
   - **Atlas**: Use "Collections" tab in your cluster
   - **Local**: Use MongoDB Compass or mongosh:
     ```
     use xpandorax
     show collections
     ```

---

## Next Steps

After MongoDB is connected:

1. **Populate Your Database**
   - Use Payload Admin to add videos, models, categories, etc.
   - Or import data from your previous database

2. **Update Data Functions**
   - Edit `src/lib/data.js`
   - Replace mock data with Payload API calls
   - Example:
     ```javascript
     import { getPayloadClient } from '@payloadcms/next'
     
     export async function getLatestVideos(limit = 12) {
       const payload = await getPayloadClient()
       const videos = await payload.find({
         collection: 'videos',
         limit,
         sort: '-createdAt'
       })
       return videos.docs
     }
     ```

3. **Configure Collections**
   - Review collection schemas in `src/collections/`
   - Add fields, validation, or hooks as needed

4. **Set Up File Uploads**
   - Your R2 (Cloudflare) is already configured
   - Test upload via Payload Admin

---

## Production Deployment

For production (e.g., Vercel):

1. **Use MongoDB Atlas** (not local MongoDB)

2. **Set Environment Variables** in your hosting platform:
   ```
   MONGODB_URI=mongodb+srv://...
   PAYLOAD_SECRET=your-production-secret
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   ```

3. **Whitelist Deployment IPs** in Atlas Network Access

4. **Never commit** `.env.local` to git (already in `.gitignore`)

---

## Summary of Changes Made

✅ **Removed Supabase**:
- Deleted `src/lib/supabase.js`
- Deleted `src/lib/supabase.server.js`
- Removed `@supabase/supabase-js` from package.json
- Updated all data functions to remove Supabase queries
- Cleaned environment variables

✅ **Configured MongoDB**:
- Updated `.env.local` with MongoDB connection
- Payload config already uses `mongooseAdapter`
- Added PAYLOAD_SECRET requirement

✅ **Updated Scripts**:
- `scripts/check-env.js` now checks for MongoDB vars

---

## Need Help?

- **MongoDB Atlas Docs**: https://www.mongodb.com/docs/atlas/
- **Payload CMS Docs**: https://payloadcms.com/docs
- **MongoDB Installation**: https://www.mongodb.com/docs/manual/installation/

Your project is now ready to use MongoDB with Payload CMS! 🚀

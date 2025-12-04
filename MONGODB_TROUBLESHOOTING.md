# MongoDB Troubleshooting & Testing Guide

## Quick Start

Before running your development server, always verify MongoDB is working:

```powershell
npm run check-env      # Verify environment variables
npm run test-mongodb   # Test MongoDB connection
npm run dev            # Start development server
```

---

## Available Commands

### 1. **Check Environment Variables**
```powershell
npm run check-env
```
Verifies that all required environment variables are configured:
- `MONGODB_URI` - MongoDB connection string
- `PAYLOAD_SECRET` - Payload CMS encryption key
- `NEXT_PUBLIC_SITE_URL` - Site URL

**Expected Output:**
```
✓ All required environment variables are present.
✓ MONGODB_URI configured
✓ PAYLOAD_SECRET configured
✓ NEXT_PUBLIC_SITE_URL configured
```

### 2. **Test MongoDB Connection**
```powershell
npm run test-mongodb
```
Tests the actual MongoDB connection and displays:
- Connection status
- Database name
- Available collections
- Total document count (coming soon)

**Expected Output:**
```
🔗 Testing MongoDB connection...
✓ Connected to MongoDB successfully!
✓ MongoDB ping successful
✓ Collections found: videos, categories, models, producers, users
✓ MongoDB is ready to use!
```

---

## Troubleshooting Common Issues

### Issue 1: "ECONNREFUSED" or Connection Timeout
**Symptoms:**
- `MongooseError: connect ECONNREFUSED 127.0.0.1:27017`
- `Error: connect ETIMEDOUT`

**Solutions:**
1. **Using MongoDB Atlas (Cloud):**
   - Check your connection string in `.env.local`
   - Verify IP address is whitelisted in Atlas Network Access
   - Ensure your database username/password are correct
   - Test with: `npm run test-mongodb`

2. **Using Local MongoDB:**
   - Ensure MongoDB service is running:
     ```powershell
     Get-Service -Name MongoDB
     ```
   - Start the service if stopped:
     ```powershell
     Start-Service -Name MongoDB
     ```
   - Install MongoDB if needed (see `MONGODB_SETUP_GUIDE.md`)

### Issue 2: "Authentication Failed"
**Symptoms:**
- `Error: Authentication failed`
- `SASL authentication error`

**Solutions:**
1. Verify credentials in connection string are URL-encoded
2. Check MongoDB Atlas user permissions (should be "Atlas Admin")
3. Regenerate the password in MongoDB Atlas and update `.env.local`
4. Ensure no special characters are breaking the URL

### Issue 3: "PAYLOAD_SECRET is required"
**Symptoms:**
- `Error: PAYLOAD_SECRET environment variable is required`

**Solutions:**
1. Add to `.env.local`:
   ```env
   PAYLOAD_SECRET=your-secure-random-string-here
   ```
2. Generate a secure secret (32+ characters):
   ```powershell
   -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
   ```

### Issue 4: "Network Timeout" or Connection Hangs
**Symptoms:**
- Connection takes 30+ seconds to fail
- Server hangs during startup

**Solutions:**
1. Check internet connection
2. Verify firewall isn't blocking outbound connections
3. Test MongoDB Atlas network access:
   - Go to MongoDB Atlas > Network Access
   - Ensure your IP is whitelisted (use 0.0.0.0/0 for development)
4. Try connecting with MongoDB Compass to test separately

### Issue 5: ".env.local not loading"
**Symptoms:**
- Environment variables show as undefined
- "MONGODB_URI is not defined"

**Solutions:**
1. Ensure `.env.local` exists in project root
2. Check file name is exactly `.env.local` (not `.env` or `.env.local.example`)
3. Restart your development server after creating `.env.local`
4. Verify file is not in `.gitignore` (only `.env.local` should be ignored, not `.env`)

---

## Security Best Practices

### Never Commit `.env.local`
✓ Already protected by `.gitignore`

### Rotate Credentials Regularly
1. Generate new MongoDB Atlas password
2. Update `.env.local`
3. Restart development server

### Use Strong PAYLOAD_SECRET
- Minimum 32 characters
- Mix of uppercase, lowercase, numbers, special characters
- Never share or commit to git

### Whitelist IP Addresses (MongoDB Atlas)
- **Development:** Can use `0.0.0.0/0` (Allow Anywhere)
- **Production:** Whitelist only your deployment IPs
- **Never:** Leave 0.0.0.0/0 for production

---

## MongoDB Connection String Formats

### MongoDB Atlas (Cloud)
```
mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority
```

### Local MongoDB
```
mongodb://localhost:27017/database-name
```

### Local MongoDB with Auth
```
mongodb://username:password@localhost:27017/database-name
```

---

## Verifying Your Setup

### Step 1: Check Environment Variables
```powershell
npm run check-env
```

### Step 2: Test MongoDB Connection
```powershell
npm run test-mongodb
```

### Step 3: Start Development Server
```powershell
npm run dev
```

### Step 4: Access Admin Panel
- Open browser to `http://localhost:3000/admin`
- Should see login screen or create user form

### Step 5: Test Data Operations
1. Log in to admin panel
2. Create a test video/category/model
3. Verify data saves successfully
4. Check it appears in list view

---

## Performance Tuning

Your `payload.config.js` includes optimized MongoDB settings:

```javascript
connectOptions: {
  serverSelectionTimeoutMS: 5000,    // 5 second timeout
  socketTimeoutMS: 45000,             // 45 second socket timeout
}
```

These are well-balanced for development. For production, adjust based on your needs.

---

## Getting Help

### Check These Files
- `MONGODB_SETUP_GUIDE.md` - Complete setup instructions
- `payload.config.js` - MongoDB configuration
- `.env.local` - Connection string and secrets

### Useful Commands
```powershell
# View MongoDB connection logs
npm run dev

# Test connection directly
npm run test-mongodb

# Check if MongoDB is running (local)
Get-Service -Name MongoDB

# Verify port 27017 is open (local)
Test-NetConnection -ComputerName 127.0.0.1 -Port 27017
```

### External Resources
- [MongoDB Atlas Documentation](https://www.mongodb.com/docs/atlas/)
- [Payload CMS Documentation](https://payloadcms.com/docs)
- [MongoDB Troubleshooting](https://www.mongodb.com/docs/manual/troubleshooting/)

---

## Next Steps

✓ MongoDB is configured and working
✓ Environment variables are set
✓ Connection is tested

You can now:
1. Run `npm run dev` to start development
2. Access `http://localhost:3000/admin` to create content
3. Upload videos/images to your R2 bucket
4. Manage your collections through Payload CMS

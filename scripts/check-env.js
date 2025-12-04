// Script to check environment variables
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

console.log('🔍 Checking environment variables...\n')

const envVars = {
  // Database
  DATABASE_URI: process.env.DATABASE_URI || process.env.MONGODB_URI,
  MONGODB_URI: process.env.MONGODB_URI,
  
  // Payload
  PAYLOAD_SECRET: process.env.PAYLOAD_SECRET,
  
  // Site
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL,
  NEXT_PUBLIC_LOGO_URL: process.env.NEXT_PUBLIC_LOGO_URL,
  
  // Vercel
  VERCEL_URL: process.env.VERCEL_URL,
}

console.log('Environment Variables Status:')
console.log('----------------------------')

Object.entries(envVars).forEach(([key, value]) => {
  if (value) {
    // Mask sensitive values
    const displayValue = key.includes('SECRET') || key.includes('KEY') || key.includes('URI')
      ? value.substring(0, 10) + '...'
      : value
    console.log(`✅ ${key}: ${displayValue}`)
  } else {
    console.log(`❌ ${key}: Not set`)
  }
})

console.log('')

// Check if database is configured
if (!envVars.DATABASE_URI && !envVars.MONGODB_URI) {
  console.log('⚠️  Warning: No database connection string found!')
  console.log('   The app will run with mock data.')
}

// Check if Payload secret is set
if (!envVars.PAYLOAD_SECRET) {
  console.log('⚠️  Warning: PAYLOAD_SECRET is not set!')
  console.log('   Generate one using: openssl rand -base64 32')
}

console.log('\n✅ Environment check complete!')

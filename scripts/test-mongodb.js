// Script to test MongoDB connection
import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const uri = process.env.DATABASE_URI || process.env.MONGODB_URI

if (!uri) {
  console.log('❌ No MongoDB connection string found!')
  console.log('   Please set DATABASE_URI or MONGODB_URI in .env.local')
  process.exit(1)
}

console.log('🔍 Testing MongoDB connection...\n')

async function testConnection() {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  })

  try {
    console.log('Connecting to MongoDB...')
    await client.connect()
    
    console.log('✅ Successfully connected to MongoDB!')
    
    // Get database info
    const admin = client.db().admin()
    const dbInfo = await admin.listDatabases()
    
    console.log('\nAvailable databases:')
    dbInfo.databases.forEach((db) => {
      console.log(`  - ${db.name}`)
    })
    
    return true
  } catch (error) {
    console.log('❌ Failed to connect to MongoDB!')
    console.log(`   Error: ${error.message}`)
    
    if (error.message.includes('IP')) {
      console.log('\n💡 Tip: Your IP address may not be whitelisted in MongoDB Atlas.')
      console.log('   Go to MongoDB Atlas > Network Access > Add IP Address')
    }
    
    return false
  } finally {
    await client.close()
    console.log('\nConnection closed.')
  }
}

testConnection()
  .then((success) => {
    process.exit(success ? 0 : 1)
  })
  .catch((err) => {
    console.error('Unexpected error:', err)
    process.exit(1)
  })

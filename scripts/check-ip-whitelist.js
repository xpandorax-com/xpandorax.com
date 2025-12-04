// Script to check public IP address for MongoDB whitelist
import https from 'https'

console.log('🔍 Checking your public IP address...\n')

function getPublicIP() {
  return new Promise((resolve, reject) => {
    https.get('https://api.ipify.org?format=json', (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          resolve(json.ip)
        } catch (e) {
          reject(new Error('Failed to parse IP response'))
        }
      })
    }).on('error', reject)
  })
}

async function main() {
  try {
    const ip = await getPublicIP()
    console.log(`✅ Your public IP address is: ${ip}`)
    console.log('')
    console.log('📋 To whitelist this IP in MongoDB Atlas:')
    console.log('   1. Go to MongoDB Atlas: https://cloud.mongodb.com')
    console.log('   2. Select your cluster')
    console.log('   3. Click "Network Access" in the left sidebar')
    console.log('   4. Click "Add IP Address"')
    console.log(`   5. Enter: ${ip}`)
    console.log('   6. Click "Confirm"')
    console.log('')
    console.log('   Or allow access from anywhere (less secure):')
    console.log('   Enter: 0.0.0.0/0')
  } catch (error) {
    console.log('❌ Failed to get public IP address')
    console.log(`   Error: ${error.message}`)
    process.exit(1)
  }
}

main()

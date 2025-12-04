// Script to validate environment configuration
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const requiredEnvVars = [
  'DATABASE_URI',
  'PAYLOAD_SECRET',
]

const optionalEnvVars = [
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_SERVER_URL',
  'NEXT_PUBLIC_LOGO_URL',
]

console.log('🔍 Validating environment configuration...\n')

let hasErrors = false

// Check required variables
console.log('Required variables:')
requiredEnvVars.forEach((varName) => {
  if (process.env[varName]) {
    console.log(`  ✅ ${varName}: Set`)
  } else {
    console.log(`  ❌ ${varName}: MISSING`)
    hasErrors = true
  }
})

// Check optional variables
console.log('\nOptional variables:')
optionalEnvVars.forEach((varName) => {
  if (process.env[varName]) {
    console.log(`  ✅ ${varName}: Set`)
  } else {
    console.log(`  ⚠️  ${varName}: Not set (using default)`)
  }
})

console.log('')

if (hasErrors) {
  console.log('❌ Configuration validation failed!')
  console.log('Please set the required environment variables in .env.local')
  process.exit(1)
} else {
  console.log('✅ Configuration validation passed!')
}

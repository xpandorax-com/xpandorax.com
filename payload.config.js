import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { Videos } from './src/collections/Videos.js'
import { Categories } from './src/collections/Categories.js'
import { Models } from './src/collections/Models.js'
import { Producers } from './src/collections/Producers.js'
import { Users } from './src/collections/Users.js'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Determine the server URL based on environment
const getServerURL = () => {
  if (process.env.NEXT_PUBLIC_SERVER_URL) return process.env.NEXT_PUBLIC_SERVER_URL
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

const serverURL = getServerURL()

const config = buildConfig({
  serverURL,
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '- Xpandorax CMS',
      favicon: '/favicon.ico',
    },
    autoLogin: false,
  },
  collections: [Users, Videos, Categories, Models, Producers],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || process.env.MONGODB_URI,
    connectOptions: {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
      retryWrites: true,
      w: 'majority',
    },
  }),
  cors: [
    serverURL,
    'https://xpandorax.com',
    'https://www.xpandorax.com',
    'http://localhost:3000',
    'http://localhost:3001',
  ].filter(Boolean),
  csrf: [
    serverURL,
    'https://xpandorax.com',
    'https://www.xpandorax.com',
    'http://localhost:3000',
    'http://localhost:3001',
  ].filter(Boolean),
  rateLimit: {
    trustProxy: true,
    window: 900000, // 15 minutes
    max: 500,
  },
})

export default config

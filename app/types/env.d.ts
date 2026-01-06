/// <reference types="@cloudflare/workers-types" />

declare module "@remix-run/cloudflare" {
  interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
      caches: CacheStorage;
    };
  }
}

interface Env {
  // D1 Database
  DB: D1Database;

  // KV Cache
  CACHE: KVNamespace;

  // App config
  SITE_URL: string;
  APP_URL?: string;
  APP_NAME?: string;

  // Backblaze B2 Storage (S3-compatible API)
  // Used for images and video hosting with Cloudflare CDN delivery
  B2_KEY_ID: string;
  B2_APPLICATION_KEY: string;
  B2_BUCKET_NAME: string;
  B2_BUCKET_ID: string;
  B2_REGION: string; // e.g., 'us-west-004'
  B2_ENDPOINT: string; // e.g., 's3.us-west-004.backblazeb2.com'
  CDN_URL: string; // Cloudflare CDN URL, e.g., 'https://cdn.xpandorax.com'

  // Legacy R2 support (deprecated - migrating to B2)
  MEDIA?: R2Bucket;
  R2_ACCOUNT_ID?: string;
  R2_BUCKET_NAME?: string;
  R2_ACCESS_KEY_ID?: string;
  R2_SECRET_ACCESS_KEY?: string;
  R2_ENDPOINT?: string;
  R2_PUBLIC_URL?: string;

  // Sanity CMS
  SANITY_PROJECT_ID?: string;
  SANITY_DATASET?: string;
  SANITY_API_TOKEN?: string;

  // Secrets
  SESSION_SECRET: string;
  EXOCLICK_ZONE_ID: string;
  JUICYADS_ZONE_ID: string;
}

export {};

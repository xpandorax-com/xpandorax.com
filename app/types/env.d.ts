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

  // R2 Storage (bound via wrangler.toml - NO API KEYS NEEDED AT RUNTIME)
  MEDIA: R2Bucket;

  // KV Cache
  CACHE: KVNamespace;

  // App config
  SITE_URL: string;
  APP_URL?: string;
  APP_NAME?: string;

  // Cloudflare R2 S3-compatible API (only for external/server-side uploads)
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
  LEMON_SQUEEZY_API_KEY: string;
  LEMON_SQUEEZY_WEBHOOK_SECRET: string;
  LEMON_SQUEEZY_STORE_ID: string;
  LEMON_SQUEEZY_VARIANT_ID: string;
  EXOCLICK_ZONE_ID: string;
  JUICYADS_ZONE_ID: string;
}

export {};

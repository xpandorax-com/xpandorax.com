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
  DATABASE: D1Database;

  // R2 Storage
  MEDIA: R2Bucket;

  // KV Cache
  CACHE: KVNamespace;

  // App config
  SITE_URL: string;

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

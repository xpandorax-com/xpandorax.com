import type { AppLoadContext } from "@remix-run/cloudflare";
import { createRequestHandler, logDevReady } from "@remix-run/cloudflare";
// Build types vary between environments - this import is generated at build time
import * as build from "@remix-run/dev/server-build";

if (process.env.NODE_ENV === "development") {
  logDevReady(build);
}

const requestHandler = createRequestHandler(build);

export interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
  SESSION_SECRET: string;
  LEMON_SQUEEZY_API_KEY: string;
  LEMON_SQUEEZY_STORE_ID: string;
  LEMON_SQUEEZY_VARIANT_ID: string;
  LEMON_SQUEEZY_WEBHOOK_SECRET: string;
  EXOCLICK_ZONE_ID: string;
  JUICYADS_ZONE_ID: string;
  SITE_URL: string;
  B2_KEY_ID: string;
  B2_APPLICATION_KEY: string;
  B2_BUCKET_NAME: string;
  B2_BUCKET_ID: string;
  B2_REGION: string;
  B2_ENDPOINT: string;
  CDN_URL: string;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    try {
      const loadContext: AppLoadContext = {
        cloudflare: {
          env,
          ctx,
          caches,
        },
      };

      return await requestHandler(request, loadContext);
    } catch (error) {
      console.error("Worker error:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};

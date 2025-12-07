import { createRequestHandler, type ServerBuild } from "@remix-run/cloudflare";

declare const __STATIC_CONTENT: KVNamespace;

export interface Env {
  DB: D1Database;
  STORAGE: R2Bucket;
  CACHE: KVNamespace;
  SESSION_SECRET: string;
  LEMON_SQUEEZY_API_KEY: string;
  LEMON_SQUEEZY_STORE_ID: string;
  LEMON_SQUEEZY_VARIANT_ID: string;
  LEMON_SQUEEZY_WEBHOOK_SECRET: string;
  EXOCLICK_ZONE_ID: string;
  JUICYADS_ZONE_ID: string;
  SITE_URL: string;
  __STATIC_CONTENT: KVNamespace;
}

// This will be replaced during build
// @ts-expect-error - build import
import * as build from "./build/server/index.js";

const handleRemixRequest = createRequestHandler(build as unknown as ServerBuild);

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    try {
      const loadContext = {
        cloudflare: {
          env,
          ctx,
        },
      };

      return await handleRemixRequest(request, loadContext);
    } catch (error) {
      console.error("Worker error:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};

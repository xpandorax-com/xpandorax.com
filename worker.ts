import { createRequestHandler, type ServerBuild, type AppLoadContext } from "@remix-run/cloudflare";

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

// Dynamically import the build to avoid bundling issues
const getBuild = async (): Promise<ServerBuild> => {
  // @ts-expect-error - dynamic import of build
  const build = await import("./build/server/index.js");
  return build as unknown as ServerBuild;
};

let cachedBuild: ServerBuild | null = null;

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    try {
      if (!cachedBuild) {
        cachedBuild = await getBuild();
      }
      
      const handleRequest = createRequestHandler(cachedBuild);
      
      const loadContext: AppLoadContext = {
        cloudflare: {
          env,
          ctx,
          caches,
        },
      };

      return await handleRequest(request, loadContext);
    } catch (error) {
      console.error("Worker error:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};

import { createPagesFunctionHandler } from "@remix-run/cloudflare-pages";
// @ts-expect-error - build/server is generated at build time
import * as build from "../build/server";

interface PageContext {
  env: Record<string, unknown>;
  waitUntil: (promise: Promise<unknown>) => void;
  passThroughOnException: () => void;
}

export const onRequest = createPagesFunctionHandler({
  build,
  getLoadContext: (context: PageContext) => {
    const env = context.env as Record<string, string>;
    return {
      cloudflare: {
        env,
        ctx: {
          waitUntil: (promise: Promise<unknown>) => context.waitUntil(promise),
          passThroughOnException: () => context.passThroughOnException(),
        },
        caches,
      },
    };
  },
} as any);

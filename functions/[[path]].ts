import { createPagesFunctionHandler } from "@remix-run/cloudflare-pages";
// @ts-expect-error - build/server is generated at build time
import * as build from "../build/server";

export const onRequest = createPagesFunctionHandler({
  build,
  // @ts-expect-error - Cloudflare Pages context structure differs from expected type
  getLoadContext: (context) => ({
    cloudflare: {
      env: context.env,
      ctx: {
        waitUntil: context.waitUntil.bind(context),
        passThroughOnException: context.passThroughOnException.bind(context),
      },
      caches,
    },
  }),
});

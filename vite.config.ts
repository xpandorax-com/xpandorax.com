import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

declare module "@remix-run/cloudflare" {
  interface Future {
    v3_singleFetch: true;
    v3_fetcherPersist: true;
    v3_relativeSplatPath: true;
    v3_throwAbortReason: true;
    v3_lazyRouteDiscovery: true;
  }
}

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_singleFetch: true,
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_lazyRouteDiscovery: true,
      },
      buildEnd: async () => {
        // Post-build: ensure the server bundle is compatible
      },
    }),
    tsconfigPaths(),
  ],
  ssr: {
    resolve: {
      conditions: ["workerd", "worker", "browser"],
    },
    target: "webworker",
    noExternal: true,
  },
  resolve: {
    mainFields: ["browser", "module", "main"],
    alias: {
      "react-dom/server": "react-dom/server.browser",
    },
  },
  build: {
    minify: true,
  },
});

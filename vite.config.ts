import { cloudflareDevProxyVitePlugin } from "@remix-run/dev";
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
    cloudflareDevProxyVitePlugin(),
    remix({
      future: {
        v3_singleFetch: true,
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_lazyRouteDiscovery: true,
      },
      serverBuildFile: "index.js",
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
    manifest: true,
    rollupOptions: {
      output: {
        entryFileNames: "[name].js",
      },
    },
  },
});

import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useEffect } from "react";
import { getSession } from "~/lib/auth";
import { Header } from "~/components/header";
import { Footer } from "~/components/footer";
import { AgeGateModal } from "~/components/age-gate-modal";
import { WebsiteSchema, OrganizationSchema } from "~/components/seo-schema";
import { initWebVitals } from "~/lib/web-vitals";
import type { RootLoaderData } from "~/types";

import "./tailwind.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
  },
];

export async function loader({ request, context }: LoaderFunctionArgs) {
  try {
    const { user } = await getSession(request, context);
    const env = context?.cloudflare?.env;

    return json<RootLoaderData>({
      user,
      appName: env?.APP_NAME || "XpandoraX",
      appUrl: env?.APP_URL || "https://xpandorax.com",
    });
  } catch (error) {
    console.error("Root loader error:", error);
    // Return a safe default even if auth fails
    return json<RootLoaderData>({
      user: null,
      appName: "XpandoraX",
      appUrl: "https://xpandorax.com",
    });
  }
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#7c3aed" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { user, appName, appUrl } = useLoaderData<typeof loader>();

  // Initialize Web Vitals monitoring
  useEffect(() => {
    initWebVitals();
  }, []);

  // Transform serialized user back to proper type for Header
  const headerUser = user ? {
    ...user,
    premiumExpiresAt: user.premiumExpiresAt ? new Date(user.premiumExpiresAt) : null,
    lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : null,
  } : null;

  return (
    <div className="flex min-h-screen flex-col">
      <WebsiteSchema name={appName} url={appUrl} description="Premium Video Directory Platform" />
      <OrganizationSchema name={appName} url={appUrl} />
      <Header user={headerUser} appName={appName} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer appName={appName} />
      <AgeGateModal />
    </div>
  );
}

export function ErrorBoundary() {
  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Error - XpandoraX</title>
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center">
          <h1 className="text-4xl font-bold">Something went wrong</h1>
          <p className="mt-4 text-muted-foreground">
            We&apos;re sorry, but something went wrong. Please try again later.
          </p>
          <a
            href="/"
            className="mt-6 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
          >
            Go Home
          </a>
        </div>
        <Scripts />
      </body>
    </html>
  );
}

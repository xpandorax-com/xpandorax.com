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
import { getSession } from "~/lib/auth";
import { Header } from "~/components/header";
import { Footer } from "~/components/footer";
import { AgeGateModal } from "~/components/age-gate-modal";
import { PopUnderAds } from "~/components/ads";
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
  const { user } = await getSession(request, context);
  const env = context?.cloudflare?.env;

  // Check premium status (also check expiry date)
  let isPremium = false;
  if (user?.isPremium) {
    if (user.premiumExpiresAt) {
      isPremium = new Date(user.premiumExpiresAt) > new Date();
    } else {
      isPremium = true;
    }
  }

  // Only return ad config for non-premium users
  const adConfig = isPremium
    ? null
    : {
        exoclickZoneId: env?.EXOCLICK_ZONE_ID || "",
        juicyadsZoneId: env?.JUICYADS_ZONE_ID || "",
      };

  return json<RootLoaderData>({
    user,
    isPremium,
    adConfig,
    appName: env?.APP_NAME || "XpandoraX",
    appUrl: env?.APP_URL || "https://xpandorax.com",
  });
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
  const { user, isPremium, adConfig, appName } = useLoaderData<typeof loader>();

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} isPremium={isPremium} appName={appName} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer appName={appName} />
      <AgeGateModal />
      <PopUnderAds adConfig={adConfig} />
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

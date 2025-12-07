import type { LoaderFunctionArgs } from "@remix-run/cloudflare";

// GitHub OAuth for Decap CMS
export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const provider = url.searchParams.get("provider");
  
  if (provider !== "github") {
    return new Response("Invalid provider", { status: 400 });
  }

  const env = context.cloudflare.env as {
    GITHUB_CLIENT_ID?: string;
    GITHUB_CLIENT_SECRET?: string;
  };

  const clientId = env.GITHUB_CLIENT_ID;
  
  if (!clientId) {
    return new Response("GitHub OAuth not configured", { status: 500 });
  }

  const scope = url.searchParams.get("scope") || "repo,user";
  const siteId = url.searchParams.get("site_id") || "xpandorax.com";
  
  // Store state for CSRF protection
  const state = crypto.randomUUID();
  
  const redirectUri = `${url.origin}/api/auth/callback`;
  
  const githubAuthUrl = new URL("https://github.com/login/oauth/authorize");
  githubAuthUrl.searchParams.set("client_id", clientId);
  githubAuthUrl.searchParams.set("redirect_uri", redirectUri);
  githubAuthUrl.searchParams.set("scope", scope);
  githubAuthUrl.searchParams.set("state", `${state}:${siteId}`);

  return Response.redirect(githubAuthUrl.toString(), 302);
}

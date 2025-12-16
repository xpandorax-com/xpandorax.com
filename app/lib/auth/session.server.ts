import type { Session, User } from "lucia";
import type { AppLoadContext } from "@remix-run/cloudflare";
import { createLucia, type Auth } from "./lucia";
import { createDatabase, type Database } from "~/db";

export interface SessionData {
  user: User | null;
  session: Session | null;
}

// Helper to safely get env from context
function getEnv(context: AppLoadContext) {
  // Handle both production (context.cloudflare.env) and potential dev variations
  if (context?.cloudflare?.env) {
    return context.cloudflare.env;
  }
  // Fallback for edge cases
  return (context as Record<string, unknown>)?.env as AppLoadContext["cloudflare"]["env"] | undefined;
}

export async function getSession(
  request: Request,
  context: AppLoadContext
): Promise<{ session: Session | null; user: User | null; lucia: Auth | null; db: Database | null }> {
  const env = getEnv(context);
  
  // If no database binding available, return null session
  if (!env?.DB) {
    return { session: null, user: null, lucia: null, db: null };
  }

  const db = createDatabase(env.DB);
  const lucia = createLucia(db);

  const cookieHeader = request.headers.get("Cookie");
  const sessionId = lucia.readSessionCookie(cookieHeader ?? "");

  if (!sessionId) {
    return { session: null, user: null, lucia, db };
  }

  const result = await lucia.validateSession(sessionId);
  return { ...result, lucia, db };
}

export async function requireAuth(
  request: Request,
  context: AppLoadContext
): Promise<{ session: Session; user: User; lucia: Auth; db: Database }> {
  const { session, user, lucia, db } = await getSession(request, context);

  if (!session || !user || !lucia || !db) {
    throw new Response("Unauthorized", { status: 401 });
  }

  return { session, user, lucia, db };
}

export async function requireAdmin(
  request: Request,
  context: AppLoadContext
): Promise<{ session: Session; user: User; lucia: Auth; db: Database }> {
  const { session, user, lucia, db } = await requireAuth(request, context);

  if (user.role !== "admin") {
    throw new Response("Forbidden", { status: 403 });
  }

  return { session, user, lucia, db };
}

export function createSessionCookie(lucia: Auth, sessionId: string): string {
  return lucia.createSessionCookie(sessionId).serialize();
}

export function createBlankSessionCookie(lucia: Auth): string {
  return lucia.createBlankSessionCookie().serialize();
}

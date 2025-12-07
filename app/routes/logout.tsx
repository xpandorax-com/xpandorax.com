import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";
import { getSession, createBlankSessionCookie, createLucia } from "~/lib/auth";
import { createDatabase } from "~/db";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const db = createDatabase(context.cloudflare.env.DB);
  const lucia = createLucia(db);
  const { session } = await getSession(request, context);

  if (session) {
    await lucia.invalidateSession(session.id);
  }

  return redirect("/", {
    headers: {
      "Set-Cookie": createBlankSessionCookie(lucia),
    },
  });
}

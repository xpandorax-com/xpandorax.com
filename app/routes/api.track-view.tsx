import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { eq, and, sql } from "drizzle-orm";
import { contentViews } from "~/db/schema";

// Rate limiting map (in-memory, per worker instance)
const viewedRecently = new Map<string, number>();
const VIEW_COOLDOWN = 30 * 1000; // 30 seconds cooldown per item per IP

// Clean up old entries periodically
function cleanupOldEntries() {
  const now = Date.now();
  for (const [key, timestamp] of viewedRecently.entries()) {
    if (now - timestamp > VIEW_COOLDOWN) {
      viewedRecently.delete(key);
    }
  }
}

export async function action({ request, context }: ActionFunctionArgs) {
  // Only allow POST requests
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { type, id } = body as { type: string; id: string };

    // Validate input
    if (!type || !id) {
      return json({ error: "Missing type or id" }, { status: 400 });
    }

    if (!["video", "picture", "actress"].includes(type)) {
      return json({ error: "Invalid type" }, { status: 400 });
    }

    // Get client IP for rate limiting
    const clientIP = request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      "unknown";

    // Rate limiting check
    const rateKey = `${clientIP}:${type}:${id}`;
    const lastViewed = viewedRecently.get(rateKey);
    const now = Date.now();

    if (lastViewed && now - lastViewed < VIEW_COOLDOWN) {
      // Already counted this view recently
      return json({ success: true, counted: false, message: "View already counted recently" });
    }

    // Clean up old entries occasionally
    if (Math.random() < 0.1) {
      cleanupOldEntries();
    }

    // Mark as viewed
    viewedRecently.set(rateKey, now);

    // Increment view count in D1 database
    const env = context.cloudflare.env;
    const db = drizzle(env.DB);

    try {
      // Check if record exists
      const existing = await db
        .select()
        .from(contentViews)
        .where(
          and(
            eq(contentViews.contentId, id),
            eq(contentViews.contentType, type as "video" | "picture" | "actress")
          )
        )
        .limit(1);

      if (existing.length > 0) {
        // Update existing record - increment views
        await db
          .update(contentViews)
          .set({
            views: sql`${contentViews.views} + 1`,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(contentViews.contentId, id),
              eq(contentViews.contentType, type as "video" | "picture" | "actress")
            )
          );
      } else {
        // Insert new record with 1 view
        await db.insert(contentViews).values({
          id: crypto.randomUUID(),
          contentId: id,
          contentType: type as "video" | "picture" | "actress",
          views: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      return json({ success: true, counted: true });
    } catch (dbError) {
      console.error("Error updating D1 view count:", dbError);
      // Still return success since the view was acknowledged
      return json({ success: true, counted: true, warning: "View acknowledged but count update may have failed" });
    }
  } catch (error) {
    console.error("Error tracking view:", error);
    return json({ error: "Failed to track view" }, { status: 500 });
  }
}

// Loader to get view count for a specific content
export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const type = url.searchParams.get("type");

  if (!id || !type) {
    return json({ error: "Missing id or type parameter" }, { status: 400 });
  }

  if (!["video", "picture", "actress"].includes(type)) {
    return json({ error: "Invalid type" }, { status: 400 });
  }

  try {
    const env = context.cloudflare.env;
    const db = drizzle(env.DB);

    const result = await db
      .select({ views: contentViews.views })
      .from(contentViews)
      .where(
        and(
          eq(contentViews.contentId, id),
          eq(contentViews.contentType, type as "video" | "picture" | "actress")
        )
      )
      .limit(1);

    return json({ views: result[0]?.views || 0 });
  } catch (error) {
    console.error("Error fetching view count:", error);
    return json({ views: 0 });
  }
}

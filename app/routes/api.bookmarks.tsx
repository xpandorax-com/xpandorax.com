import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { eq, and, desc } from "drizzle-orm";
import { bookmarks } from "~/db/schema";
import { getSession } from "~/lib/auth";

// GET /api/bookmarks - Get user's bookmarks
export async function loader({ request, context }: LoaderFunctionArgs) {
  const { user } = await getSession(request, context);
  
  if (!user) {
    return json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const db = drizzle(context.cloudflare.env.DB);
  
  const userBookmarks = await db
    .select()
    .from(bookmarks)
    .where(eq(bookmarks.userId, user.id))
    .orderBy(desc(bookmarks.createdAt));

  return json({ 
    success: true, 
    bookmarks: userBookmarks.map(b => ({
      id: b.id,
      videoId: b.videoId,
      createdAt: b.createdAt,
    }))
  });
}

// POST /api/bookmarks - Add or remove bookmark
export async function action({ request, context }: ActionFunctionArgs) {
  const { user } = await getSession(request, context);
  
  if (!user) {
    return json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const videoId = formData.get("videoId") as string;
  const action = formData.get("action") as string; // "add" or "remove"

  if (!videoId) {
    return json({ success: false, error: "Video ID required" }, { status: 400 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  if (action === "remove") {
    // Remove bookmark
    await db
      .delete(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, user.id),
          eq(bookmarks.videoId, videoId)
        )
      );

    return json({ success: true, bookmarked: false });
  }

  // Check if already bookmarked
  const existing = await db
    .select()
    .from(bookmarks)
    .where(
      and(
        eq(bookmarks.userId, user.id),
        eq(bookmarks.videoId, videoId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    // Already bookmarked, remove it (toggle behavior)
    await db
      .delete(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, user.id),
          eq(bookmarks.videoId, videoId)
        )
      );

    return json({ success: true, bookmarked: false });
  }

  // Add new bookmark
  await db.insert(bookmarks).values({
    id: crypto.randomUUID(),
    userId: user.id,
    videoId,
    createdAt: new Date(),
  });

  return json({ success: true, bookmarked: true });
}

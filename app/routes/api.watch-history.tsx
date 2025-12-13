import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { eq, and, desc } from "drizzle-orm";
import { watchHistory } from "~/db/schema";
import { getSession } from "~/lib/auth";

// GET /api/watch-history - Get user's watch history
export async function loader({ request, context }: LoaderFunctionArgs) {
  const { user } = await getSession(request, context);
  
  if (!user) {
    return json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 50));
  const offset = Math.max(0, Number(url.searchParams.get("offset")) || 0);

  const db = drizzle(context.cloudflare.env.DB);
  
  const history = await db
    .select()
    .from(watchHistory)
    .where(eq(watchHistory.userId, user.id))
    .orderBy(desc(watchHistory.watchedAt))
    .limit(limit)
    .offset(offset);

  return json({ 
    success: true, 
    history: history.map(h => ({
      id: h.id,
      videoId: h.videoId,
      watchedAt: h.watchedAt,
      watchDuration: h.watchDuration,
      completed: h.completed,
      lastPosition: h.lastPosition,
    }))
  });
}

// POST /api/watch-history - Update watch progress
export async function action({ request, context }: ActionFunctionArgs) {
  const { user } = await getSession(request, context);
  
  if (!user) {
    return json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const videoId = formData.get("videoId") as string;
  const position = Number(formData.get("position")) || 0;
  const duration = Number(formData.get("duration")) || 0;
  const completed = formData.get("completed") === "true";
  const action = formData.get("action") as string;

  if (!videoId) {
    return json({ success: false, error: "Video ID required" }, { status: 400 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Handle clear history action
  if (action === "clear") {
    await db
      .delete(watchHistory)
      .where(eq(watchHistory.userId, user.id));

    return json({ success: true, cleared: true });
  }

  // Handle remove single item
  if (action === "remove") {
    await db
      .delete(watchHistory)
      .where(
        and(
          eq(watchHistory.userId, user.id),
          eq(watchHistory.videoId, videoId)
        )
      );

    return json({ success: true, removed: true });
  }

  // Check if entry exists
  const existing = await db
    .select()
    .from(watchHistory)
    .where(
      and(
        eq(watchHistory.userId, user.id),
        eq(watchHistory.videoId, videoId)
      )
    )
    .limit(1);

  const now = new Date();

  if (existing.length > 0) {
    // Update existing entry
    await db
      .update(watchHistory)
      .set({
        watchedAt: now,
        watchDuration: duration,
        lastPosition: position,
        completed: completed || existing[0].completed,
        updatedAt: now,
      })
      .where(
        and(
          eq(watchHistory.userId, user.id),
          eq(watchHistory.videoId, videoId)
        )
      );
  } else {
    // Create new entry
    await db.insert(watchHistory).values({
      id: crypto.randomUUID(),
      userId: user.id,
      videoId,
      watchedAt: now,
      watchDuration: duration,
      lastPosition: position,
      completed,
      createdAt: now,
      updatedAt: now,
    });
  }

  return json({ success: true, position, duration, completed });
}

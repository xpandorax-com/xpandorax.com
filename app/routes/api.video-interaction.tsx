import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { eq, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { videos, videoInteractions } from "~/db/schema";

// Helper function to generate a visitor ID from IP using Web Crypto API
async function generateVisitorId(ip: string, userAgent: string): Promise<string> {
  const data = `${ip}-${userAgent}`;
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex.substring(0, 32);
}

export async function action({ request, context }: ActionFunctionArgs) {
  // Only allow POST requests
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { videoId, action } = body as { videoId: string; action: "like" | "dislike" | "remove" };

    // Validate input
    if (!videoId) {
      return json({ error: "Missing videoId" }, { status: 400 });
    }

    if (!["like", "dislike", "remove"].includes(action)) {
      return json({ error: "Invalid action. Must be 'like', 'dislike', or 'remove'" }, { status: 400 });
    }

    // Get client IP for visitor identification
    const clientIP = request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";
    const visitorId = await generateVisitorId(clientIP, userAgent);

    const env = context.cloudflare.env;
    const db = drizzle(env.DB);

    // Check if user already has an interaction for this video
    const existingInteraction = await db
      .select()
      .from(videoInteractions)
      .where(
        and(
          eq(videoInteractions.videoId, videoId),
          eq(videoInteractions.visitorId, visitorId)
        )
      )
      .limit(1);

    const previousInteraction = existingInteraction[0]?.interactionType;

    // Handle remove action
    if (action === "remove") {
      if (previousInteraction) {
        // Remove the interaction
        await db
          .delete(videoInteractions)
          .where(
            and(
              eq(videoInteractions.videoId, videoId),
              eq(videoInteractions.visitorId, visitorId)
            )
          );

        // Decrement the appropriate counter
        if (previousInteraction === "like") {
          await db
            .update(videos)
            .set({ likes: sql`${videos.likes} - 1` })
            .where(eq(videos.id, videoId));
        } else if (previousInteraction === "dislike") {
          await db
            .update(videos)
            .set({ dislikes: sql`${videos.dislikes} - 1` })
            .where(eq(videos.id, videoId));
        }
      }

      return json({
        success: true,
        action: "removed",
        previousInteraction: previousInteraction || null,
      });
    }

    // If user is changing their vote (e.g., like -> dislike)
    if (previousInteraction && previousInteraction !== action) {
      // Update the interaction type
      await db
        .update(videoInteractions)
        .set({ 
          interactionType: action,
          createdAt: new Date(),
        })
        .where(
          and(
            eq(videoInteractions.videoId, videoId),
            eq(videoInteractions.visitorId, visitorId)
          )
        );

      // Swap the counters
      if (previousInteraction === "like" && action === "dislike") {
        await db
          .update(videos)
          .set({ 
            likes: sql`${videos.likes} - 1`,
            dislikes: sql`${videos.dislikes} + 1`,
          })
          .where(eq(videos.id, videoId));
      } else if (previousInteraction === "dislike" && action === "like") {
        await db
          .update(videos)
          .set({ 
            likes: sql`${videos.likes} + 1`,
            dislikes: sql`${videos.dislikes} - 1`,
          })
          .where(eq(videos.id, videoId));
      }

      return json({
        success: true,
        action: action,
        changed: true,
        previousInteraction,
      });
    }

    // If user already has the same interaction, do nothing (toggle off)
    if (previousInteraction === action) {
      // Remove the interaction (toggle off)
      await db
        .delete(videoInteractions)
        .where(
          and(
            eq(videoInteractions.videoId, videoId),
            eq(videoInteractions.visitorId, visitorId)
          )
        );

      // Decrement the counter
      if (action === "like") {
        await db
          .update(videos)
          .set({ likes: sql`${videos.likes} - 1` })
          .where(eq(videos.id, videoId));
      } else {
        await db
          .update(videos)
          .set({ dislikes: sql`${videos.dislikes} - 1` })
          .where(eq(videos.id, videoId));
      }

      return json({
        success: true,
        action: "removed",
        toggled: true,
      });
    }

    // New interaction - insert it
    const id = crypto.randomUUID();
    await db.insert(videoInteractions).values({
      id,
      videoId,
      visitorId,
      interactionType: action,
      createdAt: new Date(),
    });

    // Increment the appropriate counter
    if (action === "like") {
      await db
        .update(videos)
        .set({ likes: sql`${videos.likes} + 1` })
        .where(eq(videos.id, videoId));
    } else {
      await db
        .update(videos)
        .set({ dislikes: sql`${videos.dislikes} + 1` })
        .where(eq(videos.id, videoId));
    }

    return json({
      success: true,
      action,
      isNew: true,
    });
  } catch (error) {
    console.error("Error processing video interaction:", error);
    return json({ error: "Failed to process interaction" }, { status: 500 });
  }
}

// GET endpoint to check user's current interaction status
export async function loader({ request, context }: ActionFunctionArgs) {
  const url = new URL(request.url);
  const videoId = url.searchParams.get("videoId");

  if (!videoId) {
    return json({ error: "Missing videoId" }, { status: 400 });
  }

  // Get client IP for visitor identification
  const clientIP = request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  const visitorId = await generateVisitorId(clientIP, userAgent);

  const env = context.cloudflare.env;
  const db = drizzle(env.DB);

  try {
    // Check user's current interaction
    const existingInteraction = await db
      .select()
      .from(videoInteractions)
      .where(
        and(
          eq(videoInteractions.videoId, videoId),
          eq(videoInteractions.visitorId, visitorId)
        )
      )
      .limit(1);

    // Get current counts
    const video = await db
      .select({ likes: videos.likes, dislikes: videos.dislikes })
      .from(videos)
      .where(eq(videos.id, videoId))
      .limit(1);

    return json({
      userInteraction: existingInteraction[0]?.interactionType || null,
      likes: video[0]?.likes || 0,
      dislikes: video[0]?.dislikes || 0,
    });
  } catch (error) {
    console.error("Error fetching interaction status:", error);
    return json({ error: "Failed to fetch interaction status" }, { status: 500 });
  }
}

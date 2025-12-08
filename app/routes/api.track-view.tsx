import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { createSanityWriteClient } from "~/lib/sanity";

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

    const env = context.cloudflare.env;

    // Create Sanity client with write access
    const sanity = createSanityWriteClient(env);

    // Validate the document type - pictures track views on actress
    // Videos track views on video documents
    if (type !== "video" && type !== "picture" && type !== "actress") {
      return json({ error: "Invalid type" }, { status: 400 });
    }

    // Increment the view count using Sanity's patch API
    // The id should be the Sanity document ID (_id)
    await sanity
      .patch(id)
      .setIfMissing({ views: 0 })
      .inc({ views: 1 })
      .commit();

    return json({ success: true, counted: true });
  } catch (error) {
    console.error("Error tracking view:", error);
    return json({ error: "Failed to track view" }, { status: 500 });
  }
}

// Loader to handle non-POST requests
export async function loader() {
  return json({ error: "Method not allowed" }, { status: 405 });
}

import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";

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

export async function action({ request }: ActionFunctionArgs) {
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

    // Note: View counts are now handled by Sanity CMS or external analytics
    // This endpoint serves as a rate-limited acknowledgment of views
    // You can integrate with Sanity's API to increment view counts if needed

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

import { useEffect, useRef } from "react";

interface TrackViewResponse {
  success: boolean;
  counted: boolean;
  message?: string;
  warning?: string;
}

interface UseViewTrackerOptions {
  type: "video" | "picture" | "actress";
  id: string;
  enabled?: boolean;
  onViewCounted?: () => void;
}

/**
 * Hook to track views for videos, pictures, and actresses.
 * Automatically increments view count when the component mounts.
 * Includes debouncing to prevent duplicate tracking.
 */
export function useViewTracker({ type, id, enabled = true, onViewCounted }: UseViewTrackerOptions) {
  const hasTracked = useRef(false);
  const onViewCountedRef = useRef(onViewCounted);
  
  // Keep the callback ref up to date
  useEffect(() => {
    onViewCountedRef.current = onViewCounted;
  }, [onViewCounted]);

  useEffect(() => {
    // Only track once per mount and if enabled
    if (!enabled || hasTracked.current || !id) {
      return;
    }

    // Mark as tracked immediately to prevent double-tracking
    hasTracked.current = true;

    // Track the view
    const trackView = async () => {
      try {
        const response = await fetch("/api/track-view", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ type, id }),
        });

        if (response.ok) {
          const data = await response.json() as TrackViewResponse;
          // Only call callback if the view was actually counted (not rate-limited)
          if (data.counted && onViewCountedRef.current) {
            onViewCountedRef.current();
          }
        } else {
          console.warn("Failed to track view:", await response.text());
        }
      } catch (error) {
        console.warn("Error tracking view:", error);
      }
    };

    // Small delay to ensure the page has loaded and user is actually viewing
    const timeoutId = setTimeout(trackView, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [type, id, enabled]);
}

/**
 * Track a view imperatively (for use outside of React components or for manual tracking)
 */
export async function trackView(type: "video" | "picture" | "actress", id: string): Promise<boolean> {
  try {
    const response = await fetch("/api/track-view", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type, id }),
    });

    return response.ok;
  } catch (error) {
    console.warn("Error tracking view:", error);
    return false;
  }
}

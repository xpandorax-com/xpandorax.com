/**
 * Web Vitals tracking utility
 * Monitors Core Web Vitals: LCP, FID, CLS, TTFB, INP
 */

interface Metric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  id: string;
  entries: PerformanceEntry[];
}

type ReportHandler = (metric: Metric) => void;

// Thresholds for each metric (in milliseconds for timing metrics)
const thresholds = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
};

function getRating(name: string, value: number): "good" | "needs-improvement" | "poor" {
  const threshold = thresholds[name as keyof typeof thresholds];
  if (!threshold) return "good";
  
  if (value <= threshold.good) return "good";
  if (value <= threshold.poor) return "needs-improvement";
  return "poor";
}

// Generate unique ID
function generateId(): string {
  return `v${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// Report metric to analytics endpoint
export function reportWebVitals(metric: Metric) {
  // Log to console in development
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    console.log(`[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`);
  }

  // Send to analytics endpoint
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      page: typeof window !== "undefined" ? window.location.pathname : "",
      timestamp: Date.now(),
    });

    navigator.sendBeacon("/api/analytics/vitals", body);
  }
}

// Observe Largest Contentful Paint (LCP)
export function observeLCP(onReport: ReportHandler) {
  if (typeof window === "undefined" || !("PerformanceObserver" in window)) return;

  let lcp: PerformanceEntry | null = null;

  const observer = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    lcp = entries[entries.length - 1];
  });

  observer.observe({ type: "largest-contentful-paint", buffered: true });

  // Report on page hide
  const reportLCP = () => {
    if (lcp) {
      const value = (lcp as PerformanceEntry & { startTime: number }).startTime;
      onReport({
        name: "LCP",
        value,
        rating: getRating("LCP", value),
        delta: value,
        id: generateId(),
        entries: [lcp],
      });
    }
  };

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      reportLCP();
    }
  });
}

// Observe First Input Delay (FID)
export function observeFID(onReport: ReportHandler) {
  if (typeof window === "undefined" || !("PerformanceObserver" in window)) return;

  const observer = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    entries.forEach((entry) => {
      const fidEntry = entry as PerformanceEntry & { processingStart: number; startTime: number };
      const value = fidEntry.processingStart - fidEntry.startTime;
      onReport({
        name: "FID",
        value,
        rating: getRating("FID", value),
        delta: value,
        id: generateId(),
        entries: [entry],
      });
    });
  });

  observer.observe({ type: "first-input", buffered: true });
}

// Observe Cumulative Layout Shift (CLS)
export function observeCLS(onReport: ReportHandler) {
  if (typeof window === "undefined" || !("PerformanceObserver" in window)) return;

  let cls = 0;
  let clsEntries: PerformanceEntry[] = [];

  const observer = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    entries.forEach((entry) => {
      const layoutShift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
      if (!layoutShift.hadRecentInput) {
        cls += layoutShift.value;
        clsEntries.push(entry);
      }
    });
  });

  observer.observe({ type: "layout-shift", buffered: true });

  // Report on page hide
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden" && cls > 0) {
      onReport({
        name: "CLS",
        value: cls,
        rating: getRating("CLS", cls),
        delta: cls,
        id: generateId(),
        entries: clsEntries,
      });
    }
  });
}

// Observe Time to First Byte (TTFB)
export function observeTTFB(onReport: ReportHandler) {
  if (typeof window === "undefined") return;

  const navigationEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
  
  if (navigationEntry) {
    const value = navigationEntry.responseStart - navigationEntry.requestStart;
    onReport({
      name: "TTFB",
      value,
      rating: getRating("TTFB", value),
      delta: value,
      id: generateId(),
      entries: [navigationEntry],
    });
  }
}

// Initialize all Web Vitals observers
export function initWebVitals(onReport: ReportHandler = reportWebVitals) {
  if (typeof window === "undefined") return;

  // Wait for page load
  if (document.readyState === "complete") {
    observeLCP(onReport);
    observeFID(onReport);
    observeCLS(onReport);
    observeTTFB(onReport);
  } else {
    window.addEventListener("load", () => {
      observeLCP(onReport);
      observeFID(onReport);
      observeCLS(onReport);
      observeTTFB(onReport);
    });
  }
}

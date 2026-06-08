"use client";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export type AnalyticsEventParams = Record<
  string,
  string | number | boolean | undefined
>;

export function trackEvent(
  eventName: string,
  params: AnalyticsEventParams = {},
) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", eventName, params);
}

export function trackKvEvent(
  eventName: string,
  params: AnalyticsEventParams = {},
) {
  trackEvent(eventName, {
    ...params,
    source: "kv_partners",
  });
}

"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

type GoogleAnalyticsProps = {
  measurementId?: string;
};

const pageTitle = () => document.title || "KV Partners";

function trackPageView(measurementId: string, path: string) {
  window.gtag?.("event", "page_view", {
    page_location: window.location.href,
    page_path: path,
    page_referrer: document.referrer,
    page_title: pageTitle(),
    send_to: measurementId,
  });
}

function trackEngagement(measurementId: string, startedAt: number, path: string) {
  const engagementTime = Math.max(Date.now() - startedAt, 0);

  if (engagementTime < 1000) {
    return;
  }

  window.gtag?.("event", "user_engagement", {
    engagement_time_msec: engagementTime,
    page_location: window.location.href,
    page_path: path,
    page_title: pageTitle(),
    send_to: measurementId,
  });
}

function GoogleAnalyticsTracker({ measurementId }: Required<GoogleAnalyticsProps>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageStartedAtRef = useRef(Date.now());
  const previousPathRef = useRef("");

  useEffect(() => {
    const query = searchParams.toString();
    const currentPath = query ? `${pathname}?${query}` : pathname;

    if (previousPathRef.current) {
      trackEngagement(
        measurementId,
        pageStartedAtRef.current,
        previousPathRef.current,
      );
    }

    previousPathRef.current = currentPath;
    pageStartedAtRef.current = Date.now();
    trackPageView(measurementId, currentPath);
  }, [measurementId, pathname, searchParams]);

  useEffect(() => {
    const sendCurrentEngagement = () => {
      trackEngagement(
        measurementId,
        pageStartedAtRef.current,
        previousPathRef.current || window.location.pathname,
      );
      pageStartedAtRef.current = Date.now();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        sendCurrentEngagement();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", sendCurrentEngagement);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", sendCurrentEngagement);
      sendCurrentEngagement();
    };
  }, [measurementId]);

  return null;
}

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  if (!measurementId) {
    return null;
  }

  return (
    <>
      <Script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', { send_page_view: false });
        `}
      </Script>
      <Suspense fallback={null}>
        <GoogleAnalyticsTracker measurementId={measurementId} />
      </Suspense>
    </>
  );
}

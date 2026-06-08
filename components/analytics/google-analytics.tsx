"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

import { trackEvent, trackKvEvent } from "@/lib/analytics";

type GoogleAnalyticsProps = {
  measurementId?: string;
};

const pageTitle = () => document.title || "KV Partners";

const centerNamesByPath: Record<string, string> = {
  "/accounts": "Contas",
  "/ai-copilot": "Assistente Estratégico",
  "/executive-center": "Centro Executivo",
  "/feedback-center": "Centro de Feedbacks",
  "/growth-center": "Centro de Crescimento",
  "/onboarding-center": "Centro de Onboarding",
  "/risk-center": "Centro de Riscos",
};

function trackPageView(measurementId: string, path: string) {
  trackEvent("page_view", {
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

  trackEvent("user_engagement", {
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
    const centerName = centerNamesByPath[pathname];

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

    if (centerName) {
      trackKvEvent("center_view", {
        center_name: centerName,
        page_path: currentPath,
      });
    }
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

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const link = target.closest("a");

      if (!(link instanceof HTMLAnchorElement) || !link.href) {
        return;
      }

      const url = new URL(link.href);

      if (url.origin === window.location.origin) {
        return;
      }

      trackKvEvent("external_link_click", {
        link_label: link.innerText.trim() || link.getAttribute("aria-label") || url.hostname,
        link_url: url.href,
        page_path: window.location.pathname + window.location.search,
      });
    };

    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

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
          window.gtag = function gtag(){window.dataLayer.push(arguments);}
          window.gtag('js', new Date());
          window.gtag('config', '${measurementId}', { send_page_view: false });
        `}
      </Script>
      <Suspense fallback={null}>
        <GoogleAnalyticsTracker measurementId={measurementId} />
      </Suspense>
    </>
  );
}

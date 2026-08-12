'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { canTrackAnalytics } from '@/utils/analytics';
import { getAllowedAnalyticsHosts } from '@/config/site';
import { useSession } from 'next-auth/react';

export default function GoogleAnalytics({ analyticsId, facebookPixelId }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const trackedPathRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    window.__ANALYTICS_SESSION_READY__ = status !== 'loading';
    if (status === 'loading') return;

    window.__USER_ROLE__ = session?.user?.role || null;
    
    const hostname = window.location.hostname;
    const role = window.__USER_ROLE__;

    const query = searchParams?.toString();
    const pagePath = query ? `${pathname}?${query}` : pathname;

    // Track Google Analytics page views manually
    if (analyticsId && window.gtag) {
      if (trackedPathRef.current !== pagePath) {
        if (canTrackAnalytics({ host: hostname, pathname, role })) {
          window.gtag('event', 'page_view', {
            page_path: pagePath,
            page_location: window.location.href,
            page_title: document.title,
          });
        }
        trackedPathRef.current = pagePath;
      }
    }

    // Track Facebook Pixel page views
    if (facebookPixelId && window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, [pathname, searchParams, analyticsId, facebookPixelId, session, status]);

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const allowedHosts = getAllowedAnalyticsHosts();
    if (!allowedHosts.includes(hostname)) return null;
  }

  return (
    <>
      {/* Google Analytics */}
      {analyticsId && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${analyticsId}`}
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${analyticsId}', {
                  send_page_view: false,
                });
              `,
            }}
          />
        </>
      )}

      {/* Facebook Pixel */}
      {facebookPixelId && (
        <Script
          id="facebook-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${facebookPixelId}');
              fbq('track', 'PageView');
            `,
          }}
        />
      )}
    </>
  );
}

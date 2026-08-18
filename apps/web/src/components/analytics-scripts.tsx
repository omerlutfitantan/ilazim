"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import {
  allowsPreferences,
  CONSENT_SAVED_EVENT,
  readClientConsent,
  type ConsentChoice,
} from "@/lib/consent";

function safeId(value: string | null | undefined) {
  const trimmed = value?.trim() ?? "";
  if (!trimmed || !/^[A-Z0-9_-]+$/i.test(trimmed)) return "";
  return trimmed;
}

export function AnalyticsScripts({
  gtmId,
  gaId,
  adsId,
  initialConsent,
}: {
  gtmId?: string | null;
  gaId?: string | null;
  adsId?: string | null;
  initialConsent: ConsentChoice | null;
}) {
  const [allowed, setAllowed] = useState(allowsPreferences(initialConsent));
  const gtm = safeId(gtmId);
  const ga = safeId(gaId);
  const ads = safeId(adsId);

  useEffect(() => {
    function sync() {
      setAllowed(allowsPreferences(readClientConsent()));
    }
    window.addEventListener(CONSENT_SAVED_EVENT, sync);
    return () => window.removeEventListener(CONSENT_SAVED_EVENT, sync);
  }, []);

  if (!allowed || (!gtm && !ga && !ads)) return null;

  if (gtm) {
    return (
      <>
        <Script id="ilazim-gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtm}');`}
        </Script>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${gtm}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
      </>
    );
  }

  const gtagId = ga || ads;
  return (
    <>
      <Script
        id="ilazim-gtag-src"
        src={`https://www.googletagmanager.com/gtag/js?id=${gtagId}`}
        strategy="afterInteractive"
      />
      <Script id="ilazim-gtag" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
${ga ? `gtag('config', '${ga}');` : ""}
${ads ? `gtag('config', '${ads}');` : ""}`}
      </Script>
    </>
  );
}

import { Suspense } from "react";
import Script from "next/script";
import "@/index.css";
import { Providers } from "@/app/providers";
import { ScrollManager } from "@/app/scroll-manager";
import { Grain } from "@/components/Grain";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Intro } from "@/components/Intro";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { FootageCounter } from "@/components/FootageCounter";
import { ClapperTransition } from "@/components/ClapperTransition";
import { Toaster } from "@/components/ui/sonner";
import { JsonLd } from "@/components/JsonLd";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, TAGLINE } from "@/lib/site";

/* ---------------------------------------------------------------------------
   The document.

   This replaces public/index.html and src/index.js together. Everything that
   file declared by hand — the title, the description, the icons, the manifest,
   the fonts, the third-party scripts — is declared here instead, and Next
   writes it into the HTML of every route at build time.

   The one thing that is deliberately *not* carried over is the pre-boot screen.
   It existed because create-react-app shipped an empty `<div id="root">`, and a
   black box was the only way to avoid a white flash while the bundle arrived.
   There is no such gap now: every route is prerendered, so the page's own
   markup is in the response. An overlay painted over it would be covering real
   content rather than standing in for missing content. What the pre-boot screen
   was actually protecting — never flashing white — is held by the inline style
   below, which paints the document black before the stylesheet is even parsed.
   --------------------------------------------------------------------------- */

export const metadata = {
  /* Every relative URL in this file and in every route's metadata — canonical
     tags, og:image, og:url — is resolved against this. Without it Next emits
     relative Open Graph URLs, which most crawlers simply drop. */
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${TAGLINE}`,
    /* Route titles are their own subject, and the house name is appended.
       "Yaganti — Balcony Originals", not "Balcony Originals — Yaganti": search
       results truncate from the right, so the distinguishing half goes first. */
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "Balcony Originals",
    "Rayalaseema documentary",
    "Telugu documentary production house",
    "Andhra Pradesh film production",
    "Indian documentary films",
    "cultural documentaries India",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  /* No canonical here on purpose. Every route declares its own, and a default
     inherited from the layout would hand the 404 page a canonical pointing at
     the home page — telling a crawler that a mistyped URL *is* the home page. */
  manifest: "/manifest.json",
  /* The mark is white artwork on transparency, which would vanish against a
     light tab bar, so every icon here is the mark composited on the brand
     black — legible whichever theme the browser is in. The 16px cut drops the
     film reel's holes: at that size they collapse into grey mush, and the B
     alone reads. */
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: "/apple-touch-icon.png",
  },
  formatDetection: { telephone: false },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0C0B0A",
  colorScheme: "dark",
};

/* Painted before the stylesheet is parsed, so the first frame the browser shows
   is the page's own black rather than the default white. `color-scheme` is here
   for the same reason: it decides the colour of the scrollbars, the form
   controls and the canvas the browser paints behind the document, and declaring
   it this early is what stops those coming up light on the way to the CSS. */
const FIRST_PAINT = `html{background:#050505;color-scheme:dark}`;

/* Parsed synchronously, a third-party host blocks rendering entirely when it is
   slow or unreachable — in-app browsers, restrictive networks — leaving a blank
   page. `afterInteractive` is Next's equivalent of the `defer` this carried in
   the hand-written document. */
const EMERGENT_SCRIPT = "https://assets.emergent.sh/scripts/emergent-main.js";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: FIRST_PAINT }} />
        {/* The type is served from Google. A <link> here rather than the
            `@import` this used to sit behind in index.css: an @import inside a
            stylesheet cannot even be discovered until that stylesheet has been
            downloaded and parsed, which put the fonts a full round trip further
            back than they needed to be. Same families, same weights. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500&family=Marcellus&family=Noto+Serif+Telugu:wght@400;600;700&display=swap"
        />
      </head>
      <body>
        <noscript>
          {/* The page above this is fully rendered without JavaScript — only the
              motion, the reel and the forms need it. */}
          Enable JavaScript for the animated reel, the projection hero and the
          submission forms. The stories themselves are all here without it.
        </noscript>

        <Script id="bo-perf-servertiming" strategy="beforeInteractive">
          {`window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);`}
        </Script>

        <Providers>
          <div className="min-h-screen bg-ink text-bone">
            <Grain />
            <Intro />
            <Header />
            {/* Both of these read the query string, which a prerender has no
                access to — so each needs a boundary Next can render in its
                place. Neither draws anything until the reader navigates, so
                `null` is not a compromise here: it is what they render anyway. */}
            <Suspense fallback={null}>
              <ScrollManager />
            </Suspense>
            <main>
              <ErrorBoundary>{children}</ErrorBoundary>
            </main>
            <Footer />
            <FootageCounter />
            <Suspense fallback={null}>
              <ClapperTransition />
            </Suspense>
            <Toaster position="bottom-right" />
          </div>
        </Providers>

        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />

        <Script src={EMERGENT_SCRIPT} strategy="afterInteractive" />
        <Script id="bo-posthog" strategy="afterInteractive">
          {`!(function (t, e) {
    var o, n, p, r;
    e.__SV ||
        ((window.posthog = e),
        (e._i = []),
        (e.init = function (i, s, a) {
            function g(t, e) {
                var o = e.split(".");
                2 == o.length && ((t = t[o[0]]), (e = o[1])),
                    (t[e] = function () {
                        t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
                    });
            }
            ((p = t.createElement("script")).type = "text/javascript"),
                (p.crossOrigin = "anonymous"),
                (p.async = !0),
                (p.src = s.api_host.replace(".i.posthog.com", "-assets.i.posthog.com") + "/static/array.js"),
                (r = t.getElementsByTagName("script")[0]).parentNode.insertBefore(p, r);
            var u = e;
            for (
                void 0 !== a ? (u = e[a] = []) : (a = "posthog"),
                    u.people = u.people || [],
                    u.toString = function (t) {
                        var e = "posthog";
                        return "posthog" !== a && (e += "." + a), t || (e += " (stub)"), e;
                    },
                    u.people.toString = function () {
                        return u.toString(1) + ".people (stub)";
                    },
                    o = "init me ws ys ps bs capture je Di ks register register_once register_for_session unregister unregister_for_session Ps getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSurveysLoaded onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey canRenderSurveyAsync identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty Es $s createPersonProfile Is opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing Ss debug xs getPageViewId captureTraceFeedback captureTraceMetric".split(
                        " "
                    ),
                    n = 0;
                n < o.length;
                n++
            )
                g(u, o[n]);
            e._i.push([i, s, a]);
        }),
        (e.__SV = 1));
})(document, window.posthog || []);
posthog.init("phc_DbsPb39SRc8z3EiQ6Dhj6ikv4H4rTKcht9d4sZSesceP", {
    api_host: "https://ap.emergent.sh",
    person_profiles: "identified_only",
    session_recording: {
        recordCrossOriginIframes: true,
        capturePerformance: false,
    },
});`}
        </Script>
      </body>
    </html>
  );
}

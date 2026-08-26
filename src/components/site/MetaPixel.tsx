import { useRouterState } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

const META_PIXEL_IDS = ["947778844694322", "1053403490723972"];

function metaPixelInitScript(): string {
  const initCalls = META_PIXEL_IDS.map((id) => `fbq('init', '${id}');`).join("\n");
  return `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
${initCalls}
fbq('track', 'PageView');`;
}

function metaPixelNoscriptHtml(): string {
  return META_PIXEL_IDS.map(
    (id) =>
      `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1" alt="" />`
  ).join("");
}

export function MetaPixel() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: metaPixelInitScript() }} />
      <noscript dangerouslySetInnerHTML={{ __html: metaPixelNoscriptHtml() }} />
    </>
  );
}

// The base script above only fires one PageView on initial document load.
// Since this is a client-side-routed SPA, fire a PageView on every
// subsequent in-app navigation too so Meta sees all page views.
export function useMetaPixelPageViews() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
    fbq?.("track", "PageView");
  }, [pathname]);
}

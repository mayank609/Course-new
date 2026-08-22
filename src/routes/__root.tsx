import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";
import { AdviserModalProvider } from "@/components/site/AdviserModal";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Sarvpratham Analytics — Master MS Office & AI Skills" },
      {
        name: "description",
        content:
          "Expert-led MS Office (Excel, Word, PowerPoint) and AI (ChatGPT, Copilot) certification courses by Shubham Verma.",
      },
      { name: "author", content: "Sarvpratham Analytics" },
      { property: "og:title", content: "Sarvpratham Analytics — Learn Excel & AI from Experts" },
      {
        property: "og:description",
        content:
          "Global certifications, live expert-led training, and career coaching to future-proof your career.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@Lovable" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700;800;900&family=Inter:wght@400;500;600;700;800&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/sarvpratham-logo.png", type: "image/png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AdviserModalProvider>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
        <Toaster position="top-center" />
        
        {/* Floating WhatsApp Community badge */}
        <a
          href="https://chat.whatsapp.com/FvWRczrBEarKdAKFt1kvM3"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 bg-[#25d366] hover:bg-[#20ba5a] text-white p-3.5 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center gap-2 group"
          title="Join Our WhatsApp Community"
        >
          <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.725 1.45 5.489 0 9.952-4.437 9.954-9.899.001-2.647-1.02-5.133-2.877-6.99C16.59 1.856 14.105 1.833 11.455 1.833c-5.489 0-9.952 4.437-9.956 9.902-.001 1.636.467 3.23 1.354 4.615l-.997 3.637 3.737-.981zm12.387-5.467c-.29-.145-1.713-.847-1.978-.943-.264-.096-.457-.145-.65.145-.19.29-.74.943-.906 1.135-.167.19-.333.215-.623.07-2.904-1.45-3.807-1.88-5.322-4.507-.403-.699.403-.649 1.15-2.15.13-.26.065-.49-.032-.68-.097-.195-.783-1.885-1.072-2.583-.28-.68-.567-.587-.783-.598-.201-.01-.43-.01-.659-.01-.229 0-.601.086-.916.43-.315.345-1.203 1.177-1.203 2.87 0 1.693 1.232 3.328 1.404 3.559.172.23 2.424 3.7 5.871 5.19 2.502 1.08 3.35 1.055 4.545.926 1.2-.13 2.502-.823 2.853-1.62.35-.796.35-1.479.245-1.62-.105-.145-.395-.23-.685-.375z"/>
          </svg>
          <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold transition-all duration-300 group-hover:max-w-xs group-hover:ml-2">
            Join WhatsApp Community
          </span>
        </a>
      </AdviserModalProvider>
    </QueryClientProvider>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Play, BookOpen, Sparkles, Mail } from "lucide-react";
import { z } from "zod";
import { useEffect } from "react";
import { trackMetaEvent } from "@/components/site/MetaPixel";

const searchSchema = z.object({
  course: z.string().optional().catch(""),
  amount: z.number().optional().catch(undefined),
  currency: z.string().optional().catch("INR"),
  orderId: z.string().optional().catch(""),
  guest: z.string().optional().catch(""),
  loggedIn: z.string().optional().catch("1"),
});

export const Route = createFileRoute("/thank-you")({
  validateSearch: searchSchema,
  component: ThankYouPage,
});

function ThankYouPage() {
  const { course, amount, currency, orderId, guest, loggedIn } = Route.useSearch();
  const isGuest = guest === "1";
  // The purchase matched an existing, already-activated account by email or
  // phone — it's linked to that account, but this browser was never signed
  // into it (no password was checked), so it needs a real login.
  const needsLoginForExistingAccount = !isGuest && loggedIn === "0";

  useEffect(() => {
    // A Purchase without an order id cannot be deduplicated against the server
    // copy, and one without a real value makes ROAS uncomputable — Meta reports
    // those as "missing value" rather than counting the revenue. In both cases
    // the server-side Conversions API event from /api/payment/verify is the
    // authoritative record, so firing a degenerate browser event only adds noise.
    if (!orderId) return;
    if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) return;

    // Landing on /thank-you again (refresh, back button, re-opened link) must not
    // re-fire the conversion. Meta only deduplicates by event_id for 48 hours.
    const guardKey = `meta_purchase_sent_${orderId}`;
    try {
      if (localStorage.getItem(guardKey)) return;
      localStorage.setItem(guardKey, "1");
    } catch {
      // Private mode / storage disabled — fall through and rely on event_id dedup.
    }

    trackMetaEvent(
      "Purchase",
      {
        content_name: course || "Course Purchase",
        content_type: "product",
        value: amount,
        currency: currency || "INR",
        order_id: orderId,
      },
      // Same id the server sends from the payment-verify handler, so Meta pairs
      // the browser and server events instead of counting two purchases.
      orderId
    );
    trackMetaEvent("CompleteRegistration", {
      content_name: course || "Course Registration",
    });
  }, [course, amount, currency, orderId]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4 py-16 sm:py-24 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl -z-10" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-[color:var(--brand-gold)]/10 blur-3xl -z-10" />

        <div className="max-w-md w-full bg-card border border-border rounded-3xl p-8 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="h-10 w-10 animate-bounce" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1 bg-amber-500/10 text-[color:var(--brand-gold-foreground)] text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
              <Sparkles className="h-3 w-3" /> Registration Confirmed
            </div>
            <h1 className="font-serif text-3xl font-bold text-foreground">Thank You!</h1>
            <p className="text-muted-foreground text-sm">
              Your enrollment was successful. Welcome to the Sarvpratham student community!
            </p>
          </div>

          {course && (
            <div className="p-4 bg-muted/40 rounded-2xl border border-border/80 text-left space-y-1">
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Purchased Course</span>
              <h3 className="font-serif text-base font-bold text-foreground leading-snug">{course}</h3>
              <p className="text-xs text-muted-foreground">Access is permanently unlocked</p>
            </div>
          )}

          {isGuest && (
            <div className="flex items-start gap-3 p-4 bg-amber-500/10 text-left rounded-2xl border border-amber-500/20">
              <Mail className="h-4 w-4 text-[color:var(--brand-gold-foreground)] shrink-0 mt-0.5" />
              <p className="text-xs text-foreground/80">
                You're logged in for this session. We've also emailed and WhatsApp'd you an activation link — set a
                password there so you can log in again anytime.
              </p>
            </div>
          )}

          {needsLoginForExistingAccount && (
            <div className="flex items-start gap-3 p-4 bg-amber-500/10 text-left rounded-2xl border border-amber-500/20">
              <Mail className="h-4 w-4 text-[color:var(--brand-gold-foreground)] shrink-0 mt-0.5" />
              <p className="text-xs text-foreground/80">
                This purchase is linked to an existing account under this email/phone. Please log in with that
                account's password to access it.
              </p>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <Button asChild className="w-full rounded-full py-6 text-base font-semibold shadow-md">
              <Link to={needsLoginForExistingAccount ? "/login" : "/dashboard"} search={needsLoginForExistingAccount ? { redirect: "/dashboard" } : undefined}>
                <Play className="h-4 w-4 mr-2 fill-current" /> {needsLoginForExistingAccount ? "Log In to Access" : "Go to My Dashboard"}
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full rounded-full py-6 text-base font-semibold">
              <Link to="/courses">
                <BookOpen className="h-4 w-4 mr-2" /> Browse More Courses
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

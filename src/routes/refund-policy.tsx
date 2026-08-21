import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/refund-policy")({
  component: RefundPolicyPage,
});

const sections = [
  {
    h: "Eligibility window",
    p: "You may request a full refund within 7 days of enrolling in a self-paced course, provided you have not completed more than 20% of the course content or downloaded certificates or completion materials.",
  },
  {
    h: "Live & cohort-based programs",
    p: "For live, instructor-led programs, refund requests must be submitted before the second live session. After the second session, enrolments become non-refundable, though you may transfer your seat to a future cohort at no extra cost.",
  },
  {
    h: "Enterprise & corporate packages",
    p: "Refunds for enterprise training packages are governed by the terms agreed in your corporate services contract. Contact your account manager to discuss adjustments or credits.",
  },
  {
    h: "How to request a refund",
    p: "Email our support team from the address used to enrol, including your order details and reason for the request. Approved refunds are processed to the original payment method within 7–10 business days.",
  },
  {
    h: "Non-refundable items",
    p: "Certification exam fees paid directly to third-party accrediting bodies, and any coupon or discount value used at checkout, are non-refundable.",
  },
];

function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="text-[color:var(--brand-gold-foreground)] uppercase tracking-[0.2em] text-xs font-semibold">
            Legal
          </p>
          <h1 className="mt-3 font-serif text-3xl sm:text-4xl font-bold">Refund Policy</h1>
          <p className="mt-4 text-sm text-muted-foreground">Last updated: July 2026</p>
          <p className="mt-6 text-muted-foreground">
            We want you to feel confident investing in your career with Sarvpratham Analytics. Here's how
            refunds work across our course formats.
          </p>
          <div className="mt-10 space-y-8">
            {sections.map((s) => (
              <div key={s.h}>
                <h2 className="font-serif text-xl font-bold">{s.h}</h2>
                <p className="mt-2 text-muted-foreground leading-relaxed">{s.p}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 text-sm text-muted-foreground">
            Need help with a refund? Reach out via our{" "}
            <a href="/contact" className="text-primary underline">
              contact page
            </a>
            .
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

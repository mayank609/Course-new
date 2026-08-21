import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/Reveal";
import { submitLead } from "@/lib/api";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitLead({ email, source: "newsletter" });
      toast.success("You're subscribed! Watch your inbox for deals and updates.");
      setEmail("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="px-4 py-16">
      <Reveal className="mx-auto max-w-5xl relative rounded-3xl bg-[image:var(--gradient-primary)] text-white p-8 sm:p-12 text-center shadow-[var(--shadow-elegant)] ring-1 ring-[color:var(--brand-gold)]/25 overflow-hidden">
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-[color:var(--brand-gold)]/15 blur-3xl animate-float" />
        <h2 className="font-serif text-2xl sm:text-3xl font-bold">Subscribe to our newsletter</h2>
        <p className="mt-2 text-white/85">
          Get the latest deals and updates from Sarvpratham Analytics delivered to your inbox.
        </p>
        <form
          onSubmit={onSubmit}
          className="mt-6 flex flex-col sm:flex-row gap-3 max-w-lg mx-auto relative"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 rounded-full px-5 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-gold)]/60 transition-shadow"
          />
          <Button
            type="submit"
            size="lg"
            disabled={submitting}
            className="shine rounded-full bg-[image:var(--gradient-gold)] text-[color:var(--brand-gold-foreground)] hover:opacity-95 hover:-translate-y-0.5 transition-all font-semibold"
          >
            {submitting ? "Subscribing..." : "Subscribe"}
          </Button>
        </form>
      </Reveal>
    </section>
  );
}

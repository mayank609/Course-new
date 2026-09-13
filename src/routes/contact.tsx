import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, MapPin } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { LeadForm } from "@/components/site/LeadForm";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl grid lg:grid-cols-[1fr_1.3fr] gap-10">
          <div>
            <p className="text-[color:var(--brand-gold-foreground)] uppercase tracking-[0.2em] text-xs font-semibold">
              Get in Touch
            </p>
            <h1 className="mt-3 font-serif text-3xl sm:text-4xl font-bold">Contact Us</h1>
            <p className="mt-4 text-muted-foreground">
              Have a question about a course, a partnership, or anything else? Send us a message and
              we'll get back to you within one business day.
            </p>
            <div className="mt-8 space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <span className="h-10 w-10 rounded-full bg-primary/10 grid place-items-center text-primary">
                  <Mail className="h-4 w-4" />
                </span>
                <a
                  href="mailto:Info@sarvprathamanalytics.com"
                  className="hover:text-primary transition-colors font-medium"
                >
                  Info@sarvprathamanalytics.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-10 w-10 rounded-full bg-primary/10 grid place-items-center text-primary">
                  <Phone className="h-4 w-4" />
                </span>
                +91 8115 436 104
              </div>
              <div className="flex items-center gap-3">
                <span className="h-10 w-10 rounded-full bg-primary/10 grid place-items-center text-primary">
                  <MapPin className="h-4 w-4" />
                </span>
                37/5 Kanpur, Uttar Pradesh, India
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-card)]">
            <LeadForm source="contact" submitLabel="Send Message" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

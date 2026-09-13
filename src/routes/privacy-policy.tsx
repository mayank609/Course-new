import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/privacy-policy")({
  component: PrivacyPolicyPage,
});

const sections = [
  {
    h: "Information we collect",
    p: "When you create an account, enroll in a course, or fill out a contact or callback form, we collect the details you provide — such as your name, email address, phone number, and company. We also automatically collect basic usage data (pages viewed, device type, and approximate location) to help us improve the platform.",
  },
  {
    h: "How we use your information",
    p: "We use your information to deliver the courses and services you sign up for, respond to enquiries, send you relevant updates and offers you can opt out of at any time, and to keep our platform secure and reliable.",
  },
  {
    h: "Sharing your information",
    p: "We do not sell your personal data. We may share limited information with trusted service providers (such as payment processors or email delivery partners) solely to operate the platform, and only under confidentiality obligations.",
  },
  {
    h: "Cookies",
    p: "We use cookies and similar technologies to keep you signed in, remember your preferences, and understand how the site is used so we can improve it over time. You can control cookies through your browser settings.",
  },
  {
    h: "Data retention & security",
    p: "We retain your data for as long as your account is active or as needed to provide our services, and use industry-standard safeguards to protect it against unauthorized access.",
  },
  {
    h: "Your rights",
    p: "You may request access to, correction of, or deletion of your personal data at any time by contacting us. We will respond to verified requests within a reasonable timeframe.",
  },
];

function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="text-[color:var(--brand-gold-foreground)] uppercase tracking-[0.2em] text-xs font-semibold">
            Legal
          </p>
          <h1 className="mt-3 font-serif text-3xl sm:text-4xl font-bold">Privacy Policy</h1>
          <p className="mt-4 text-sm text-muted-foreground">Last updated: July 2026</p>
          <p className="mt-6 text-muted-foreground">
            This Privacy Policy explains how Sarvpratham Analytics collects, uses, and protects your
            information when you use our website and services.
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
            Questions about this policy? Reach out via our{" "}
            <a href="/contact" className="text-primary underline">
              contact page
            </a>{" "}
            or email us at{" "}
            <a href="mailto:Info@sarvprathamanalytics.com" className="text-primary underline">
              Info@sarvprathamanalytics.com
            </a>
            .
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

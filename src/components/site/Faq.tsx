import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Reveal } from "@/components/site/Reveal";

const faqs = [
  {
    q: "Who is this course for?",
    a: "This course is designed for anyone who wants to learn Excel from beginner to advanced—students, working professionals, job-seekers, freelancers, and business owners. If you want to understand, manage, or analyze data, this course is perfect for you.",
  },
  {
    q: "Do I need to know coding for this course?",
    a: "No. You need zero coding knowledge. Everything is explained step-by-step, making it easy even for complete beginners.",
  },
  {
    q: "Will I get a certificate after completion?",
    a: "Yes! You will receive a verifiable course completion certificate that you can add to your resume, LinkedIn, or job applications.",
  },
  {
    q: "What kind of projects will I work on?",
    a: "You will work on real-world projects, including: a business sales dashboard, an automated attendance & payroll sheet, a data cleaning & analysis project, an expense tracker, and interactive reports with formulas and charts. These projects help you build job-ready, practical skills.",
  },
  {
    q: "Will I get help if I'm stuck during the course?",
    a: "Absolutely. You'll get dedicated support, where you can ask questions anytime and receive step-by-step guidance from our trainers.",
  },
];

export function Faq() {
  return (
    <section className="px-4 py-16 sm:py-20 bg-[oklch(0.975_0.008_90)]">
      <div className="mx-auto max-w-3xl">
        <Reveal className="text-center mb-10">
          <p className="text-[color:var(--brand-gold-foreground)] font-semibold uppercase tracking-[0.2em] text-xs">
            Got Questions?
          </p>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-muted-foreground">
            Still have questions? Reach out to us anytime at{" "}
            <a
              href="mailto:Info@sarvprathamanalytics.com"
              className="font-semibold text-primary hover:underline"
            >
              Info@sarvprathamanalytics.com
            </a>.
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-[var(--shadow-card)]">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`} className="border-b border-border last:border-b-0 py-2">
                  <AccordionTrigger className="font-serif text-base font-bold text-foreground hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm leading-relaxed mt-1">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

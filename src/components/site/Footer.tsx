import { Link } from "@tanstack/react-router";
import { Linkedin, Facebook, Instagram, Youtube } from "lucide-react";

const LINK_MAP: Record<string, string> = {
  "About Us": "/about",
  "Contact Us": "/contact",
  "Privacy Policy": "/privacy-policy",
  "Terms & Conditions": "/terms",
  "Refund Policy": "/refund-policy",
  "MS Excel Essentials": "/courses/excel-essentials",
  "Advanced Excel Mastery": "/courses/excel-mastery",
  "Word & PPT Essentials": "/courses/word-ppt-essentials",
  "Advanced Word & PPT Mastery": "/courses/word-ppt-mastery",
  Home: "/",
  "All Courses": "/courses",
  "Student Login": "/login",
  Register: "/register",
};

const CATEGORY_SEARCH: Record<string, string> = {};

function ThreadsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1.66 12.87c-.822.486-1.895.394-2.585-.246-.689-.64-.816-1.688-.316-2.484.5-.795 1.547-1.127 2.457-.783.91.344 1.397 1.3 1.144 2.228-.253.928-.962 1.343-1.677 1.343-.45 0-.825-.162-.977-.457-.152-.295-.125-.668.077-.962.202-.294.577-.487.97-.487.393 0 .762.193.964.487.202.294.23.667.078.962-.152.295-.527.457-.977.457-.715 0-1.424-.415-1.677-1.343-.253-.928.234-1.884 1.144-2.228.91-.344 1.957-.012 2.457.783.5.796.373 1.844-.316 2.484-.69.64-1.763.732-2.585.246" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="bg-[color:var(--brand-dark)] text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Brand & Socials Column */}
        <div>
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <div className="bg-white p-2 rounded-xl inline-block transition-transform duration-300 group-hover:scale-105">
              <img
                src="/sarvpratham-logo.png"
                alt="Sarvpratham Analytics"
                className="h-10 w-auto object-contain"
              />
            </div>
          </Link>
          
          <p className="mt-4 text-sm text-white/70 leading-relaxed">
            A complete learning ecosystem — Excel Basic to Advanced, Word, PowerPoint, AI with ChatGPT & Copilot, and Career Skills. Built for freshers, job seekers, and working professionals.
          </p>
          
          {/* Social Icons row */}
          <div className="mt-5 flex flex-wrap gap-2.5">
            <a
              href="https://www.facebook.com/sarvpratham.analytics"
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 w-9 grid place-items-center rounded-full bg-white/10 transition-all duration-300 hover:bg-primary/20 hover:text-primary hover:-translate-y-1"
              title="Facebook"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href="https://www.instagram.com/sarvpratham.analytics/"
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 w-9 grid place-items-center rounded-full bg-white/10 transition-all duration-300 hover:bg-primary/20 hover:text-primary hover:-translate-y-1"
              title="Instagram"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="https://www.threads.net/@sarvpratham.analytics"
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 w-9 grid place-items-center rounded-full bg-white/10 transition-all duration-300 hover:bg-primary/20 hover:text-primary hover:-translate-y-1"
              title="Threads"
            >
              <ThreadsIcon className="h-4.5 w-4.5" />
            </a>
            <a
              href="https://www.youtube.com/@SarvprathamAnalytics"
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 w-9 grid place-items-center rounded-full bg-white/10 transition-all duration-300 hover:bg-primary/20 hover:text-primary hover:-translate-y-1"
              title="YouTube"
            >
              <Youtube className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="h-9 w-9 grid place-items-center rounded-full bg-white/10 transition-all duration-300 hover:bg-primary/20 hover:text-primary hover:-translate-y-1"
              title="LinkedIn"
            >
              <Linkedin className="h-4 w-4" />
            </a>
          </div>

          {/* Dedicated WhatsApp Option */}
          <div className="mt-6 p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/25 flex items-center gap-3">
            <svg className="h-6 w-6 text-emerald-500 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.725 1.45 5.489 0 9.952-4.437 9.954-9.899.001-2.647-1.02-5.133-2.877-6.99C16.59 1.856 14.105 1.833 11.455 1.833c-5.489 0-9.952 4.437-9.956 9.902-.001 1.636.467 3.23 1.354 4.615l-.997 3.637 3.737-.981zm12.387-5.467c-.29-.145-1.713-.847-1.978-.943-.264-.096-.457-.145-.65.145-.19.29-.74.943-.906 1.135-.167.19-.333.215-.623.07-2.904-1.45-3.807-1.88-5.322-4.507-.403-.699.403-.649 1.15-2.15.13-.26.065-.49-.032-.68-.097-.195-.783-1.885-1.072-2.583-.28-.68-.567-.587-.783-.598-.201-.01-.43-.01-.659-.01-.229 0-.601.086-.916.43-.315.345-1.203 1.177-1.203 2.87 0 1.693 1.232 3.328 1.404 3.559.172.23 2.424 3.7 5.871 5.19 2.502 1.08 3.35 1.055 4.545.926 1.2-.13 2.502-.823 2.853-1.62.35-.796.35-1.479.245-1.62-.105-.145-.395-.23-.685-.375z"/>
            </svg>
            <div>
              <p className="text-xs font-semibold text-white">Discussion Forum</p>
              <a 
                href="https://chat.whatsapp.com/FvWRczrBEarKdAKFt1kvM3" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline mt-0.5 inline-block"
              >
                Join WhatsApp Group →
              </a>
            </div>
          </div>
        </div>

        {/* Dynamic column mappings */}
        {[
          {
            h: "Quick Links",
            l: ["About Us", "Contact Us", "Privacy Policy", "Terms & Conditions", "Refund Policy"],
          },
          {
            h: "Featured Courses",
            l: [
              "MS Excel Essentials",
              "Advanced Excel Mastery",
              "Word & PPT Essentials",
              "Advanced Word & PPT Mastery",
            ],
          },
          { h: "Student Portal", l: ["Home", "All Courses", "Student Login", "Register"] },
        ].map((c) => (
          <div key={c.h}>
            <div className="font-semibold uppercase tracking-[0.2em] text-xs text-[color:var(--brand-gold)]/80">
              {c.h}
            </div>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              {c.l.map((x) =>
                LINK_MAP[x] ? (
                  <li key={x}>
                    <Link
                      to={LINK_MAP[x]}
                      className="relative transition-colors hover:text-white after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-0 after:bg-[color:var(--brand-gold)] after:transition-all after:duration-300 hover:after:w-full"
                    >
                      {x}
                    </Link>
                  </li>
                ) : (
                  <li key={x}>
                    <a
                      href="#"
                      className="relative transition-colors hover:text-white after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-0 after:bg-[color:var(--brand-gold)] after:transition-all after:duration-300 hover:after:w-full"
                    >
                      {x}
                    </a>
                  </li>
                ),
              )}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-[color:var(--brand-gold)]/10 py-5 text-center text-xs text-white/60">
        © {new Date().getFullYear()} Sarvpratham Analytics. All rights reserved.
      </div>
    </footer>
  );
}

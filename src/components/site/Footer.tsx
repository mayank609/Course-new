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
                src="/sarvpratham-logo-full.jpg"
                alt="Sarvpratham Analytics"
                className="h-12 w-auto object-contain rounded"
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
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.298-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .102 5.36.099 11.943c0 2.105.549 4.161 1.595 5.976L0 24l6.235-1.634a11.94 11.94 0 0 0 5.706 1.454h.006c6.585 0 11.946-5.36 11.949-11.944a11.89 11.89 0 0 0-3.376-8.427"/>
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

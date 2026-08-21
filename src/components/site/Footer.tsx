import { Link } from "@tanstack/react-router";
import { Linkedin } from "lucide-react";

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

export function Footer() {
  return (
    <footer className="bg-[color:var(--brand-dark)] text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
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
          <p className="mt-4 text-sm text-white/70">
            A complete learning ecosystem — Excel Basic to Advanced, Word, PowerPoint, AI with ChatGPT & Copilot, and Career Skills. Built for freshers, job seekers, and working professionals.
          </p>
          <div className="mt-5 flex gap-3">
            <a
              href="#"
              className="h-9 w-9 grid place-items-center rounded-full bg-white/10 transition-all duration-300 hover:bg-[color:var(--brand-gold)]/20 hover:text-[color:var(--brand-gold)] hover:-translate-y-1"
            >
              <Linkedin className="h-4 w-4" />
            </a>
          </div>
        </div>
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
                      search={CATEGORY_SEARCH[x] ? { category: CATEGORY_SEARCH[x] } : undefined}
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

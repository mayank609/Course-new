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
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.007c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.781 3.63 2.695 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.792-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.334-.744-1.766-.514-.601-1.307-.911-2.358-.918h-.028c-.85 0-1.995.234-2.729 1.34l-1.734-1.191c.985-1.474 2.542-2.284 4.463-2.284h.038c3.19.02 5.09 1.96 5.283 5.36.11.045.219.092.325.14 1.487.674 2.577 1.696 3.156 2.951.806 1.743.88 4.588-1.436 6.888-1.874 1.86-4.145 2.702-7.363 2.727Zm1.156-11.802c-.284 0-.573.006-.868.02-1.771.098-2.836.928-2.774 2.062.06 1.088 1.253 1.612 2.517 1.542 1.502-.084 2.518-.925 2.518-3.15v-.371a10.365 10.365 0 0 0-1.393-.103Z" />
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

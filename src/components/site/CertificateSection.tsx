import { ShieldCheck, Award, CheckCircle } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";

export function CertificateSection() {
  return (
    <section className="px-4 py-16 sm:py-24 bg-gradient-to-b from-card to-background border-t border-border overflow-hidden">
      <div className="mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 sm:gap-16 items-center">
          
          {/* Left Column - Content */}
          <Reveal className="space-y-6 lg:space-y-8">
            <div>
              <p className="text-[color:var(--brand-gold-foreground)] font-semibold uppercase tracking-[0.2em] text-xs">
                Credentials & Value
              </p>
              <h2 className="mt-2 font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
                Get Recognized with Our Prestigious Certificate!
              </h2>
            </div>
            
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
              Upon successful completion of this program, you'll earn a professional certificate. Boost your resume, showcase your new AI + Excel skills, and unlock top job opportunities!
            </p>

            {/* Sub Stats Grid */}
            <div className="grid sm:grid-cols-3 gap-6 pt-4">
              <div className="space-y-2 p-4 bg-white/50 backdrop-blur rounded-2xl border border-border shadow-sm">
                <Award className="h-6 w-6 text-[color:var(--brand-gold-foreground)]" />
                <div className="text-3xl font-bold font-serif text-foreground">4,781+</div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Certificates Issued</div>
              </div>
              
              <div className="space-y-2 p-4 bg-white/50 backdrop-blur rounded-2xl border border-border shadow-sm">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div className="text-3xl font-bold font-serif text-foreground">97%</div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Student Satisfied</div>
              </div>
              
              <div className="space-y-2 p-4 bg-white/50 backdrop-blur rounded-2xl border border-border shadow-sm">
                <ShieldCheck className="h-6 w-6 text-blue-600" />
                <div className="text-3xl font-bold font-serif text-foreground">100%</div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Genuine & Verified</div>
              </div>
            </div>
          </Reveal>

          {/* Right Column - Premium Mockup */}
          <Reveal delay={100} className="relative flex justify-center">
            {/* Glowing gradient background ornament */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[color:var(--brand-gold)]/10 to-primary/5 rounded-3xl filter blur-3xl -z-10 transform scale-95" />
            
            <div className="relative group max-w-lg w-full rounded-2xl overflow-hidden shadow-2xl border border-border/80 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(232,196,119,0.15)] bg-white p-2">
              <img
                src="/certificate-sample.png"
                alt="Sarvpratham Analytics Certificate of Completion"
                className="w-full h-auto object-contain rounded-lg transition-transform duration-500 group-hover:scale-[1.01]"
              />
              {/* Premium overlay border reflection */}
              <div className="absolute inset-0 border border-white/20 rounded-2xl pointer-events-none" />
            </div>
          </Reveal>

        </div>
      </div>
    </section>
  );
}

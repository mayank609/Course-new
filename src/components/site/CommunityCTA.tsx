import { Reveal } from "@/components/site/Reveal";

const WHATSAPP_COMMUNITY_URL = "https://chat.whatsapp.com/FvWRczrBEarKdAKFt1kvM3";

function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.298-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .102 5.36.099 11.943c0 2.105.549 4.161 1.595 5.976L0 24l6.235-1.634a11.94 11.94 0 0 0 5.706 1.454h.006c6.585 0 11.946-5.36 11.949-11.944a11.89 11.89 0 0 0-3.376-8.427" />
    </svg>
  );
}

export function CommunityCTA() {
  return (
    <section className="px-4 py-16">
      <Reveal className="mx-auto max-w-5xl relative rounded-3xl bg-[image:var(--gradient-primary)] text-white p-8 sm:p-12 text-center shadow-[var(--shadow-elegant)] ring-1 ring-[color:var(--brand-gold)]/25 overflow-hidden">
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-[color:var(--brand-gold)]/15 blur-3xl animate-float" />
        <div className="relative">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#25d366] shadow-lg">
            <WhatsAppIcon className="h-7 w-7 text-white" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold">Need Career Guidance? Join Our Community</h2>
          <p className="mt-2 text-white/85 max-w-xl mx-auto">
            Join our official WhatsApp group to connect with mentors, get personalized career guidance, syllabus queries, and upskilling support.
          </p>
          <div className="mt-6">
            <a
              href={WHATSAPP_COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#25d366] hover:bg-[#20ba5a] text-white px-8 py-3 font-semibold shadow-xl transition-all hover:-translate-y-0.5"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Join WhatsApp Community
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

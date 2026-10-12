"use client";
import Reveal from "@/components/Reveal";
import { useView } from "@/components/ViewProvider";
import { copy } from "@/data/views";
import { site } from "@/data/site";

const links = [
  { label: "GitHub", href: site.github },
  { label: "LinkedIn", href: site.linkedin },
  { label: "Resume", href: site.resume },
];

export default function Contact() {
  const { view } = useView();
  return (
    <footer id="contact" className="tone-invert bg-ink text-bg">
      <div className="mx-auto max-w-[1400px] px-5 pb-10 pt-24 md:px-10 md:pt-36">
        <Reveal>
          <p className="label">{copy[view].contactLine}</p>
          <a
            href={`mailto:${site.email}`}
            className="group mt-8 inline-flex flex-wrap items-baseline gap-x-5 font-display text-[clamp(2rem,8.2vw,8.5rem)] font-semibold leading-[1] tracking-[-0.05em] [overflow-wrap:anywhere]"
          >
            <span className="link-u">{site.email}</span>
            <span aria-hidden className="text-inv-accent transition-transform duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2 group-hover:-translate-y-2">
              ↗
            </span>
          </a>
        </Reveal>

        <div className="mt-24 flex flex-col gap-6 border-t border-bg/20 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <ul className="flex gap-8">
            {links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="label link-u !text-bg/80 transition-colors hover:!text-bg"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="label">&copy; 2026 Prasanth Kasa</p>
        </div>
      </div>
    </footer>
  );
}

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

export function PageHero({ title, description, action, className }: PageHeroProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#b80f2f] via-[#d21639] to-[#b80f2f] px-8 py-7 text-white shadow-[0_20px_50px_rgba(184,15,47,0.24)]",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.15),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_28%)]" />
      <div className="absolute -left-10 top-[-32px] h-40 w-40 rounded-full border border-white/10" />
      <div className="absolute right-[-54px] top-[-68px] h-56 w-56 rounded-full border border-white/10" />
      <div className="absolute inset-y-0 left-1/3 w-px bg-white/8" />
      <div className="absolute inset-y-0 right-1/4 w-px bg-white/8" />
      <div className="absolute inset-x-0 top-1/2 h-px bg-white/8" />

      <div className="relative flex items-start justify-between gap-6">
        <div className="min-w-0">
          <h1 className="text-[30px] font-bold tracking-[0.02em]">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/85">{description}</p>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </section>
  );
}

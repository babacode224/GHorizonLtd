import { Menu, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { cn } from "@/lib/utils";

const links = [
  ["Properties", "/properties"],
  ["About", "/about"],
  ["Services", "/services"],
  ["Consulting", "/contact"],
  ["FAQ", "/faq"],
  ["Car Sales", "/cars"],
] as const;

export function SiteHeader({ overHero = false }: { overHero?: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
  const isCurrent = (href: string) => href === location || (href !== "/" && location.startsWith(`${href}/`));

  return (
    <header className={cn("z-40 w-full", overHero ? "absolute inset-x-0 top-0" : "sticky top-0 bg-white/95 shadow-sm backdrop-blur")}> 
      <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/" className={cn("group flex items-center gap-2", overHero ? "text-white" : "text-[#0c1f52]")}> 
          <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#1e3a8a] font-display text-xl text-white">G</span>
          <span className="leading-none"><strong className="block font-display text-xl font-semibold">G Horizon</strong><small className="mt-0.5 block text-[8px] font-bold tracking-[0.2em] opacity-75">ENTERPRISE LTD</small></span>
        </Link>
        <nav className="hidden items-center gap-6 lg:flex">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className={cn("text-sm font-medium transition-colors", overHero ? "text-white/85 hover:text-white" : "text-slate-700 hover:text-[#1e3a8a]", isCurrent(href) && "border-b-2 border-[#3b82f6] pb-1")}>{label}{label === "Car Sales" && <span className="ml-1.5 rounded-full bg-[#e7d6ac] px-1.5 py-0.5 text-[8px] font-bold tracking-wider text-[#7a5f1e]">NEW</span>}</Link>
          ))}
        </nav>
        <div className="hidden lg:block"><Link href="/contact" className="inline-flex items-center bg-white px-5 py-3 text-sm font-semibold text-[#1e3a8a] shadow-sm transition hover:bg-slate-100">Book a Consultation</Link></div>
        <button onClick={() => setMobileOpen((value) => !value)} aria-label="Toggle navigation" aria-expanded={mobileOpen} className={cn("p-2 lg:hidden", overHero ? "text-white" : "text-[#1e3a8a]")}>{mobileOpen ? <X /> : <Menu />}</button>
      </div>
      {mobileOpen && <nav className="border-t border-slate-200 bg-white px-5 py-5 shadow-xl lg:hidden"><div className="mx-auto grid max-w-7xl gap-1">{links.map(([label, href]) => <Link key={href} href={href} onClick={() => setMobileOpen(false)} className="rounded px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">{label}</Link>)}<Link href="/contact" onClick={() => setMobileOpen(false)} className="mt-2 bg-[#1e3a8a] px-4 py-3 text-center text-sm font-semibold text-white">Book a Consultation</Link></div></nav>}
    </header>
  );
}

export function SiteFooter() {
  return <footer className="bg-[#f3f4f6] px-5 pb-10 pt-16 lg:px-8"><div className="mx-auto max-w-7xl rounded-[2rem] bg-white px-7 pb-10 pt-12 shadow-sm ring-1 ring-slate-200 sm:px-10"><div className="grid gap-10 lg:grid-cols-[2fr_1fr_1fr_1fr]"><div><div className="flex items-center gap-2 text-[#0c1f52]"><span className="flex h-7 w-7 items-center justify-center rounded-sm bg-[#1e3a8a] font-display text-lg text-white">G</span><strong className="font-display text-2xl">G Horizon</strong></div><p className="mt-5 max-w-xs text-sm leading-7 text-slate-500">Premium real estate sourcing, sales and bespoke consultancy designed to elevate where you live, work and invest.</p><div className="mt-6 flex gap-3"><a href="#" aria-label="LinkedIn" className="footer-social">in</a><a href="#" aria-label="Twitter" className="footer-social">𝕏</a><a href="#" aria-label="Instagram" className="footer-social">◎</a></div></div><FooterGroup title="Explore" links={[["Properties", "/properties"], ["Services", "/services"], ["Car Sales", "/cars"], ["FAQ", "/faq"]]} /><FooterGroup title="Company" links={[["About Us", "/about"], ["Careers", "#"], ["Partners", "#"]]} /><FooterGroup title="Connect" links={[["Contact Us", "/contact"], ["Book a Visit", "/contact"], ["hello@ghorizon.com", "mailto:hello@ghorizon.com"]]} /></div><div className="mt-12 flex flex-col gap-3 border-t border-slate-100 pt-6 text-xs text-slate-400 sm:flex-row sm:justify-between"><span>© {new Date().getFullYear()} G Horizon Enterprise Limited. All rights reserved.</span><span className="flex gap-5"><a href="#">Legal Center</a><a href="#">User Agreement</a></span></div><p className="mt-8 overflow-hidden whitespace-nowrap text-center font-display text-[clamp(3.5rem,14vw,10rem)] leading-none tracking-tight text-slate-100">G Horizon</p></div></footer>;
}

function FooterGroup({ title, links }: { title: string; links: [string, string][] }) {
  return <div><h2 className="text-xs font-bold uppercase tracking-[0.16em] text-slate-800">{title}</h2><div className="mt-5 grid gap-3">{links.map(([label, href]) => href.startsWith("/") ? <Link href={href} key={label} className="text-sm text-slate-500 hover:text-[#1e3a8a]">{label}</Link> : <a href={href} key={label} className="text-sm text-slate-500 hover:text-[#1e3a8a]">{label}</a>)}</div></div>;
}

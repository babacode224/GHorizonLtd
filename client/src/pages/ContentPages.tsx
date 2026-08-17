import { ArrowRight, ChevronDown, Clock3, Mail, MapPin, Phone, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { SiteFooter, SiteHeader } from "@/components/ghorizon/SiteChrome";

const serviceItems = [
  ["Property Sourcing", "We match your brief to vetted on- and off-market opportunities across residential, land and commercial sectors."],
  ["Sales & Marketing", "Professional photography, listing exposure and qualified buyer matching to sell your property at its true value."],
  ["Title Verification", "Independent legal checks on C-of-O, deeds and governor’s consent so you buy with absolute certainty."],
  ["Valuation & Investment", "Data-driven valuations and ROI strategy to help you build a resilient, appreciating property portfolio."],
  ["Inspections & Virtual Tours", "Physical or 360° virtual viewings — inspect any property in detail, wherever you are in the world."],
  ["Bespoke Consultancy", "Dedicated advisors for high-net-worth clients, family offices and corporates seeking a managed approach."],
] as const;

type FAQSection = [string, [string, string][]];
const faqSections: FAQSection[] = [
  ["Buying & Investment", [
    ["How do I start the buying process?", "Begin with a complimentary consultation. We discuss your goals, budget and timing, then prepare a precise shortlist."],
    ["Are listings verified?", "Every public listing is reviewed before publication. Our process includes title, ownership and documentation checks appropriate to the listing type."],
    ["Can I buy from abroad?", "Yes. We support remote advisory, virtual viewings, secure document exchange and transaction coordination for diaspora clients."],
  ]],
  ["Payment & Legal", [
    ["What payment options are available?", "Our advisors explain the documented payment terms for each approved property or vehicle and guide you through the relevant process."],
    ["Do you handle legal documentation?", "Our team coordinates due diligence and can support the handling of deeds, title transfers and registrations through the appropriate professionals."],
    ["Are there hidden fees?", "We explain applicable agency, legal and registration costs before you proceed with a transaction."],
  ]],
  ["Inspections & Selling", [
    ["How do I schedule an inspection?", "Use the consultation page to request an in-person or virtual viewing with a preferred date and time."],
    ["Can G Horizon help sell my property?", "Yes. Select Sell on the contact form and tell us about your asset. We can discuss valuation, photography and qualified buyer matching."],
    ["Can I submit a car or property directly?", "Yes. Use the secure listing submission flow. All public submissions begin in Pending Review and remain private until approved."],
  ]],
];

function PageHero({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return <section className="bg-[#0c1f52] px-5 pb-16 pt-20 text-white lg:px-8"><div className="mx-auto max-w-7xl"><p className="eyebrow !text-[#e7d6ac] before:!bg-[#e7d6ac]">{eyebrow}</p><h1 className="mt-5 max-w-3xl font-display text-5xl leading-tight sm:text-6xl">{title}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-white/75">{text}</p></div></section>;
}

export function AboutPage() {
  const stats = [["11", "Years in Business"], ["480+", "Properties Sold"], ["98%", "Client Satisfaction"], ["35+", "Specialists on Staff"]];
  return <div><SiteHeader /><PageHero eyebrow="About G Horizon" title="Built on trust. Defined by detail." text="Since 2014, G Horizon has helped individuals, families and corporations acquire and dispose of premium real estate through market intelligence and personal service." /><main><section className="px-5 py-20 lg:px-8"><div className="mx-auto max-w-7xl"><div className="grid grid-cols-2 gap-8 border-y border-slate-200 py-10 md:grid-cols-4">{stats.map(([value, label]) => <div key={label} className="text-center"><p className="font-display text-5xl text-[#1e3a8a]">{value}</p><p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p></div>)}</div><div className="mt-20 grid gap-8 md:grid-cols-2"><article className="border border-slate-200 p-8"><p className="eyebrow">Our Mission</p><h2 className="mt-4 font-display text-4xl text-[#0c1f52]">Premium real estate, made accessible, transparent and secure.</h2><p className="mt-5 leading-8 text-slate-500">We pair rigorous verification with personal advisory so important property decisions can be made with confidence.</p></article><article className="bg-[#0c1f52] p-8 text-white"><p className="eyebrow !text-[#e7d6ac] before:!bg-[#e7d6ac]">Our Vision</p><h2 className="mt-4 font-display text-4xl">West Africa&apos;s trusted luxury property and lifestyle-assets name.</h2><p className="mt-5 leading-8 text-white/70">Our platform is built to extend our detail-led service into thoughtfully curated automobile sales.</p></article></div></div></section><Values /><Leadership /><CTA /></main><SiteFooter /></div>;
}

function Values() {
  const values = [["Transparency", "Clear information, careful verification and direct advice at every stage."], ["Discretion", "A considered, private approach for clients making important decisions."], ["Excellence", "Thoughtful service and meticulous attention to the details that matter."]];
  return <section className="bg-[#f3f4f6] px-5 py-20 lg:px-8"><div className="mx-auto max-w-7xl"><p className="eyebrow">What we stand for</p><h2 className="mt-4 font-display text-5xl text-[#0c1f52]">Principles behind every transaction.</h2><div className="mt-10 grid gap-5 md:grid-cols-3">{values.map(([title, text]) => <article key={title} className="bg-white p-7"><ShieldCheck className="h-7 w-7 text-[#c9a24b]" /><h3 className="mt-5 font-display text-3xl text-[#0c1f52]">{title}</h3><p className="mt-3 leading-7 text-slate-500">{text}</p></article>)}</div></div></section>;
}

function Leadership() {
  const people = [
    ["Gabriel H.", "Founder & CEO", "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80"],
    ["Halima A.", "Head of Sales", "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80"],
    ["Daniel O.", "Lead Consultant", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80"],
    ["Funmi B.", "Legal & Titles", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"],
  ];
  return <section className="px-5 py-20 lg:px-8"><div className="mx-auto max-w-7xl"><p className="eyebrow">Leadership</p><h2 className="mt-4 font-display text-5xl text-[#0c1f52]">The people behind G Horizon</h2><div className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">{people.map(([name, role, image]) => <article key={name}><img src={image} alt={name} className="aspect-square w-full object-cover" /><h3 className="mt-4 font-display text-2xl text-[#0c1f52]">{name}</h3><p className="mt-1 text-sm text-slate-500">{role}</p></article>)}</div></div></section>;
}

export function ServicesPage() {
  const steps = [["01", "Consultation", "Define goals, budget and timing."], ["02", "Shortlist", "Receive curated selections with due diligence."], ["03", "Inspect", "Tour physically or virtually with an advisor."], ["04", "Close", "Manage negotiation, paperwork and handover."]];
  return <div><SiteHeader /><PageHero eyebrow="What We Do" title="Real estate services, end to end." text="Whether you’re buying, selling or building a portfolio, our specialists manage every stage with rigour and discretion." /><main><section className="px-5 py-20 lg:px-8"><div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2 lg:grid-cols-3">{serviceItems.map(([title, text]) => <article key={title} className="border border-slate-200 p-7 transition hover:-translate-y-1 hover:shadow-xl"><Sparkles className="h-6 w-6 text-[#c9a24b]" /><h2 className="mt-5 font-display text-3xl text-[#0c1f52]">{title}</h2><p className="mt-4 leading-7 text-slate-500">{text}</p></article>)}</div></section><section className="bg-[#f3f4f6] px-5 py-20 lg:px-8"><div className="mx-auto max-w-7xl"><p className="eyebrow">Our Process</p><h2 className="mt-4 font-display text-5xl text-[#0c1f52]">A clear path from enquiry to ownership.</h2><div className="mt-10 grid gap-4 md:grid-cols-4">{steps.map(([number, title, text]) => <article key={number} className="bg-white p-6"><span className="text-xs font-bold tracking-[0.2em] text-[#c9a24b]">{number}</span><h3 className="mt-4 font-display text-2xl text-[#0c1f52]">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-500">{text}</p></article>)}</div></div></section><CTA /></main><SiteFooter /></div>;
}

export function FAQPage() {
  return <div><SiteHeader /><PageHero eyebrow="Help Centre" title="Frequently asked questions" text="Everything you need to know about buying, selling and working with G Horizon." /><main className="px-5 py-20 lg:px-8"><div className="mx-auto max-w-3xl">{faqSections.map(([section, items]) => <div key={section} className="mb-12"><h2 className="font-display text-3xl text-[#0c1f52]">{section}</h2><div className="mt-4 border-t border-slate-200">{items.map(([question, answer]) => <FAQItem key={question} question={question} answer={answer} />)}</div></div>)}<div className="bg-[#f3f4f6] p-8 text-center"><p className="font-display text-3xl text-[#0c1f52]">Still have a question?</p><p className="mt-3 text-slate-500">Our advisors are happy to help with anything not covered here.</p><Link href="/contact" className="mt-6 inline-block bg-[#1e3a8a] px-5 py-3 text-sm font-bold text-white">Contact Us</Link></div></div></main><SiteFooter /></div>;
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return <article className="border-b border-slate-200"><button onClick={() => setOpen((value) => !value)} aria-expanded={open} className="flex w-full items-center justify-between gap-4 py-5 text-left text-base font-semibold text-slate-800"><span>{question}</span><ChevronDown className={open ? "h-5 w-5 shrink-0 rotate-180 text-[#3b82f6] transition" : "h-5 w-5 shrink-0 text-[#3b82f6] transition"} /></button>{open && <p className="max-w-2xl pb-5 leading-7 text-slate-500">{answer}</p>}</article>;
}

export function ContactPage() {
  const [slot, setSlot] = useState("");
  return <div><SiteHeader /><PageHero eyebrow="Let’s Talk" title="Consulting & Contact" text="Buying, selling or simply exploring? Tell us what you need and request an inspection — physical or virtual." /><main><section className="border-b border-slate-200 px-5 py-10 lg:px-8"><div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3"><ContactCard icon={MapPin} title="Visit Us" text="14 Admiralty Way, Lekki Phase 1, Lagos, Nigeria" /><ContactCard icon={Phone} title="Call Us" text="+234 800 000 0000 · Mon–Sat, 9am–6pm" /><ContactCard icon={Mail} title="Email Us" text="hello@ghorizon.com · reply within 24 hours" /></div></section><section className="bg-[#f3f4f6] px-5 py-16 lg:px-8"><div className="mx-auto grid max-w-7xl gap-7 lg:grid-cols-2"><form onSubmit={(event) => { event.preventDefault(); window.alert("Thank you. A G Horizon advisor will respond within 24 hours."); event.currentTarget.reset(); }} className="bg-white p-7 shadow-sm sm:p-9"><h2 className="font-display text-4xl text-[#0c1f52]">Send us your request</h2><p className="mt-2 text-slate-500">Select what you need and share a few details.</p><div className="mt-7 grid gap-4 sm:grid-cols-3">{["Buy", "Sell", "Consult"].map((label) => <label key={label} className="border border-slate-200 p-3 text-center text-sm font-semibold text-slate-600"><input className="mr-2 accent-[#1e3a8a]" type="radio" name="intent" defaultChecked={label === "Buy"} />{label}</label>)}</div><div className="mt-6 grid gap-4 sm:grid-cols-2"><ContactField label="Full name" required /><ContactField label="Phone" required /><ContactField label="Email" type="email" required /><label><span className="field-label">Property interest</span><select className="field"><option>House</option><option>Land Plot</option><option>Commercial</option><option>Not sure yet</option></select></label></div><label className="mt-4 block"><span className="field-label">Tell us what you need *</span><textarea className="field" rows={5} required placeholder="Tell us about your brief, property, or consultation request." /></label><button className="mt-6 bg-[#1e3a8a] px-5 py-3 text-sm font-bold text-white">Submit Request</button></form><form onSubmit={(event) => { event.preventDefault(); window.alert("Your inspection request has been received."); }} className="bg-[#0c1f52] p-7 text-white shadow-sm sm:p-9"><h2 className="font-display text-4xl">Book an inspection</h2><p className="mt-2 text-white/70">Choose a physical or virtual viewing time.</p><label className="mt-7 block"><span className="field-label !text-white/70">Preferred date</span><input type="date" required className="field" /></label><p className="mt-6 text-xs font-bold uppercase tracking-[.12em] text-white/70">Available times</p><div className="mt-3 grid grid-cols-3 gap-2">{["09:00", "11:00", "13:00", "15:00", "16:30", "18:00"].map((time) => <button type="button" key={time} onClick={() => setSlot(time)} className={slot === time ? "border border-white bg-white px-3 py-2 text-sm font-bold text-[#1e3a8a]" : "border border-white/30 px-3 py-2 text-sm font-semibold text-white hover:border-white"}>{time}</button>)}</div><div className="mt-6 flex gap-5 text-sm"><label><input defaultChecked className="mr-2 accent-[#c9a24b]" name="mode" type="radio" />In person</label><label><input className="mr-2 accent-[#c9a24b]" name="mode" type="radio" />Virtual</label></div><button disabled={!slot} className="mt-7 bg-white px-5 py-3 text-sm font-bold text-[#1e3a8a] disabled:opacity-50">Request Appointment</button><div className="mt-10 border-t border-white/15 pt-5 text-sm text-white/70"><Clock3 className="mr-2 inline h-4 w-4" />We will confirm your appointment by email.</div></form></div></section></main><SiteFooter /></div>;
}

function ContactCard({ icon: Icon, title, text }: { icon: typeof MapPin; title: string; text: string }) { return <div className="flex gap-3"><Icon className="mt-1 h-5 w-5 text-[#c9a24b]" /><div><h2 className="font-display text-2xl text-[#0c1f52]">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{text}</p></div></div>; }
function ContactField({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) { return <label><span className="field-label">{label}{props.required && " *"}</span><input {...props} className="field" /></label>; }
function CTA() { return <section className="bg-[#0c1f52] px-5 py-20 text-center text-white lg:px-8"><p className="font-display text-5xl">Tell us what you&apos;re looking for.</p><p className="mx-auto mt-4 max-w-xl leading-7 text-white/70">A dedicated advisor will help build a tailored shortlist around your needs.</p><Link href="/contact" className="mt-7 inline-flex items-center gap-2 bg-white px-5 py-3.5 text-sm font-bold text-[#1e3a8a]">Start Your Brief <ArrowRight className="h-4 w-4" /></Link></section>; }

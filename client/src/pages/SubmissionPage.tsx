import { ListingSubmissionForm } from "@/components/ghorizon/ListingSubmissionForm";
import { SiteFooter, SiteHeader } from "@/components/ghorizon/SiteChrome";

export default function SubmissionPage() { return <div className="min-h-screen bg-[#f3f4f6]"><SiteHeader /><main className="px-5 py-16 lg:px-8"><ListingSubmissionForm /></main><SiteFooter /></div>; }

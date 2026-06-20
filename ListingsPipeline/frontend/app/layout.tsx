import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ListingsPipeline — Real Estate & Vehicle Sales",
  description: "Secure, admin-verified property and vehicle listings platform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

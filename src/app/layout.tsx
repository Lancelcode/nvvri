import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nvvri.co.uk";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Find a nursery in Edinburgh | nvvri",
    template: "%s | nvvri",
  },
  description:
    "Search and compare Edinburgh nurseries. Filter by age, price, Ofsted rating, and availability. Natural language AI search built for parents.",
  applicationName: "nvvri",
  keywords: [
    "Edinburgh nurseries",
    "nursery finder Edinburgh",
    "childcare Edinburgh",
    "Ofsted rating",
    "nursery search",
    "nursery near me",
  ],
  authors: [{ name: "Djiby Sow Rebollo" }],
  creator: "Djiby Sow Rebollo",
  publisher: "nvvri",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: siteUrl,
    siteName: "nvvri",
    title: "Find a nursery in Edinburgh | nvvri",
    description:
      "Search and compare Edinburgh nurseries with natural language AI search.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Find a nursery in Edinburgh | nvvri",
    description:
      "Search and compare Edinburgh nurseries with natural language AI search.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}

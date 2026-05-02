import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "nvvri | Find the right nursery",
  description: "Search and compare nurseries near you — filter by age, price, Ofsted rating and availability.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
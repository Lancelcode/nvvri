import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nvvrii! — Find the right nursery",
  description: "Search, compare, and enquire at nurseries near you. Built as a proof of concept.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import { ReactQueryProvider } from "@/components/providers/query-provider";

export const metadata: Metadata = {
  title: "KhojSetu / FoundIt - Pan-India AI Lost & Found Network",
  description:
    "AI-powered lost and found platform uniting citizens and authorities across India to recover lost belongings.",
  keywords: ["lost and found", "AI matching", "India", "recovered items", "police lost report"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-surface font-sans antialiased">
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  );
}

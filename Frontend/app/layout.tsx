import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trend Sole",
  description: "Trend Sole storefront powered by Next.js, Zustand, and your backend API.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

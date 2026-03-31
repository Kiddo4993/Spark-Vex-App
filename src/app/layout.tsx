import type { Metadata } from "next";

// Preloading Google fonts to prevent layout shift
import { Syne, Space_Mono, Inter } from "next/font/google";
// NextAuth session provider
import { SessionProvider } from "@/components/SessionProvider";
// Global stylesheet (contains Tailwind directives)
import "./globals.css";
// Global toast container for notifications
import { Toaster } from "react-hot-toast";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
  weight: ["400", "600", "700", "800"],
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
  weight: ["400", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

// Static metadata for SEO/og tags
export const metadata: Metadata = {
  title: "Spark VEX: Bayesian Alliance Engine",
  description: "Advanced VRC scouting and alliance selection powered by Bayesian statistics.",
};

/**
 * Root Layout
 * Wraps the entire application. Injects global fonts, NextAuth session state,
 * and the react-hot-toast container.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${syne.variable} ${spaceMono.variable} ${inter.variable}`}>
      <body className="min-h-screen antialiased bg-surface-bg text-txt-1 font-body">
        <SessionProvider>
          <Toaster position="bottom-right" toastOptions={{
            style: {
              background: '#1A191D',
              color: '#F4F4F4',
              borderRadius: '0',
              border: '1px solid #2B2A2E',
              fontFamily: 'var(--font-space-mono)',
              fontSize: '12px',
              textTransform: 'uppercase'
            }
          }} />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}

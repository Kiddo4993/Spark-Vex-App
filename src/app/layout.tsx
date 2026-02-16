import type { Metadata } from "next";
import { Syne, Space_Mono, DM_Sans } from "next/font/google";
import { SessionProvider } from "@/components/SessionProvider";
import "./globals.css";

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

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "Spark VEX — Bayesian Alliance Engine",
  description:
    "Data-driven VEX Robotics alliance selection with Bayesian performance modeling",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${syne.variable} ${spaceMono.variable} ${dmSans.variable}`}>
      <body className="min-h-screen antialiased bg-surface-bg text-txt-1 font-body">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}

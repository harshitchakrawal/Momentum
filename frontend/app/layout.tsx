import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { TransitionProvider } from "@/components/transition-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Momentum — Dev Productivity Dashboard",
  description: "Track your coding streaks, GitHub activity, and WakaTime stats in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <TransitionProvider>{children}</TransitionProvider>
      </body>
    </html>
  );
}

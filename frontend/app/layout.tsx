import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import localFont from "next/font/local";
import { SWRConfig } from "swr";
import { TransitionProvider } from "@/components/transition-provider";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const ranade = localFont({
  src: [
    { path: "./fonts/Ranade-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Ranade-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/Ranade-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-ranade",
  display: "swap",
});

const paquito = localFont({
  src: [
    { path: "./fonts/Paquito-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Paquito-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/Paquito-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-paquito",
  display: "swap",
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
    <html
      lang="en"
      className={`dark ${ranade.variable} ${playfair.variable} ${paquito.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {/* The GitHub endpoints re-sync from GitHub on every request, so each
            extra fetch costs a burst of upstream calls. Relax both once syncing
            moves to a background job. */}
        <SWRConfig value={{ dedupingInterval: 60_000, revalidateOnFocus: false }}>
          <TransitionProvider>{children}</TransitionProvider>
        </SWRConfig>
      </body>
    </html>
  );
}

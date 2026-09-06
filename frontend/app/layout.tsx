import type { Metadata } from "next";
import {
  Caveat,
  Dancing_Script,
  Manrope,
  Playfair_Display,
  Roboto_Slab,
} from "next/font/google";
import localFont from "next/font/local";
import { SWRConfig } from "swr";
import { LenisProvider } from "@/components/lenis-provider";
import { TransitionProvider } from "@/components/transition-provider";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const robotoSlab = Roboto_Slab({
  variable: "--font-roboto-slab",
  subsets: ["latin"],
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
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
      className={`${ranade.variable} ${playfair.variable} ${paquito.variable} ${manrope.variable} ${robotoSlab.variable} ${dancingScript.variable} ${caveat.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Runs before first paint so a dark-theme visitor never sees a white
            flash. Must stay inline and synchronous — a deferred script would
            land after the browser has already painted. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {/* The GitHub endpoints re-sync from GitHub on every request, so each
            extra fetch costs a burst of upstream calls. Relax both once syncing
            moves to a background job. */}
        <SWRConfig value={{ dedupingInterval: 60_000, revalidateOnFocus: false }}>
          <LenisProvider>
            <TransitionProvider>{children}</TransitionProvider>
          </LenisProvider>
        </SWRConfig>
      </body>
    </html>
  );
}

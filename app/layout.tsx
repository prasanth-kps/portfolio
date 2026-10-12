import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MotionProvider from "@/components/MotionProvider";
import { ViewProvider } from "@/components/ViewProvider";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Prasanth Kasa | Software & ML Engineer",
  description:
    "Portfolio of Prasanth Kasa. MS CS at UW-Madison, AI software intern at Qualcomm, ex-Enphase Energy, IIT Kharagpur. Backend services, systems software and on-device ML.",
  keywords: ["Prasanth Kasa", "portfolio", "software engineer", "ML engineer", "IIT Kharagpur", "UW Madison"],
  authors: [{ name: "Prasanth Kasa" }],
  openGraph: {
    title: "Prasanth Kasa | Software & ML Engineer",
    description: "MS CS at UW-Madison. Qualcomm, Enphase Energy, IIT Kharagpur.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e7eae5" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1210" },
  ],
};

const themeInit = `try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className={`${bricolage.variable} ${geistSans.variable} ${geistMono.variable}`}>
        <a
          href="#main"
          className="fixed left-4 top-4 z-50 -translate-y-24 bg-ink px-4 py-2 font-mono text-sm text-bg focus-visible:translate-y-0"
        >
          Skip to content
        </a>
        <MotionProvider>
          <ViewProvider>{children}</ViewProvider>
        </MotionProvider>
      </body>
    </html>
  );
}

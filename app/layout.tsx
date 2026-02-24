import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prasanth Kasa — Engineer & Researcher",
  description:
    "Portfolio of Prasanth Kasa — MS CS at UW Madison, ex-Enphase Energy, IIT Kharagpur. Systems engineer, ML researcher, and full-stack developer.",
  keywords: ["Prasanth Kasa", "portfolio", "software engineer", "ML engineer", "IIT Kharagpur", "UW Madison"],
  authors: [{ name: "Prasanth Kasa" }],
  openGraph: {
    title: "Prasanth Kasa — Engineer & Researcher",
    description: "MS CS at UW Madison · ex-Enphase Energy · IIT Kharagpur",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}

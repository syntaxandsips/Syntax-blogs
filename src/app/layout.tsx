import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@/styles/neo-brutalism.css";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import { LoaderProvider } from "@/context/LoaderContext";
import { Loader } from "@/components/ui/Loader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Syntax and Sips - AI & ML Insights",
  description: "Exploring the cutting edge of artificial intelligence, machine learning, and deep learning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-black`}
        suppressHydrationWarning
      >
        <LoaderProvider>
          <Loader />
          <ConditionalNavbar />
          <main>{children}</main>
          {/* Add Footer component here if needed */}
        </LoaderProvider>
      </body>
    </html>
  );
}

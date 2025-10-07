import type { Metadata } from "next";
import { headers } from "next/headers";
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
  icons: {
    icon: "/window.svg",
    shortcut: "/window.svg",
    apple: "/apple-touch-icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const nextUrlHeader =
    headersList.get("x-next-url") ??
    headersList.get("next-url") ??
    headersList.get("x-invoke-path") ??
    headersList.get("x-matched-path") ??
    "/";

  let initialPathname = "/";

  try {
    const parsedUrl = new URL(nextUrlHeader, "http://localhost");
    initialPathname = parsedUrl.pathname || "/";
  } catch {
    if (typeof nextUrlHeader === "string" && nextUrlHeader.startsWith("/")) {
      initialPathname = nextUrlHeader;
    }
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-black`}
        suppressHydrationWarning
      >
        <LoaderProvider>
          <Loader />
          <ConditionalNavbar initialPathname={initialPathname} />
          {children}
        </LoaderProvider>
      </body>
    </html>
  );
}

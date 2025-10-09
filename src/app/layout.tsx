import type { Metadata } from "next";
import type { NextWebVitalsMetric } from "next/app";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import "@/styles/neo-brutalism.css";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import { LoaderProvider } from "@/context/LoaderContext";
import { Loader } from "@/components/ui/Loader";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { SiteNavigationJsonLd } from "@/components/seo/SiteNavigationJsonLd";
import { getSiteUrl } from "@/lib/site-url";
import { sendToAnalytics } from "@/lib/analytics/report-web-vitals";
import { Toaster } from "sonner";
import { AuthenticatedProfileProvider } from "@/hooks/useAuthenticatedProfile";
import { createServerComponentClient } from "@/lib/supabase/server-client";
import type { Database } from "@/lib/supabase/types";
import {
  AuthenticatedProfileResolutionError,
  resolveAuthenticatedProfile,
} from "@/lib/auth/authenticated-profile";
import type { AuthenticatedProfileSummary } from "@/utils/types";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Syntax & Sips — Machine Learning Tutorials & Tech Insights",
    template: "%s | Syntax & Sips",
  },
  description: "Actionable machine learning, data science, quantum computing, and developer productivity guides from the Syntax & Sips team.",
  keywords: [
    "machine learning tutorials",
    "data science guides",
    "quantum computing",
    "coding best practices",
    "AI podcast",
  ],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Syntax & Sips",
    title: "Syntax & Sips — Where Code Meets Conversation",
    description:
      "Join Syntax & Sips for weekly AI, machine learning, quantum computing, and developer workflow deep dives.",
    images: [
      {
        url: `${siteUrl}/assets/image.png`,
        width: 1200,
        height: 630,
        alt: "Syntax & Sips machine learning and AI insights",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Syntax & Sips",
    description: "Machine learning, quantum computing, and developer workflow breakdowns.",
    images: [`${siteUrl}/assets/image.png`],
  },
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
  const supabase = createServerComponentClient<Database>();
  let initialProfile: AuthenticatedProfileSummary | null = null;

  try {
    initialProfile = await resolveAuthenticatedProfile(supabase);
  } catch (error) {
    if (error instanceof AuthenticatedProfileResolutionError) {
      if (error.status !== 401 && error.status !== 404) {
        console.error("Unable to prefetch authenticated profile", error);
      }
    } else {
      console.error("Unexpected error while prefetching authenticated profile", error);
    }
  }

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
          <AuthenticatedProfileProvider initialProfile={initialProfile}>
            <Loader />
            <SiteNavigationJsonLd />
            <GoogleAnalytics />
            <ConditionalNavbar initialPathname={initialPathname} />
            <Toaster theme="light" position="bottom-right" richColors closeButton />
            {children}
            <Analytics />
            <SpeedInsights />
          </AuthenticatedProfileProvider>
        </LoaderProvider>
      </body>
    </html>
  );
}

export function reportWebVitals(metric: NextWebVitalsMetric) {
  sendToAnalytics(metric)
}

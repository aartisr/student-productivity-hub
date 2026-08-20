import type { Metadata } from "next";
import "@fontsource-variable/nunito";
import "@fontsource-variable/playfair-display";

import "./globals.css";
import { AuthSessionProvider } from "./auth-session-provider";
import { AnalyticsConsent } from "./analytics-consent";
import { PwaRegister } from "./pwa-register";

const siteUrl = "https://sph.ai-aarti.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Student Productivity Hub | Study Planner, Focus Timer, and Quiz Practice",
    template: "%s | Student Productivity Hub",
  },
  description:
    "Student Productivity Hub is a calm, open study workspace for students and educators to plan assignments, focus with a timer, practice with quizzes, and track progress.",
  applicationName: "Student Productivity Hub",
  keywords: [
    "student productivity",
    "study planner",
    "assignment planner",
    "focus timer",
    "Pomodoro study timer",
    "quiz practice",
    "learning progress",
    "educator tools",
    "open source education",
  ],
  alternates: { canonical: "/" },
  authors: [{ name: "Aarti S Ravikumar", url: "https://github.com/aartisr" }],
  creator: "Aarti S Ravikumar",
  publisher: "Student Productivity Hub",
  category: "education",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  appleWebApp: {
    capable: true,
    title: "Study Hub",
    statusBarStyle: "default",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Student Productivity Hub",
    title: "Student Productivity Hub | A calm study workspace",
    description:
      "Plan assignments, focus your study time, practice with quizzes, and understand your progress in one mobile-first workspace.",
    locale: "en_US",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Student Productivity Hub study workspace" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Student Productivity Hub | A calm study workspace",
    description:
      "A mobile-first workspace for planning, focused study, quiz practice, and progress.",
    creator: "@aartisr",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Student Productivity Hub",
      description: metadata.description,
      inLanguage: "en-US",
      publisher: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Student Productivity Hub",
      url: siteUrl,
      logo: `${siteUrl}/icon.svg`,
      sameAs: [
        "https://github.com/aartisr/student-productivity-hub",
        "https://github.com/aartisr",
      ],
    },
    {
      "@type": "Person",
      "@id": `${siteUrl}/#author`,
      name: "Aarti S Ravikumar",
      url: "https://github.com/aartisr",
      sameAs: ["https://github.com/aartisr"],
      jobTitle: "Student author and maintainer",
      worksFor: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@type": "SoftwareApplication",
      name: "Student Productivity Hub",
      url: siteUrl,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      description: metadata.description,
      creator: { "@id": `${siteUrl}/#author` },
      isAccessibleForFree: true,
      license: "https://opensource.org/licenses/MIT",
      featureList: [
        "Assignment planning",
        "Focused study timer",
        "Quiz authoring and practice",
        "Learning progress tracking",
        "Portable data backups",
      ],
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AuthSessionProvider>{children}</AuthSessionProvider>
        <AnalyticsConsent />
        <PwaRegister />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}

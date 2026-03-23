import type { Metadata } from "next";
import "@fontsource-variable/nunito";
import "@fontsource-variable/playfair-display";

import "./globals.css";
import { AuthSessionProvider } from "./auth-session-provider";

export const metadata: Metadata = {
  title: "Student Productivity Hub",
  description: "A mobile-first study operating system inspired by your AppLab build.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}

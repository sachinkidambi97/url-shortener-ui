import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { BackendProvider } from "@/lib/backend-context";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "Shortr — URL Shortener Dashboard",
  description: "Create, manage, and track your short links",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} dark`}>
      <body className="antialiased min-h-screen bg-background font-sans">
        <BackendProvider>
          <AuthProvider>
            <Header />
            <main>{children}</main>
          </AuthProvider>
        </BackendProvider>
      </body>
    </html>
  );
}

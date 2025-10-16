import type { Metadata } from "next";
import Navigation from "@/components/Navigation";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Symptiq - Health Tracking App",
  description: "Track symptoms, photos, supplements, and food to monitor your health journey",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <Navigation />
          <main className="min-h-screen">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}

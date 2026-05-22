import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/src/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: "Brick AI",
  description: "Australian property discovery experience built with Next.js.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

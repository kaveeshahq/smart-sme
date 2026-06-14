import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart SME Management System",
  description: "Business management platform for Sri Lankan SMEs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
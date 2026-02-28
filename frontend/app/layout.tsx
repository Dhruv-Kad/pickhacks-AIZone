import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PENIS BALLS - PDF Knowledge Assistant",
  description: "Ask questions about zoning laws!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

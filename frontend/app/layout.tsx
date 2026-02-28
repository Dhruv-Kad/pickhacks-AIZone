import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DSKT 18 - PickHax Hackathon 2026",
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

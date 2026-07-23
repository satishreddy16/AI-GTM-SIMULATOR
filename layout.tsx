import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GTM Strategy Simulator",
  description:
    "Simulate your startup's go-to-market strategy before spending your first marketing dollar.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Loaded at runtime in the browser (no build-time fetch). Falls back
            gracefully to the system font stack if offline. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}

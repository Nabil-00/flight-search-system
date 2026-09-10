import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AeroPulse | AI-Assisted Conversational Flight Search",
  description: "Automated natural language flight search, validation, and availability engine powered by DeepSeek & Duffel.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full font-sans antialiased bg-[#F8FAFB] text-storm">
        {children}
      </body>
    </html>
  );
}

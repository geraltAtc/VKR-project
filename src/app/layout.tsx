import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VKR Tours - Поиск и бронирование туров",
  description:
    "Приложение для поиска, сравнения и бронирования туров по всему миру",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VKR Tours",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/globe.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/globe.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    apple: { url: "/globe.svg", sizes: "180x180", type: "image/svg+xml" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

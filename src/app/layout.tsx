import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
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
      <body className={`${plusJakarta.variable} ${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}

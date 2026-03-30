import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { ServiceWorkerRegistration } from "@/components";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-ui",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const themeBootScript = `
(() => {
  try {
    const key = 'lite.travel:theme';
    const stored = localStorage.getItem(key);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = stored ? stored === 'dark' : prefersDark;
    document.documentElement.classList.toggle('dark', isDark);
  } catch {}
})();
`;

export const metadata: Metadata = {
  title: "lite.travel — электронный гид туриста",
  description:
    "PWA-приложение для туристов: отель, трансфер, карта, чек-лист, информация о стране и погода.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Lite.Travel",
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
    <html lang="ru">
      <body className={`${manrope.variable} ${cormorant.variable} antialiased`}>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "محمل الوسائط الاجتماعية",
  description: "قم بتنزيل الفيديوهات والصور من TikTok و YouTube و Twitter و Instagram",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "محمل الوسائط",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "محمل الوسائط الاجتماعية",
    description: "قم بتنزيل الفيديوهات والصور من TikTok و YouTube و Twitter و Instagram",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "محمل الوسائط الاجتماعية",
    description: "قم بتنزيل الفيديوهات والصور من TikTok و YouTube و Twitter و Instagram",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <body
        className={`${cairo.variable} font-cairo antialiased bg-black`}
      >
        {children}
      </body>
    </html>
  );
}

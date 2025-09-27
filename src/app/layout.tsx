import type { Metadata } from "next";
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

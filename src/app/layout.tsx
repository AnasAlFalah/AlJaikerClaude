import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "الجيكر",
  description: "تطبيق تسجيل نقاط ألعاب الورق الكويتية",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen" style={{ background: "var(--felt-dk)" }}>
        <div className="mx-auto max-w-[390px] min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}

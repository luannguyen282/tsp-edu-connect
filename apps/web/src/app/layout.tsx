import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TSPEC Center",
  description: "Education center operations workspace",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}

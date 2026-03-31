import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

const noto = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "YOLO - ずっと、ともに。",
  description:
    "YOLOは、AIがあなたのペットのベストショットを見つけるアプリ。この子との一度きりの時間を、最高の1枚に。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${noto.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-white font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

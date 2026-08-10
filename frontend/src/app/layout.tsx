import type { Metadata, Viewport } from "next";
import { Space_Grotesk, JetBrains_Mono, Zen_Kaku_Gothic_New } from "next/font/google";
import Sidebar from "@/components/layout/Sidebar";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const zenKakuGothicNew = Zen_Kaku_Gothic_New({
  variable: "--font-zen-kaku",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ギター練習支援アプリ",
  description: "キー・スケール・コードを指板で確認できるWebアプリ",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${zenKakuGothicNew.variable} h-full antialiased`}
    >
      <body className="flex h-full overflow-hidden bg-bg text-text-pri font-ui">
        <Sidebar />
        <main className="flex-1 min-w-0 h-screen overflow-y-auto p-[18px_16px_22px] md:p-[22px_32px_28px]">
          {children}
        </main>
      </body>
    </html>
  );
}

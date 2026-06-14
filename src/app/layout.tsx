import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono, Zen_Kaku_Gothic_New } from "next/font/google";
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
      <body className="min-h-full bg-bg text-text-pri font-ui">{children}</body>
    </html>
  );
}

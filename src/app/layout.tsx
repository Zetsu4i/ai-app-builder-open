import type { Metadata } from "next";
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZCode Builder",
  description:
    "AI agent workspace — build apps by chatting with an agent. Preview, code, git, database and terminal in one warm-paper IDE.",
  keywords: ["ZCode Builder", "AI agent", "app builder", "Next.js", "TypeScript", "Tailwind CSS"],
  authors: [{ name: "ZCode Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "ZCode Builder",
    description: "AI agent workspace — chat drives a real IDE: preview, code, git, database, terminal.",
    siteName: "ZCode Builder",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZCode Builder",
    description: "AI agent workspace — chat drives a real IDE: preview, code, git, database, terminal.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

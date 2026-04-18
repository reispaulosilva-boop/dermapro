import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { PresentationModeProvider } from "@/app/_shared/components/PresentationModeProvider";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "DermaPro",
  description: "Análise visual da pele para uso em consultório dermatológico.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${dmSans.variable} ${jetbrainsMono.variable} dark`}
    >
      <body className="min-h-screen antialiased">
        <PresentationModeProvider>{children}</PresentationModeProvider>
      </body>
    </html>
  );
}

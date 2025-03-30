import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { VT323, Press_Start_2P } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const vt323 = VT323({
  weight: "400",
  variable: "--font-vt323",
  subsets: ["latin"],
  display: "swap",
});

const pressStart2P = Press_Start_2P({
  weight: "400",
  variable: "--font-press-start-2p",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Game Captcha",
  description: "im not a robot captcha by playing games",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Game Captcha",
    description: "Train a model by playing Space Invader",
    images: [
      {
        url: "/preview.png",
        width: 1200,
        height: 630,
        alt: "Game Captcha",
      }
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Game Captcha",
    description: "Train a model by playing Space Invader",
    images: ["/preview.png"],
    creator: "@gamecaptcha",
  },
};

function Loading() {
  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.5)',
      zIndex: 9999,
      pointerEvents: 'none'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid rgba(255,255,255,0.3)',
        borderRadius: '50%',
        borderTopColor: '#fff',
        animation: 'spin 1s linear infinite'
      }} />
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/logo.webp" as="image" />
        <link rel="preload" href="/game/assets/js/phaser.min.js" as="script" />
        <link rel="dns-prefetch" href="/game/main.js" />
        
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${vt323.variable} ${pressStart2P.variable}`}>
        <Suspense fallback={<Loading />}>
          {children}
        </Suspense>
      </body>
    </html>
  );
}

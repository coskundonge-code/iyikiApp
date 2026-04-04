import type { Metadata, Viewport } from "next";
import { Toaster } from "react-hot-toast";
import KVKKBanner from "@/components/KVKKBanner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Teşekkürler | İyi Ki",
  description: "Gerçek hediyeler, gerçek jestler. Para yok, jest var.",
  keywords: ["hediye", "jest", "teşekkürler", "iyi ki", "kahve ısmarla"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "iyi ki",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    url: "https://iyiki.app",
    title: "iyi ki - Gerçek Hediyeler",
    description: "Gerçek hediyeler, gerçek jestler. Para yok, jest var.",
    siteName: "iyi ki",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#e11d48",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className="h-full antialiased"
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/png" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="iyi ki" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:text-sm">
          İçeriğe Atla
        </a>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '14px',
            },
          }}
        />
        <PWAInstallPrompt />
        <ServiceWorkerRegistration />
        <KVKKBanner />
      </body>
    </html>
  );
}

// Component to handle service worker registration
function ServiceWorkerRegistration() {
  if (typeof window === 'undefined') return null;

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js').then(
                (registration) => {
                  console.log('Service Worker registered:', registration);

                  // Check for updates periodically
                  setInterval(() => {
                    registration.update();
                  }, 60000);
                },
                (error) => {
                  console.error('Service Worker registration failed:', error);
                }
              );
            });
          }
        `,
      }}
    />
  );
}

// Component to handle PWA install prompt
function PWAInstallPrompt() {
  if (typeof window === 'undefined') return null;

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          let deferredPrompt;

          window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            // Show install button/prompt if you have one
            console.log('Install prompt ready');
          });

          window.addEventListener('appinstalled', () => {
            console.log('App installed');
            deferredPrompt = null;
          });

          // Make deferredPrompt available globally if needed
          window.pwaInstallPrompt = deferredPrompt;
        `,
      }}
    />
  );
}

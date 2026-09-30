import './globals.css';
import { Shell } from '@/components/layout/Shell';

export const viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata = {
  title: 'Root Nexus • JIIT Sector-128 1st Year CSE Cockpit',
  description:
    'All-in-one personal cockpit web application for JIIT Sector-128 CSE students. Live timetable, 75% attendance predictor, Annapurna mess menu, cafe rates, notes repository, and Notion MCP integration.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Root Nexus',
  },
  icons: {
    icon: '/icons/icon-192.svg',
    apple: '/icons/icon-192.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="antialiased min-h-screen bg-[#0a0a0c] text-zinc-100 selection:bg-violet-600/30 selection:text-violet-200">
        <Shell>{children}</Shell>

        {/* Service Worker Registration Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.warn('Service worker registration:', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}


import './globals.css';

import { Analytics } from '@vercel/analytics/react';
import NextTopLoader from 'nextjs-toploader';
export const metadata = {
  title: 'PMI PE - Gamification Dashboard',
  description:
    'Gamification Dashboard'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen w-full flex-col">
        <NextTopLoader 
          color="#2299DD"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={true}
          easing="ease"
          speed={200}
          shadow="0 0 10px #2299DD,0 0 5px #2299DD"
        />
        {children}
        </body>
      <Analytics />
    </html>
  );
}

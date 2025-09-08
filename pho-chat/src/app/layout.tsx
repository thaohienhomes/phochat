import type { Metadata } from 'next';
export { metadata, dynamic, revalidate } from './metadata';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AppProviders } from './providers';
import dynamic from 'next/dynamic';
const ClientHeader = dynamic(() => import('./_app-header').then(m => m.AppHeader), { ssr: false });


const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AppProviders>
          {/* Global app header with auth controls (client-only to avoid SSR provider mismatch) */}
          <ClientHeader />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
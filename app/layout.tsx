import type { Metadata } from 'next';
import './globals.css';
import '@/styles/utilities.css';
import Providers from '@/components/Providers/Providers';
import '@/styles/fonts.css';
import { Toaster } from 'sonner';
import styles from './layout.module.scss';
import clsx from 'clsx';
import ScrollToTop from '@/components/ScrollToTop/ScrollToTop';
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Laklu Restaurant Management',
  description: 'Laklu Restaurant Management System',
  other: {
    'Cache-Control': 'no-store, max-age=0, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="white" data-theme="white">
      <head>
        <meta httpEquiv="Cache-Control" content="no-store, max-age=0, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </head>
      <body className={inter.className}>
        <div
          id="header-secondary-portal"
          className={clsx(styles.headerSecondary)}
        ></div>
        <Toaster 
          position="top-right" 
          duration={3000}
          theme="light"
          richColors
          closeButton
        />
        <div
          id="scroll-to-top-portal"
          className={clsx(styles.scrollToTop)}
        ></div>
        <ScrollToTop />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

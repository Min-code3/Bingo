import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Noto_Serif_KR } from 'next/font/google';
import { I18nProvider } from '@/components/I18nProvider';
import { BingoProvider } from '@/components/BingoProvider';
import Sidebar from '@/components/Sidebar';
import LanguageToggle from '@/components/LanguageToggle';
import GlobalLogger from '@/components/GlobalLogger';
import './globals.css';

const notoSerifKR = Noto_Serif_KR({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-noto-serif-kr',
});

export const metadata: Metadata = {
  title: 'Travel Bingo',
  description: 'Visit landmarks and take photos to complete bingo!',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={notoSerifKR.className} suppressHydrationWarning>
        <I18nProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <BingoProvider>
              <GlobalLogger />
              <Sidebar />
              <main className="main-content">
                {children}
                <LanguageToggle />
              </main>
            </BingoProvider>
          </Suspense>
        </I18nProvider>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/providers/query-provider';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: {
    default: 'BuyAll Ghana — Quality Physical Goods Store',
    template: '%s | BuyAll Ghana',
  },
  description: 'Shop quality physical goods in Ghana with fast local delivery across all 16 regions. Secure checkout with Paystack (GHS).',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900 font-sans selection:bg-amber-100 selection:text-amber-900">
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}

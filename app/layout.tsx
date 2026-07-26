import type { Metadata } from 'next';
import { Urbanist } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppChat from '@/components/WhatsAppChat';
import { CartProvider } from '@/lib/cart-context';

const urbanist = Urbanist({
  subsets: ['latin'],
  variable: '--font-urbanist',
  display: 'swap',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'Reseller Bus | UK Wholesale Clothing Bales',
  description:
    'Premium 50kg cream grade clothing bales and liquidation stock for resellers in the UK, Ghana, Nigeria, Gambia, and Europe. Quality-checked, trusted, and ready to ship.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body
        className={`${urbanist.variable} font-sans bg-background text-foreground min-h-screen min-w-0 flex flex-col antialiased overflow-x-hidden`}
      >
        <CartProvider>
          <Navbar />
          <main className="flex-1 w-full min-w-0 overflow-x-hidden">{children}</main>
          <Footer />
          <WhatsAppChat />
        </CartProvider>
      </body>
    </html>
  );
}

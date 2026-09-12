import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthProvider from '@/components/AuthProvider';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import { GlobalProvider } from '@/context/GlobalContext';
import { Suspense } from 'react';
import { ToastContainer } from 'react-toastify';
import { Cinzel, Montserrat } from 'next/font/google';
import 'react-toastify/dist/ReactToastify.css';
import '@/assets/styles/globals.css';
import { SITE_CONFIG, getSiteUrl } from '@/config/site';
import 'photoswipe/dist/photoswipe.css';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-heading',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    template: `%s · ${SITE_CONFIG.name}`,
    default: `${SITE_CONFIG.name} | Portal inmobiliario`,
  },
  description: SITE_CONFIG.description,
  keywords: SITE_CONFIG.keywords,
  authors: [{ name: SITE_CONFIG.name }],
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: SITE_CONFIG.isoPath,
        width: 1200,
        height: 630,
        alt: `${SITE_CONFIG.name} — Portal inmobiliario`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
  },
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: SITE_CONFIG.isoPath,
    apple: SITE_CONFIG.isoPath,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

import { getSiteConfig } from '@/utils/getSiteConfig';

const MainLayout = async ({ children }) => {
  const siteConfig = await getSiteConfig();

  return (
    <AuthProvider>
      <GlobalProvider>
        <html lang='es' className={`${montserrat.variable} ${cinzel.variable}`}>
          <body className='font-sans antialiased text-gray-200'>
            <Navbar contactEmail={siteConfig.contactEmail} contactPhone={siteConfig.contactPhone} />
            <main className="relative pb-[12px]">{children}</main>
            <Footer footerDescription={siteConfig.footerDescription} contactEmail={siteConfig.contactEmail} contactPhone={siteConfig.contactPhone} contactAddress={siteConfig.contactAddress} />
            <ToastContainer />
            <Suspense fallback={null}>
              <GoogleAnalytics analyticsId={siteConfig.analyticsId} facebookPixelId={siteConfig.facebookPixelId} />
            </Suspense>
          </body>
        </html>
      </GlobalProvider>
    </AuthProvider>
  );
};

export default MainLayout;

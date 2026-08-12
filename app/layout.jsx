import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthProvider from '@/components/AuthProvider';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import { GlobalProvider } from '@/context/GlobalContext';
import { Suspense } from 'react';
import { ToastContainer } from 'react-toastify';
import { Cormorant_Garamond } from 'next/font/google';
import localFont from 'next/font/local';
import 'react-toastify/dist/ReactToastify.css';
import '@/assets/styles/globals.css';
import { SITE_CONFIG, getSiteUrl } from '@/config/site';
import 'photoswipe/dist/photoswipe.css';

const lato = localFont({
  src: [
    { path: '../assets/fonts/lato/Lato-Light.woff2', weight: '300', style: 'normal' },
    { path: '../assets/fonts/lato/Lato-LightItalic.woff2', weight: '300', style: 'italic' },
    { path: '../assets/fonts/lato/Lato-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../assets/fonts/lato/Lato-Italic.woff2', weight: '400', style: 'italic' },
    { path: '../assets/fonts/lato/Lato-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-body',
  display: 'swap',
});

const ptSerif = localFont({
  src: [
    { path: '../assets/fonts/pt-serif/PTSerif-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../assets/fonts/pt-serif/PTSerif-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-heading',
  display: 'swap',
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
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
        <html lang='es' className={`${lato.variable} ${ptSerif.variable} ${cormorantGaramond.variable}`}>
          <body className='font-sans antialiased text-body'>
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

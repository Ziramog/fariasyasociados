import { getSiteUrl } from '@/config/site';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: [
          '/admin',
          '/superadmin',
          '/api',
          '/profile',
          '/messages',
          '/properties/add',
          '/properties/*/edit',
          '/properties/saved',
          '/properties/search-results',
        ],
      },
    ],
    sitemap: getSiteUrl('/sitemap.xml'),
  };
}

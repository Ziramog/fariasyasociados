export default function ReviewSchema({ reviews, summary, agencyName, agencyUrl }) {
  if (!reviews || reviews.length === 0) return null;

  const localBusiness = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: agencyName,
    url: agencyUrl,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: summary.averageRating.toString(),
      reviewCount: summary.totalReviews.toString(),
      bestRating: '5',
      worstRating: '1',
    },
    review: reviews.slice(0, 10).map(r => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.authorName },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: r.rating.toString(),
        bestRating: '5',
        worstRating: '1',
      },
      datePublished: r.publishTime.split('T')[0],
      reviewBody: r.text || undefined,
    })),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }} />;
}

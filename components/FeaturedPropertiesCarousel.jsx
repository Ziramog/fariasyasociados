'use client';
import FeaturedProperties from '@/components/FeaturedProperties';

const FeaturedPropertiesCarousel = ({ properties = [] }) => {
  const withImages = properties.filter((p) => (p.images || []).length > 0);
  return <FeaturedProperties properties={withImages} />;
};

export default FeaturedPropertiesCarousel;

import ReviewCard from './ReviewCard';

export default function ReviewGrid({ reviews, columns = 3 }) {
  if (reviews.length === 0) {
    return <div className="text-center py-12 text-zinc-400 text-sm">No hay reseñas disponibles.</div>;
  }

  return (
    <div className={`grid gap-4 ${columns === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
      {reviews.map((review, index) => (
        <ReviewCard key={review.id} review={review} variant={index === 0 && review.featured ? 'featured' : 'default'} />
      ))}
    </div>
  );
}

import StarRating from './StarRating';

export default function ReviewSummary({ summary }) {
  const { totalReviews, averageRating, ratingDistribution } = summary;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-8 p-6 bg-white rounded-2xl border border-zinc-100 shadow-sm">
      <div className="flex flex-col items-center gap-1 flex-shrink-0">
        <span className="text-5xl font-bold text-zinc-900 tracking-tight">{averageRating.toFixed(1)}</span>
        <StarRating rating={averageRating} size="md" />
        <span className="text-sm text-zinc-500 mt-1">{totalReviews} {totalReviews === 1 ? 'reseña' : 'reseñas'}</span>
      </div>
      <div className="hidden sm:block w-px h-24 bg-zinc-100" />
      <div className="flex flex-col gap-2 flex-1 w-full max-w-xs">
        {([5, 4, 3, 2, 1]).map(star => {
          const count = ratingDistribution[star] || 0;
          const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
          return (
            <div key={star} className="flex items-center gap-3">
              <span className="text-xs text-zinc-500 w-3 text-right">{star}</span>
              <svg className="w-3 h-3 text-amber-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              <div className="flex-1 bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} />
              </div>
              <span className="text-xs text-zinc-400 w-5 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

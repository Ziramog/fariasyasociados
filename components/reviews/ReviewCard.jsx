import Image from 'next/image';
import StarRating from './StarRating';

function AuthorAvatar({ name, photo }) {
  if (photo) {
    return (
      <img 
        src={photo} 
        alt={name} 
        className="w-10 h-10 rounded-full flex-shrink-0 object-cover" 
      />
    );
  }

  const initials = name.split(' ').slice(0, 2).map(n => n[0]?.toUpperCase() ?? '').join('');

  return (
    <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-semibold bg-[var(--color-brand)]" aria-label={name}>
      {initials}
    </div>
  );
}

export default function ReviewCard({ review, variant = 'default' }) {
  if (variant === 'minimal') {
    const isManual = review.googlePlaceId === 'manual';
    const Wrapper = isManual ? 'article' : 'a';
    const wrapperProps = isManual ? {} : {
      href: `https://search.google.com/local/reviews?placeid=${review.googlePlaceId}`,
      target: '_blank',
      rel: 'noopener noreferrer'
    };

    return (
      <Wrapper 
        {...wrapperProps}
        className="relative flex flex-col h-full bg-[#F8F9FA] rounded-2xl p-6 md:p-8 transition-colors duration-300 block cursor-pointer" 
        aria-label={`Reseña de ${review.authorName}`}
      >
        <p className="text-[15px] md:text-[16px] text-[#555] leading-[1.7] mb-5 md:mb-6 flex-1 italic line-clamp-4" style={{ fontFamily: 'var(--font-body)' }}>
          "{review.text}"
        </p>
        <div className="flex items-center gap-3 mt-auto">
          <AuthorAvatar name={review.authorName} photo={review.authorPhoto} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-col">
              <p className="text-sm font-semibold text-[#1a1a1a] tracking-wide truncate">{review.authorName}</p>
              <time dateTime={review.publishTime} className="text-xs text-[#888]">{review.relativeTimeDescription}</time>
            </div>
            <div className="mt-0.5">
              <StarRating rating={review.rating} size="sm" variant="dark" />
            </div>
          </div>
        </div>
      </Wrapper>
    );
  }

  return (
    <article className="relative flex flex-col h-full bg-[#F8F9FA] rounded-2xl p-5 pb-6 transition-colors duration-300" aria-label={`Reseña de ${review.authorName}`}>
      <div className="flex items-center gap-3 mb-3">
        <AuthorAvatar name={review.authorName} photo={review.authorPhoto} />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-[#1a1a1a] text-sm truncate">{review.authorName}</p>
          <time dateTime={review.publishTime} className="text-xs text-[#888]">{review.relativeTimeDescription}</time>
        </div>
      </div>
      <div className="mb-3"><StarRating rating={review.rating} size="sm" variant="dark" /></div>
      {review.text && <p className="text-sm text-[#555] leading-relaxed line-clamp-4 mb-4">{review.text}</p>}
      <div className="mt-auto flex items-center gap-1.5 pt-3 border-t border-[#eee]">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span className="text-xs text-[#999]">Reseña de Google</span>
      </div>
    </article>
  );
}

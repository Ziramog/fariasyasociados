'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import ReviewCard from '@/components/reviews/ReviewCard';
import ScrollReveal from '@/components/shared/ScrollReveal';

export default function ReviewsCarousel({ reviews, googleRating, totalRatings }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const trackRef = useRef(null);
  const autoRotateRef = useRef(null);

  const totalCards = reviews.length;

  const scrollTo = useCallback((index) => {
    const clamped = Math.max(0, Math.min(index, totalCards - 1));
    setActiveIndex(clamped);
    if (trackRef.current && trackRef.current.children[0]) {
      const cardWidth = trackRef.current.children[0].offsetWidth;
      const gap = 20;
      trackRef.current.scrollTo({
        left: clamped * (cardWidth + gap),
        behavior: 'smooth'
      });
    }
  }, [totalCards]);

  const next = useCallback(() => {
    scrollTo((activeIndex + 1) % totalCards);
  }, [activeIndex, totalCards, scrollTo]);

  useEffect(() => {
    if (isPaused) return;
    autoRotateRef.current = setInterval(() => {
      setActiveIndex(prev => {
        const nextIdx = (prev + 1) % totalCards;
        if (trackRef.current && trackRef.current.children[0]) {
          const cardWidth = trackRef.current.children[0].offsetWidth;
          const gap = 20;
          trackRef.current.scrollTo({
            left: nextIdx * (cardWidth + gap),
            behavior: 'smooth'
          });
        }
        return nextIdx;
      });
    }, 5000);
    return () => clearInterval(autoRotateRef.current);
  }, [isPaused, totalCards]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const handleScroll = () => {
      const scrollLeft = track.scrollLeft;
      const cardWidth = track.children[0]?.offsetWidth || 1;
      const gap = 20;
      const newIndex = Math.round(scrollLeft / (cardWidth + gap));
      if (newIndex !== activeIndex && newIndex >= 0 && newIndex < totalCards) {
        setActiveIndex(newIndex);
      }
    };

    track.addEventListener('scroll', handleScroll, { passive: true });
    return () => track.removeEventListener('scroll', handleScroll);
  }, [activeIndex, totalCards]);

  if (totalCards === 0) return null;

  return (
    <section className="pt-[12px] pb-[12px]">
      <div className="bg-white w-full pt-[30px] pb-[30px] md:pt-[60px] md:pb-[70px]">
        <div className="max-w-[1820px] mx-auto px-4 md:px-[50px]">

          <div className="text-center mb-10 md:mb-14">
            <ScrollReveal variant="fadeLeft">
              <h2 className="text-[28px] md:text-[40px] font-normal text-[#0F172A] leading-tight mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                Lo que dicen nuestros clientes
              </h2>
            </ScrollReveal>
            <div className="flex items-center justify-center gap-3">
              <span className="w-7 h-px bg-[var(--color-brand)] flex-shrink-0" />
              <p className="text-[13px] md:text-[15px] font-medium text-[var(--color-brand)] uppercase tracking-[0.15em]">
                Experiencias reales
              </p>
              <span className="w-7 h-px bg-[var(--color-brand)] flex-shrink-0" />
            </div>
            {googleRating && (
              <div className="mt-4">
                <span className="text-[14px] text-zinc-500">
                  <span className="font-semibold text-zinc-900">{googleRating.toFixed(1)}</span>
                  {totalRatings && (
                    <span className="text-zinc-400"> — {totalRatings} reseñas en Google</span>
                  )}
                </span>
              </div>
            )}
          </div>

          <div
            className="relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div
              ref={trackRef}
              className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide pb-2 -mx-1 px-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="flex-shrink-0 w-[85vw] md:w-[calc(33.333%-14px)] snap-start"
                >
                  <ReviewCard review={review} variant="minimal" />
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-2 mt-5">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollTo(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === activeIndex
                      ? 'bg-[var(--color-brand)] w-7'
                      : 'bg-zinc-200 w-2 hover:bg-zinc-300'
                  }`}
                  aria-label={`Ir a reseña ${i + 1}`}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

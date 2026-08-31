'use client';
import { useState, useEffect, useRef } from 'react';
import getPropertyCount from '@/app/actions/getPropertyCount';

const StatItem = ({ stat }) => {
  const [count, setCount] = useState(0);
  const [active, setActive] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setActive(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!active) return;
    const duration = 1800;
    const target = stat.value;
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;
      setCount(stat.decimals ? parseFloat(current.toFixed(stat.decimals)) : Math.floor(current));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [active, stat.value, stat.decimals]);

  const isReviews = stat.label === 'Reseñas' || stat.label === 'Reseñas';

  return (
    <div ref={ref} className="flex-1 text-center px-2 relative group">
      {isReviews && (
        <div className="flex justify-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((star) => {
            const opacity = star <= Math.round(stat.value) ? 1 : 0.4;
            return (
              <svg key={star} viewBox="0 0 20 20" className="w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 group-hover:scale-110" style={{ opacity }}>
                <path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.33L10 13.88l-4.77 2.84.91-5.33L2.27 6.62l5.34-.78z" fill="var(--color-brand)" />
              </svg>
            );
          })}
        </div>
      )}
      <h3 className="text-[40px] md:text-[60px] leading-none text-white font-normal tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
        {count}<span className="text-[var(--color-brand)]">{stat.suffix}</span>
      </h3>
      <p className="text-[11px] md:text-[13px] leading-[24px] text-white/60 mt-2 uppercase tracking-[0.2em] font-medium" style={{ fontFamily: 'var(--font-body)' }}>
        {stat.label}
      </p>
    </div>
  );
};

const StatsBar = () => {
  const [propertyCount, setPropertyCount] = useState(500);
  const [reviewStats, setReviewStats] = useState({ count: 20, average: 4.8 });

  useEffect(() => {
    getPropertyCount().then(setPropertyCount);
    import('@/app/actions/getReviewStats').then(module => {
      module.default().then(setReviewStats);
    });
  }, []);

  const STATS = [
    { value: propertyCount, suffix: '+', label: 'Propiedades' },
    { value: 20, suffix: '+', label: 'Años de experiencia' },
    { value: reviewStats.average, suffix: '', label: 'Reseñas', decimals: 1 },
  ];

  return (
    <section className="bg-black py-3 md:py-4 border-b border-white/[0.05]">
      <div className="max-w-[98vw] md:max-w-[60vw] mx-auto px-0 md:px-[50px]">
        <div className="flex justify-center md:justify-between items-center gap-1 md:gap-8 w-full max-w-[100vw] overflow-hidden">
          {STATS.map((stat, idx) => (
            <div key={stat.label} className="flex-1 text-center relative">
              <StatItem stat={stat} />
              {/* Divider between items */}
              {idx < STATS.length - 1 && (
                <div className="hidden md:block absolute right-[-20%] top-1/2 -translate-y-1/2 w-px h-8 bg-white/[0.08]" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsBar;

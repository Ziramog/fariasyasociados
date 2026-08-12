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

  const isReviews = stat.label === 'Reseñas';

  return (
    <div ref={ref} className="flex-1 text-center px-2">
      {isReviews && (
        <div className="flex justify-center gap-[2px] mb-1">
          {[1, 2, 3, 4, 5].map((star) => {
            const fill = star <= 4 ? 'var(--color-brand)' : 'var(--color-brand)';
            const opacity = star <= 4 ? 1 : 0.8;
            return (
              <svg key={star} viewBox="0 0 20 20" className="w-4 h-4 md:w-5 md:h-5" style={{ opacity }}>
                <path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.33L10 13.88l-4.77 2.84.91-5.33L2.27 6.62l5.34-.78z" fill={fill} />
              </svg>
            );
          })}
        </div>
      )}
      <h3 className="text-[40px] md:text-[60px] leading-none text-[var(--color-brand)] font-bold" style={{ fontFamily: 'var(--font-display)' }}>
        {count}{stat.suffix}
      </h3>
      <p className="text-[14px] md:text-[18px] leading-[24px] text-black mt-2 md:mt-3" style={{ fontFamily: 'var(--font-body)' }}>
        {stat.label}
      </p>
    </div>
  );
};

const StatsBar = () => {
  const [propertyCount, setPropertyCount] = useState(500);

  useEffect(() => {
    getPropertyCount().then(setPropertyCount);
  }, []);

  const STATS = [
    { value: propertyCount, suffix: '+', label: 'Propiedades' },
    { value: 20, suffix: '+', label: 'Años de experiencia' },
    { value: 4.8, suffix: '', label: 'Reseñas', decimals: 1 },
  ];

  return (
    <section className="pb-[15px] pt-0">
      <div className="bg-white w-full py-[15px] md:py-[25px]">
      <div className="max-w-[60vw] mx-auto px-4 md:px-[50px]">
        <div className="flex justify-center">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex-1 text-center px-2">
              <StatItem stat={stat} />
            </div>
          ))}
        </div>
      </div>
      </div>
    </section>
  );
};

export default StatsBar;

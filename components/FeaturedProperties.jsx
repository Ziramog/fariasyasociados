'use client';
import { useState, useEffect, useRef } from 'react';
import FeaturedPropertyCard from '@/components/FeaturedPropertyCard';
import SectionBox from '@/components/sections/SectionBox';
import ScrollReveal from '@/components/shared/ScrollReveal';

const FeaturedProperties = ({ properties = [] }) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  if (properties.length === 0) return null;

  return (
    <section className="pt-[12px] pb-[12px]" ref={ref}>
      <SectionBox className="px-4 md:px-[50px] py-16 md:py-24">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-14">
          <ScrollReveal variant="fadeLeft">
            <h2 className="text-[28px] md:text-[40px] font-normal text-[#0F172A] leading-tight mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              Oportunidades Únicas
            </h2>
          </ScrollReveal>
          <div className="flex items-center justify-center gap-3">
            <span className="w-7 h-px bg-[var(--color-brand)] flex-shrink-0" />
            <p className="text-[13px] md:text-[15px] font-medium text-[var(--color-brand)] uppercase tracking-[0.15em]">
              ELEGIDAS ESPECIALMENTE PARA VOS
            </p>
            <span className="w-7 h-px bg-[var(--color-brand)] flex-shrink-0" />
          </div>
        </div>

        {/* 6-card grid */}
        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {properties.slice(0, 6).map((property, i) => (
            <div
              key={property._id?.toString() || i}
              className={`transition-all duration-500 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: visible ? `${i * 80}ms` : '0ms' }}
            >
              <FeaturedPropertyCard
                property={{
                  ...property,
                  _id: property._id?.toString(),
                }}
              />
            </div>
          ))}
          </div>
        </div>

        <div className="text-center mt-6">
          <a
            href="/properties"
            className="inline-flex items-center justify-center px-8 h-[52px] bg-zinc-50/80 backdrop-blur-sm border border-zinc-200/80 text-zinc-700 hover:text-white hover:bg-[var(--color-brand)] hover:border-[var(--color-brand)] rounded-sm text-[13px] font-bold uppercase tracking-[0.08em] transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1"
          >
            Ver todas las propiedades
          </a>
        </div>
      </SectionBox>
    </section>
  );
};

export default FeaturedProperties;

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
              Propiedades Destacadas
            </h2>
          </ScrollReveal>
          <div className="flex items-center justify-center gap-3">
            <span className="w-7 h-px bg-[var(--color-brand)] flex-shrink-0" />
            <p className="text-[13px] md:text-[15px] font-medium text-[var(--color-brand)] uppercase tracking-[0.15em]">
              NUESTRA SELECCION PARA VOS
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

        {/* CTA */}
        <div className="text-center">
          <a
            href="/properties"
            className="inline-block text-[var(--color-brand)] text-[13px] font-bold uppercase tracking-wider transition-all duration-200 hover:underline underline-offset-4 decoration-[var(--color-brand)]"
          >
            Ver todas las propiedades
          </a>
        </div>
      </SectionBox>
    </section>
  );
};

export default FeaturedProperties;

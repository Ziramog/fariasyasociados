'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, Building2, Mountain, Sprout, Store, TrendingUp } from 'lucide-react';
import SectionBox from '@/components/sections/SectionBox';
import ScrollReveal from '@/components/shared/ScrollReveal';

const CATEGORIES = [
  { type: 'Casa', icon: Home, label: 'Casas' },
  { type: 'Departamento', icon: Building2, label: 'Departamentos' },
  { type: 'Terreno', icon: Mountain, label: 'Terrenos' },
  { type: 'Campo', icon: Sprout, label: 'Campos' },
  { type: 'Inmueble Comercial', icon: Store, label: 'Locales' },
  { type: 'Gran Inversión', icon: TrendingUp, label: 'Inversión' },
];

const CategoryCards = () => {
  const router = useRouter();
  const [active, setActive] = useState(null);

  const handleClick = (type) => {
    setActive(type);
    if (type === 'Gran Inversión') {
      router.push('/properties?granInversion=true');
    } else {
      router.push(`/properties?type=${encodeURIComponent(type)}`);
    }
  };

  return (
    <section className="pb-[30px] pt-[30px] px-4">
      <SectionBox className="max-w-[92vw] mx-auto px-4 md:px-[50px] py-16 md:py-24">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--color-brand)] block mb-3">
            CATEGORÍAS
          </span>
          <ScrollReveal variant="fadeLeft">
            <h2 className="text-2xl md:text-[32px] font-medium text-[#0F172A] leading-tight tracking-[-0.01em] mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
              Explorá por categoría
            </h2>
          </ScrollReveal>
          <p className="text-[14px] md:text-[17px] font-light text-[#475569] leading-[1.7]">
            Encontrá el tipo de propiedad que mejor se adapta a vos
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-5">
          {CATEGORIES.map(({ type, label, icon: Icon }) => {
            const isActive = active === type;
            return (
              <article
                key={type}
                onClick={() => handleClick(type)}
                className={`
                  group relative bg-white border rounded-2xl p-5 pb-4 md:p-8 md:pb-7
                  flex flex-col items-center gap-3 md:gap-4 cursor-pointer
                  border-[#e1e1e1]
                  shadow-[0_2px_8px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)]
                  transition-all duration-200
                  hover:border-[var(--color-brand)]
                  hover:shadow-[0_8px_32px_rgba(0,0,0,0.10),0_2px_8px_rgba(0,0,0,0.06)]
                  hover:-translate-y-1
                  ${isActive ? 'bg-[#FFF3E8] border-[var(--color-brand)]' : ''}
                `}
              >
                {/* Icon */}
                <div
                  className={`
                    w-10 h-10 md:w-[52px] md:h-[52px] rounded-xl flex items-center justify-center
                    bg-[#f7f7f7]
                    transition-colors duration-150
                    group-hover:bg-[#FFF3E8]
                    ${isActive ? 'bg-[#FFF3E8]' : ''}
                  `}
                >
                  <Icon
                    className={`w-5 h-5 md:w-7 md:h-7 ${isActive ? 'text-[var(--color-brand)]' : 'text-[var(--color-brand)]'}`}
                    strokeWidth={1.5}
                  />
                </div>

                {/* Label */}
                <span
                  className={`
                    text-[12px] md:text-sm font-medium text-center
                    ${isActive ? 'text-[var(--color-brand)]' : 'text-[#475569]'}
                    transition-colors duration-150
                    group-hover:text-[var(--color-brand)]
                  `}
                >
                  {label}
                </span>
              </article>
            );
          })}
        </div>
      </SectionBox>
    </section>
  );
};

export default CategoryCards;

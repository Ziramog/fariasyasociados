'use client';
import { getAreaDisplay } from '@/utils/propertyDisplay';

const PropertyCardInfo = ({ property, className = '' }) => {
  const name = property.name || '';
  const city = property.location?.city || '';

  return (
    <div className={`px-3 py-3 ${className}`}>
      <h3 className="text-[22px] font-medium text-[#0F172A] group-hover:text-[var(--color-brand)] leading-snug line-clamp-2 mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
        {name}
      </h3>
      <p className="text-[16px] text-[#878787] leading-tight line-clamp-1">
        {city}
      </p>
    </div>
  );
};

export default PropertyCardInfo;
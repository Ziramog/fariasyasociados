'use client';

const CheckIcon = () => (
  <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' viewBox='0 0 16 16'>
    <path stroke='#22c55e' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='m2.5 8 3.5 3.5 7.5-8' />
  </svg>
);

const StarIcon = () => (
  <svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='currentColor' viewBox='0 0 16 16'>
    <path d='M8 .5a.5.5 0 0 1 .5.5v5.44l2.47 2.46a.5.5 0 0 1-.7.7l-2.27-2.27a.5.5 0 0 1-.15-.38V1a.5.5 0 0 1 .5-.5z' />
  </svg>
);

const TRUNCATE_LENGTH = 55;

const truncate = (text) => {
  if (!text || text.length <= TRUNCATE_LENGTH) return { display: text, full: text };
  return {
    display: text.slice(0, TRUNCATE_LENGTH).trimEnd() + '…',
    full: text,
  };
};

const PropertyNormalizedDescription = ({ property }) => {
  const { normalizedDescription } = property;

  if (!normalizedDescription || !normalizedDescription.resumen) return null;

  const { resumen, ubicacion, detalles = [], highlights = [], nota } = normalizedDescription;

  return (
    <div className='bg-white rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-card)] mt-4 overflow-hidden'>
      {/* Resumen */}
      {resumen && (
        <div className='p-6 border-l-4 border-l-[var(--color-brand)]'>
          <p className='text-gray-600 leading-relaxed'>
            {resumen}
          </p>
        </div>
      )}

      {/* Highlights */}
      {highlights.length > 0 && (
        <div className='px-6 py-4 border-t border-[var(--color-border)]'>
          <div className='flex gap-2 overflow-x-auto pb-1 scrollbar-hide'>
            {highlights.map((highlight, i) => (
              <span
                key={i}
                className='flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-brand-light)] text-[var(--color-brand)] text-sm font-medium'
              >
                <StarIcon />
                {highlight}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Ubicación */}
      {ubicacion && (
        <div className='px-6 py-4 border-t border-[var(--color-border)]'>
          <h4 className='text-sm font-semibold text-[var(--color-ink-tertiary)] uppercase tracking-wide mb-2'>
            Ubicación
          </h4>
          <p className='text-gray-600 leading-relaxed'>
            {ubicacion}
          </p>
        </div>
      )}

      {/* Detalles */}
      {detalles.length > 0 && (
        <div className='px-6 py-4 border-t border-[var(--color-border)]'>
          <h4 className='text-sm font-semibold text-[var(--color-ink-tertiary)] uppercase tracking-wide mb-3'>
            Detalles
          </h4>
          <ul className='grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 list-none'>
            {detalles.map((detail, i) => {
              const { display, full } = truncate(detail);
              return (
                <li key={i} className='flex items-start gap-2'>
                  <CheckIcon />
                  <span
                    className='text-gray-600'
                    title={full !== display ? full : undefined}
                  >
                    {display}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Nota */}
      {nota && (
        <div className='px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-warn-bg)]'>
          <div className='flex items-start gap-2'>
            <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' viewBox='0 0 16 16' className='text-[var(--color-warn)] flex-shrink-0 mt-0.5'>
              <path stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 0h16v9.5a6.5 6.5 0 0 1-6.5 6.5h-3A6.5 6.5 0 0 1 0 9.5V0zm7 4a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm-.5 3h1v4h-1V7z' />
            </svg>
            <p className='text-gray-600 leading-relaxed'>
              {nota}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyNormalizedDescription;

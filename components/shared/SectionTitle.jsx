import ScrollReveal from '@/components/shared/ScrollReveal';

const SectionTitle = ({ children, size = 'normal', delay = 0, className = '' }) => {
  const headingStyle = size === 'large'
    ? 'text-[28px] md:text-[40px]'
    : 'text-[22px] md:text-[28px]';

  return (
    <ScrollReveal variant="fadeLeft" delay={delay}>
      <h2
        className={`${headingStyle} font-semibold text-[#0F172A] flex items-center ${className}`}
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {children}
        <span
          aria-hidden="true"
          className="inline-block ml-5"
          style={{
            width: '70px',
            height: '3px',
            background: 'var(--color-brand)',
            alignSelf: 'center',
          }}
        />
      </h2>
    </ScrollReveal>
  );
};

export default SectionTitle;

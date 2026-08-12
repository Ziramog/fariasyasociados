'use client';
import { useEffect, useRef, useState } from 'react';

const variantClasses = {
  fadeUp: {
    hidden: 'opacity-0 translate-y-8',
    visible: 'opacity-100 translate-y-0',
  },
  fadeScale: {
    hidden: 'opacity-0 translate-y-6 scale-95',
    visible: 'opacity-100 translate-y-0 scale-100',
  },
  fadeLeft: {
    hidden: 'opacity-0 -translate-x-[50px] md:-translate-x-[100px]',
    visible: 'opacity-100 translate-x-0',
  },
  fadeRight: {
    hidden: 'opacity-0 translate-x-[50px] md:translate-x-[100px]',
    visible: 'opacity-100 translate-x-0',
  },
  fadeIn: {
    hidden: 'opacity-0',
    visible: 'opacity-100',
  },
};

const variantDurations = {
  fadeUp: 700,
  fadeScale: 800,
  fadeLeft: 500,
    fadeRight: 500,
  fadeIn: 600,
};

const ScrollReveal = ({
  children,
  className = '',
  delay = 0,
  variant = 'fadeUp',
  distance,
  duration,
  once = true,
}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  const v = variantClasses[variant] || variantClasses.fadeUp;
  const dur = duration || variantDurations[variant] || 700;

  useEffect(() => {
    let timeout;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timeout = setTimeout(() => {
            setIsVisible(true);
          }, 150);
          if (once) observer.disconnect();
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    if (ref.current) observer.observe(ref.current);
    return () => {
      observer.disconnect();
      if (timeout) clearTimeout(timeout);
    };
  }, [once]);

  const distanceStyle = distance
    ? { transform: isVisible ? undefined : `translateY(${distance}px)` }
    : {};

  return (
    <div
      ref={ref}
      className={`transition ease-out ${isVisible ? v.visible : v.hidden} ${className}`}
      style={{
        transitionDuration: `${dur}ms`,
        transitionDelay: `${delay}ms`,
        ...distanceStyle,
      }}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;

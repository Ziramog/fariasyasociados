'use client';

import { useEffect } from 'react';

/**
 * Initializes scroll-triggered animations (senada style).
 * Attach .js-animate to any element, and it will fade-in from left when it enters the viewport.
 */
export default function ScrollAnimation() {
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px 0px -80px 0px',
      threshold: 0,
    };

    const pending = new Map();

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0) {
          // Delay activation so CSS animation is visible even for above-fold elements
          const timer = setTimeout(() => {
            entry.target.classList.add('active');
            pending.delete(entry.target);
          }, 150);
          pending.set(entry.target, timer);
          observer.unobserve(entry.target);
        }
      });
    }, options);

    const observeElements = () => {
      document.querySelectorAll('.js-animate:not(.observed)').forEach((el) => {
        el.classList.add('observed');
        observer.observe(el);
      });
    };

    observeElements();

    const mutationObserver = new MutationObserver((mutations) => {
      if (mutations.some((m) => m.addedNodes.length > 0)) {
        observeElements();
      }
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
      pending.forEach((timer) => clearTimeout(timer));
      pending.clear();
    };
  }, []);

  return null;
}
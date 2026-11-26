'use client';

import { useCallback } from 'react';
import { Gallery } from 'react-photoswipe-gallery';

const DEFAULT_WIDTH = 1920;
const DEFAULT_HEIGHT = 1280;
const COMPACT_MIN_LONG_SIDE = 1600;

// In-memory cache of natural image dimensions keyed by image URL
const imageDimensionCache = new Map();

function isCompactViewport() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 900 || window.innerHeight < 560;
}

/**
 * Normalizes image dimensions for PhotoSwipe while preserving exact natural aspect ratio.
 * On compact/mobile viewports, ensures smaller images scale up cleanly to fill the screen
 * without breaking PhotoSwipe's fit-based vertical-drag-to-close and swipe gestures.
 */
function normalizeSlideDimensions(naturalWidth, naturalHeight) {
  if (!naturalWidth || !naturalHeight) {
    return { w: DEFAULT_WIDTH, h: DEFAULT_HEIGHT };
  }

  if (isCompactViewport()) {
    const longSide = Math.max(naturalWidth, naturalHeight);
    if (longSide < COMPACT_MIN_LONG_SIDE) {
      const scale = COMPACT_MIN_LONG_SIDE / longSide;
      return {
        w: Math.round(naturalWidth * scale),
        h: Math.round(naturalHeight * scale),
      };
    }
  }

  return { w: naturalWidth, h: naturalHeight };
}

/**
 * Records natural dimensions from a loaded <img> element so PhotoSwipe opens
 * with the exact aspect ratio on the very first frame.
 */
export function registerImageDimensions(url, imgElement) {
  if (!url || !imgElement) return;
  const naturalWidth = imgElement.naturalWidth;
  const naturalHeight = imgElement.naturalHeight;
  if (naturalWidth > 0 && naturalHeight > 0) {
    imageDimensionCache.set(url, { w: naturalWidth, h: naturalHeight });
  }
}

function getViewportSize() {
  if (typeof window === 'undefined') {
    return { x: 0, y: 0 };
  }

  const vv = window.visualViewport;
  if (vv && Math.abs((vv.scale || 1) - 1) < 0.01) {
    return {
      x: Math.round(vv.width),
      y: Math.round(vv.height),
    };
  }

  return {
    x: document.documentElement.clientWidth,
    y: window.innerHeight,
  };
}

function getResponsivePadding(viewportSize) {
  const isCompact = viewportSize.x < 900 || viewportSize.y < 560;
  if (isCompact) {
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }
  return { top: 64, bottom: 40, left: 24, right: 24 };
}

function applySlideDimensions(slide, naturalWidth, naturalHeight) {
  if (!slide || !naturalWidth || !naturalHeight) return;

  const { w, h } = normalizeSlideDimensions(naturalWidth, naturalHeight);
  if (
    slide.width === w &&
    slide.height === h &&
    slide.data?.w === w &&
    slide.data?.h === h
  ) {
    return;
  }

  const wasAtInitialZoom = slide.currZoomLevel <= slide.zoomLevels.initial * 1.02;

  slide.data.w = w;
  slide.data.h = h;
  slide.width = w;
  slide.height = h;
  if (slide.content) {
    slide.content.width = w;
    slide.content.height = h;
  }

  slide.calculateSize();
  if (wasAtInitialZoom) {
    slide.currentResolution = 0;
    slide.zoomAndPanToInitial();
  } else {
    slide.bounds.update(slide.currZoomLevel);
  }
  slide.applyCurrentZoomPan();
  slide.updateContentSize(true);
}

const SHARED_OPTIONS = {
  bgOpacity: 0.95,
  paddingFn: getResponsivePadding,
  getViewportSizeFn: getViewportSize,
  showHideAnimationType: 'fade',
};

/**
 * Shared PhotoSwipe Gallery wrapper configured for edge-to-edge mobile viewing,
 * intrinsic aspect-ratio preservation, and reliable orientation-change resizing.
 */
const PropertyLightbox = ({ children }) => {
  const handleBeforeOpen = useCallback((pswp) => {
    let lastIsLandscape =
      typeof window !== 'undefined' ? window.innerWidth > window.innerHeight : false;
    const timers = new Set();

    const scheduleTimer = (fn, delay) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        fn();
      }, delay);
      timers.add(id);
    };

    const syncViewportAndSlide = () => {
      if (pswp.isDestroying) return;

      const currentIsLandscape = window.innerWidth > window.innerHeight;
      const orientationFlipped = currentIsLandscape !== lastIsLandscape;
      if (orientationFlipped) {
        lastIsLandscape = currentIsLandscape;
      }

      const currSlide = pswp.currSlide;
      const wasNearInitial = Boolean(
        currSlide &&
          currSlide.currZoomLevel <= currSlide.zoomLevels.initial * 1.15
      );
      const cached = currSlide?.data?.src
        ? imageDimensionCache.get(currSlide.data.src)
        : null;

      if (currSlide && cached) {
        const { w, h } = normalizeSlideDimensions(cached.w, cached.h);
        currSlide.data.w = w;
        currSlide.data.h = h;
        currSlide.width = w;
        currSlide.height = h;
        if (currSlide.content) {
          currSlide.content.width = w;
          currSlide.content.height = h;
        }
      }

      pswp.updateSize(true);

      if (orientationFlipped && wasNearInitial && pswp.currSlide) {
        pswp.currSlide.calculateSize();
        pswp.currSlide.currentResolution = 0;
        pswp.currSlide.zoomAndPanToInitial();
        pswp.currSlide.applyCurrentZoomPan();
        pswp.currSlide.updateContentSize(true);
      }
    };

    // Inject cached real dimensions before PhotoSwipe computes slide zoom levels
    pswp.on('gettingData', ({ data }) => {
      const cached = data?.src ? imageDimensionCache.get(data.src) : null;
      if (cached) {
        const { w, h } = normalizeSlideDimensions(cached.w, cached.h);
        data.w = w;
        data.h = h;
      }
    });

    // Fallback for images not yet in cache (e.g. hidden slides beyond index 6)
    pswp.on('loadComplete', ({ slide, content, isError }) => {
      const img = content?.element;
      if (isError || !(img instanceof HTMLImageElement)) return;
      if (!img.naturalWidth || !img.naturalHeight) return;

      imageDimensionCache.set(content.data.src, {
        w: img.naturalWidth,
        h: img.naturalHeight,
      });

      const nw = img.naturalWidth;
      const nh = img.naturalHeight;

      queueMicrotask(() => {
        if (!pswp.isDestroying && slide?.holderElement) {
          applySlideDimensions(slide, nw, nh);
        }
      });
    });

    const handleOrientationOrViewportChange = () => {
      window.requestAnimationFrame(() => syncViewportAndSlide());
      scheduleTimer(() => syncViewportAndSlide(), 120);
      scheduleTimer(() => syncViewportAndSlide(), 320);
      scheduleTimer(() => syncViewportAndSlide(), 550);
    };

    const handleVisualViewportResize = () => {
      window.requestAnimationFrame(() => syncViewportAndSlide());
    };

    pswp.on('bindEvents', () => {
      window.addEventListener('orientationchange', handleOrientationOrViewportChange);
      window.screen?.orientation?.addEventListener?.(
        'change',
        handleOrientationOrViewportChange
      );
      window.visualViewport?.addEventListener(
        'resize',
        handleVisualViewportResize
      );
    });

    pswp.on('destroy', () => {
      timers.forEach((id) => window.clearTimeout(id));
      timers.clear();
      window.removeEventListener('orientationchange', handleOrientationOrViewportChange);
      window.screen?.orientation?.removeEventListener?.(
        'change',
        handleOrientationOrViewportChange
      );
      window.visualViewport?.removeEventListener(
        'resize',
        handleVisualViewportResize
      );
    });
  }, []);

  return (
    <Gallery options={SHARED_OPTIONS} onBeforeOpen={handleBeforeOpen}>
      {children}
    </Gallery>
  );
};

export default PropertyLightbox;

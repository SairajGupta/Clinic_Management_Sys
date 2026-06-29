import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for Intersection Observer-based scroll animations.
 * Elements become visible when they enter the viewport.
 */
export function useScrollReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );

    const el = ref.current;
    if (el) {
      observer.observe(el);
    }

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [threshold]);

  return { ref, isVisible };
}

/**
 * Hook to track multiple elements for staggered reveal animations.
 */
export function useStaggerReveal(count: number, threshold = 0.1) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleItems, setVisibleItems] = useState<boolean[]>(
    new Array(count).fill(false)
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const children = container.children;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Array.from(children).indexOf(entry.target as Element);
            if (index !== -1) {
              setVisibleItems((prev) => {
                const next = [...prev];
                next[index] = true;
                return next;
              });
              observer.unobserve(entry.target);
            }
          }
        });
      },
      { threshold }
    );

    Array.from(children).forEach((child) => observer.observe(child));

    return () => observer.disconnect();
  }, [count, threshold]);

  return { containerRef, visibleItems };
}

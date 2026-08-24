"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  /** Delay in ms before animation starts (stagger effect) */
  delay?: number;
  /** Animation direction */
  direction?: "up" | "down" | "left" | "right" | "none";
  /** Distance in px to travel */
  distance?: number;
  /** Duration in ms */
  duration?: number;
  /** Trigger animation only once */
  once?: boolean;
  /** Root margin for IntersectionObserver */
  rootMargin?: string;
  /** className to merge */
  className?: string;
}

export default function FadeIn({
  children,
  delay = 0,
  direction = "up",
  distance = 40,
  duration = 600,
  once = true,
  rootMargin = "0px 0px -60px 0px",
  className = "",
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Set initial state (hidden)
    const transforms: Record<string, string> = {
      up: `translateY(${distance}px)`,
      down: `translateY(-${distance}px)`,
      left: `translateX(${distance}px)`,
      right: `translateX(-${distance}px)`,
      none: "none",
    };

    el.style.opacity = "0";
    el.style.transform = transforms[direction];
    el.style.transition = `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`;
    el.style.willChange = "opacity, transform";

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "none";
          if (once) observer.unobserve(el);
        } else if (!once) {
          el.style.opacity = "0";
          el.style.transform = transforms[direction];
        }
      },
      { rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, direction, distance, duration, once, rootMargin]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

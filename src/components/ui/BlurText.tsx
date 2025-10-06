"use client";

import { useEffect, useMemo, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface BlurTextProps {
  text?: string;
  delay?: number;
  className?: string;
  animateBy?: 'words' | 'letters';
  direction?: 'top' | 'bottom';
  threshold?: number;
  rootMargin?: string;
  animationFrom?: Record<string, unknown>;
  animationTo?: Record<string, unknown>[];
  easing?: string;
  onAnimationComplete?: () => void;
}

const easingPresets: Record<string, number[] | string> = {
  easeOutCubic: [0.33, 1, 0.68, 1],
  easeInCubic: [0.55, 0.055, 0.675, 0.19],
  easeInOutCubic: [0.65, 0, 0.35, 1],
  easeInOut: 'easeInOut',
  easeIn: 'easeIn',
  easeOut: 'easeOut',
  linear: 'linear',
};

const DEFAULT_DURATION = 0.6;

const BlurText = ({
  text = '',
  delay = 200,
  className = '',
  animateBy = 'words',
  direction = 'top',
  threshold = 0.1,
  rootMargin = '0px',
  animationFrom,
  animationTo,
  easing = 'easeOutCubic',
  onAnimationComplete,
}: BlurTextProps) => {
  const elements = useMemo(() => (animateBy === 'words' ? text.split(' ') : text.split('')), [animateBy, text]);
  const containerRef = useRef<HTMLParagraphElement>(null);
  const hasCompletedRef = useRef(false);
  const completedCountRef = useRef(0);
  const isInView = useInView(containerRef, { amount: threshold, margin: rootMargin, once: true });

  const defaultFrom = useMemo(
    () =>
      direction === 'top'
        ? { filter: 'blur(10px)', opacity: 0, transform: 'translate3d(0,-50px,0)' }
        : { filter: 'blur(10px)', opacity: 0, transform: 'translate3d(0,50px,0)' },
    [direction],
  );

  const defaultTo = useMemo(
    () => [
      {
        filter: 'blur(5px)',
        opacity: 0.5,
        transform: direction === 'top' ? 'translate3d(0,5px,0)' : 'translate3d(0,-5px,0)',
      },
      { filter: 'blur(0px)', opacity: 1, transform: 'translate3d(0,0,0)' },
    ],
    [direction],
  );

  const fromState = useMemo(() => animationFrom ?? defaultFrom, [animationFrom, defaultFrom]);
  const animationFrames = useMemo(() => [fromState, ...(animationTo ?? defaultTo)], [animationTo, defaultTo, fromState]);

  const keyframes = useMemo(() => {
    const keys = new Set<string>();
    animationFrames.forEach((frame) => {
      Object.keys(frame).forEach((key) => keys.add(key));
    });

    const resolved: Record<string, unknown[]> = {};

    keys.forEach((key) => {
      let lastValue: unknown = (animationFrames[0] as Record<string, unknown>)[key];
      resolved[key] = animationFrames.map((frame) => {
        const value = (frame as Record<string, unknown>)[key];
        if (typeof value !== 'undefined') {
          lastValue = value;
          return value;
        }
        return lastValue ?? null;
      });
    });

    return resolved;
  }, [animationFrames]);

  useEffect(() => {
    completedCountRef.current = 0;
    hasCompletedRef.current = false;
  }, [elements.length, text, animateBy]);

  const resolvedEase = easingPresets[easing] ?? easingPresets.easeOutCubic;
  const elementDelay = delay / 1000;
  const duration = Math.max(DEFAULT_DURATION, (animationFrames.length - 1) * 0.25);

  const handleAnimationComplete = () => {
    if (!isInView || hasCompletedRef.current) {
      return;
    }

    completedCountRef.current += 1;

    if (completedCountRef.current >= elements.length) {
      hasCompletedRef.current = true;
      onAnimationComplete?.();
    }
  };

  return (
    <p ref={containerRef} className={`blur-text ${className}`}>
      {elements.map((element, index) => (
        <motion.span
          key={`${element}-${index}`}
          initial={fromState}
          animate={isInView ? keyframes : fromState}
          transition={{
            delay: index * elementDelay,
            duration,
            ease: resolvedEase as never,
          }}
          style={{ display: 'inline-block', willChange: 'transform, filter, opacity' }}
          onAnimationComplete={handleAnimationComplete}
        >
          {element === ' ' ? '\u00A0' : element}
          {animateBy === 'words' && index < elements.length - 1 ? '\u00A0' : null}
        </motion.span>
      ))}
    </p>
  );
};

export default BlurText;

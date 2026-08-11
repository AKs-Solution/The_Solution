"use client";

import { forwardRef, useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from "react";
import { motion, useInView, type Variants } from "motion/react";
import { cn } from "@/shared/utils";

type MotionDivProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onAnimationIteration"
>;

export interface FadeInProps extends MotionDivProps {
  delay?: number;
  y?: number;
  once?: boolean;
}

export const FadeIn = forwardRef<HTMLDivElement, FadeInProps>(
  ({ className = "", delay = 0, y = 12, once = true, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.28, delay, ease: [0.22, 1, 0.36, 1] }}
        className={cn("will-change-transform", className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  },
);

FadeIn.displayName = "FadeIn";

export const SlideIn = forwardRef<HTMLDivElement, FadeInProps>(
  ({ className = "", delay = 0, y = 0, once = true, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, x: y || 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 24 }}
        transition={{ duration: 0.3, delay, ease: [0.22, 1, 0.36, 1] }}
        className={cn("will-change-transform", className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  },
);

SlideIn.displayName = "SlideIn";

const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
};

export interface StaggerProps extends MotionDivProps {
  children: ReactNode;
}

export const Stagger = forwardRef<HTMLDivElement, StaggerProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  },
);

Stagger.displayName = "Stagger";

export const StaggerItem = forwardRef<HTMLDivElement, MotionDivProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <motion.div ref={ref} variants={staggerItem} className={className} {...props}>
        {children}
      </motion.div>
    );
  },
);

StaggerItem.displayName = "StaggerItem";

export interface RevealProps extends MotionDivProps {
  children: ReactNode;
  delay?: number;
}

/** Fades content in when scrolled into view. */
export const Reveal = forwardRef<HTMLDivElement, RevealProps>(
  ({ className = "", children, delay = 0, ...props }, ref) => {
    const innerRef = useRef<HTMLDivElement>(null);
    const inView = useInView(innerRef, { once: true, margin: "-48px" });
    return (
      <motion.div
        ref={(node) => {
          innerRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
        className={cn("will-change-transform", className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  },
);

Reveal.displayName = "Reveal";

export interface AnimatedNumberProps {
  value: number;
  duration?: number;
  className?: string;
  format?: (value: number) => string;
}

export const AnimatedNumber = forwardRef<HTMLSpanElement, AnimatedNumberProps>(
  ({ value, duration = 0.6, className, format = (v) => v.toLocaleString() }, ref) => {
    const [display, setDisplay] = useState(value);
    const prev = useRef(value);

    useEffect(() => {
      const from = prev.current;
      const to = value;
      if (from === to) {
        setDisplay(to);
        return;
      }
      const start = performance.now();
      let raf = 0;
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / (duration * 1000));
        const eased = 1 - Math.pow(1 - t, 3);
        setDisplay(from + (to - from) * eased);
        if (t < 1) raf = requestAnimationFrame(tick);
        else prev.current = to;
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, [value, duration]);

    return (
      <span ref={ref} className={className}>
        {format(Math.round(display))}
      </span>
    );
  },
);

AnimatedNumber.displayName = "AnimatedNumber";

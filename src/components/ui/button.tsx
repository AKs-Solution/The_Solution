"use client";

import { type AnchorHTMLAttributes, type ButtonHTMLAttributes, forwardRef, type Ref } from "react";
import { cn } from "@/shared/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  /**
   * Render the button as an anchor element. When provided, `href` will be applied.
   * We keep this API minimal so callers that used <Link><Button/></Link> can be
   * migrated to <Button as="a" href="/path"> without adding new files.
   */
  as?: "button" | "a";
  href?: string;
  target?: string;
  rel?: string;
}

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-zinc-900 text-zinc-50 hover:bg-zinc-800 border border-zinc-900 active:scale-[0.98]",
  secondary:
    "border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-100 shadow-xs active:scale-[0.98]",
  ghost: "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 active:scale-[0.98]",
  destructive:
    "bg-rose-600 text-white hover:bg-rose-500 border border-rose-600 active:scale-[0.98]",
};

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-8 px-3 text-xs tracking-tight rounded-md",
  md: "h-9.5 px-4 text-sm font-medium rounded-lg",
  lg: "h-11 px-5 text-base font-medium rounded-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      as = "button",
      href,
      target,
      rel,
      type,
      ...props
    },
    ref,
  ) => {
    const classes = cn(
      "focus-visible:ring-ring inline-flex cursor-pointer items-center justify-center font-medium transition-all duration-150 select-none focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none",
      variantStyles[variant],
      sizeStyles[size],
      className,
    );

    const isAnchor = as === "a" || typeof href === "string";

    if (isAnchor) {
      return (
        <a
          ref={ref as unknown as Ref<HTMLAnchorElement>}
          className={classes}
          href={href}
          target={target}
          rel={rel}
          {...(props as unknown as AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {props.children}
        </a>
      );
    }

    return <button ref={ref} type={type ?? "button"} className={classes} {...props} />;
  },
);

Button.displayName = "Button";

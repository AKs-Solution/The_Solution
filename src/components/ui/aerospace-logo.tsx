import type { SVGProps } from "react";
import { cn } from "@/shared/utils";

export function AerospaceLogo({
  className = "size-5",
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      {...props}
    >
      {/* Outer supersonic delta contour */}
      <path
        d="M12 2.5L3.5 19.5L12 16L20.5 19.5L12 2.5Z"
        fill="currentColor"
        fillOpacity="0.15"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Center propulsion keel line */}
      <path
        d="M12 2.5V16"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      {/* Vector stabilizer winglets */}
      <path
        d="M8.5 13L12 11.5L15.5 13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Trajectory focal dot */}
      <circle cx="12" cy="8.5" r="1.25" fill="currentColor" />
    </svg>
  );
}

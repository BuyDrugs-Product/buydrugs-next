// Utility helpers for shadcn-style components.
// We keep this separate from `lib/cn` to avoid changing existing components.

import type { ClassValue } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}



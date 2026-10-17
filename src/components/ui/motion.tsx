"use client";

import { createContext, useContext } from "react";

/**
 * Turns on the motion system for a subtree. Shared components add their
 * motion classes only when this is true, so a page opts in as a whole.
 */
export const MotionContext = createContext(false);

export function useMotion() {
  return useContext(MotionContext);
}

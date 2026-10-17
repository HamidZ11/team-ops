/**
 * Motion tokens for spring-driven movement (Motion for React). The CSS
 * counterparts (durations, ease) live in globals.css. Overshoot is kept small:
 * enough to feel physical, never enough to read as bounce.
 */
export const ease = [0.23, 1, 0.32, 1] as const;

/*
 * Springs are tuned by visualDuration (how long the motion looks) rather than
 * physics constants, so they read as quick and settle without a long tail.
 */
/** Panels moving into place (request page push). */
export const panelSpring = { type: "spring", visualDuration: 0.24, bounce: 0.08 } as const;
/** Selection indicators sliding between items. */
export const indicatorSpring = { type: "spring", visualDuration: 0.2, bounce: 0.12 } as const;
/** Size changes that push other content: no overshoot. */
export const layoutSpring = { type: "spring", visualDuration: 0.24, bounce: 0 } as const;
/** A small mark settling into place (progress step, completion check). */
export const popSpring = { type: "spring", visualDuration: 0.28, bounce: 0.3 } as const;
/** Opacity for anything entering; short so content is readable almost at once. */
export const fadeIn = { duration: 0.16, ease } as const;
/** Used when input outpaces motion (rapid keyboard navigation). */
export const instant = { duration: 0 } as const;

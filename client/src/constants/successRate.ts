
export const SUCCESS_RATE_THRESHOLDS = { green: 0.75, yellow: 0.50 } as const;

export type SuccessColour = 'green' | 'yellow' | 'red';

export function rateToColour(ratePct: number): SuccessColour {
  if (ratePct >= SUCCESS_RATE_THRESHOLDS.green) return 'green';
  if (ratePct >= SUCCESS_RATE_THRESHOLDS.yellow) return 'yellow';
  return 'red';
}

/** Tailwind-class resolver.
 *  type = 'text' | 'ring' | 'bg'   (default 'text')
 */
export function colourClass(
  colour: SuccessColour,
  type: 'text' | 'ring' | 'bg' = 'text',
): string {
  const map = {
    green: {
      text: 'text-emerald-600 dark:text-emerald-400',
      ring: 'ring-emerald-500',
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    },
    yellow: {
      text: 'text-amber-600 dark:text-amber-400',
      ring: 'ring-amber-500',
      bg: 'bg-amber-100 dark:bg-amber-900/30',
    },
    red: {
      text: 'text-red-600 dark:text-red-400',
      ring: 'ring-red-500',
      bg: 'bg-red-100 dark:bg-red-900/30',
    },
  } as const;
  return map[colour][type];
}

export function labelForColour(colour: SuccessColour): string {
  switch (colour) {
    case 'green':
      return 'On track';
    case 'yellow':
      return 'Needs focus';
    case 'red':
      return 'Stuck';
  }
}


export const SUCCESS_RATE_THRESHOLDS = {
  green: 75,
  yellow: 50
} as const;

export type SuccessColour = 'green' | 'yellow' | 'red';

export function rateToColour(ratePct: number): SuccessColour {
  if (ratePct >= SUCCESS_RATE_THRESHOLDS.green) return 'green';
  if (ratePct >= SUCCESS_RATE_THRESHOLDS.yellow) return 'yellow';
  return 'red';
}

export function colourClass(colour: SuccessColour, type: 'text' | 'ring' | 'bg' = 'text'): string {
  const colorMap = {
    green: {
      text: 'text-emerald-600 dark:text-emerald-400',
      ring: 'ring-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20'
    },
    yellow: {
      text: 'text-yellow-600 dark:text-yellow-400',
      ring: 'ring-yellow-500',
      bg: 'bg-yellow-50 dark:bg-yellow-900/20'
    },
    red: {
      text: 'text-red-600 dark:text-red-400',
      ring: 'ring-red-500',
      bg: 'bg-red-50 dark:bg-red-900/20'
    }
  };
  
  return colorMap[colour][type];
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

export const SUCCESS_RATE_LEGEND = 'Green ≥ 75%, Yellow 50-74%, Red < 50%';

import React from 'react';
import { differenceInDays, format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface HorizonChipProps {
  targetDate?: Date;
  className?: string;
}

export function HorizonChip({ targetDate, className }: HorizonChipProps) {
  if (!targetDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const durationDays = differenceInDays(targetDate, today);

  let horizon: string;
  let colorClass: string;

  if (durationDays <= 90) {
    horizon = 'Short-term';
    colorClass = 'bg-coral/10 text-coral dark:bg-coral/20 dark:text-coral-light';
  } else if (durationDays <= 365) {
    horizon = 'Mid-term';
    colorClass = 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
  } else {
    horizon = 'Long-term';
    colorClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
  }

  const formattedDate = format(targetDate, 'd MMM yyyy');

  return (
    <Badge variant="secondary" className={`${colorClass} ${className || ''}`}>
      {horizon} › {formattedDate}
    </Badge>
  );
}
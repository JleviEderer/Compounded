
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
    colorClass = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  } else if (durationDays <= 365) {
    horizon = 'Mid-term';
    colorClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  } else {
    horizon = 'Long-term';
    colorClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  }

  const formattedDate = format(targetDate, 'd MMM yyyy');

  return (
    <Badge variant="secondary" className={`${colorClass} ${className || ''}`}>
      {horizon} › {formattedDate}
    </Badge>
  );
}

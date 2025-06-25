
import { motion } from 'framer-motion';
import { useState, useRef, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { HabitWeight } from '@/types';

interface WeightSliderProps {
  value: number; // Index (0-4)
  onChange: (index: number) => void;
}

const WEIGHTS = [
  { weight: HabitWeight.MICRO, label: 'Micro', percentage: '0.010%' },
  { weight: HabitWeight.SMALL, label: 'Small', percentage: '0.020%' },
  { weight: HabitWeight.MEDIUM, label: 'Medium', percentage: '0.030%' },
  { weight: HabitWeight.LARGE, label: 'Large', percentage: '0.050%' },
  { weight: HabitWeight.KEYSTONE, label: 'Keystone', percentage: '0.100%' }
];

export default function WeightSlider({ value, onChange }: WeightSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const sliderRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  }, [onChange]);

  const handleTouchStart = useCallback(() => {
    setIsDragging(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    document.body.style.overflow = '';
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        e.preventDefault();
        onChange(Math.max(0, value - 1));
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        e.preventDefault();
        onChange(Math.min(4, value + 1));
        break;
      case 'Home':
        e.preventDefault();
        onChange(0);
        break;
      case 'End':
        e.preventDefault();
        onChange(4);
        break;
    }
  }, [value, onChange]);

  return (
    <div className="w-full space-y-4">
      <div className="relative py-4 w-full px-0 sm:px-4">
        <input
          ref={sliderRef}
          type="range"
          min={0}
          max={4}
          step={1}
          value={value}
          onChange={handleChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer touch-manipulation slider-thumb focus:outline-none focus:ring-2 focus:ring-coral focus:ring-offset-2 dark:focus:ring-offset-gray-800 relative before:absolute before:-inset-3 before:sm:inset-0"
          style={{
            background: `linear-gradient(to right, #FF6B7D 0%, #FF6B7D ${(value / 4) * 100}%, #e5e7eb ${(value / 4) * 100}%, #e5e7eb 100%)`
          }}
          aria-label={`Weight slider: ${WEIGHTS[value].label}`}
          aria-valuemin={0}
          aria-valuemax={4}
          aria-valuenow={value}
          aria-valuetext={WEIGHTS[value].label}
        />

        {/* Custom thumb indicator with larger touch target */}
        <motion.div
          className="absolute top-1/2 w-10 h-10 bg-coral rounded-full shadow-lg pointer-events-none border-3 border-white dark:border-gray-800 before:absolute before:-inset-3 before:sm:inset-0 before:rounded-full"
          style={{
            left: `calc(${(value / 4) * 100}% - 20px)`,
            transform: 'translateY(-50%)',
          }}
          animate={{
            scale: isDragging ? 1.4 : isFocused ? 1.1 : 1,
            boxShadow: isDragging 
              ? '0 12px 30px rgba(255, 107, 125, 0.4)' 
              : isFocused 
                ? '0 8px 20px rgba(255, 107, 125, 0.25)' 
                : '0 4px 15px rgba(0, 0, 0, 0.1)',
          }}
          transition={{ 
            type: 'spring', 
            stiffness: isMobile ? 400 : 300,
            damping: isMobile ? 25 : 20
          }}
        >
          <motion.div
            className="absolute inset-2 bg-white dark:bg-gray-100 rounded-full opacity-30"
            animate={{
              scale: isDragging ? 0.8 : 1,
              opacity: isDragging ? 0.6 : 0.3,
            }}
            transition={{ duration: 0.2 }}
          />
        </motion.div>
      </div>

      {/* Clickable labels */}
      <div className="flex justify-between items-center w-full">
        {WEIGHTS.map((weight, index) => (
          <motion.button
            key={index}
            onClick={() => onChange(index)}
            className={`text-xs px-2 py-2 rounded-lg min-h-[44px] min-w-[44px] touch-manipulation transition-all duration-200 flex flex-col items-center justify-center ${
              value === index 
                ? 'font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
            whileHover={{ scale: isMobile ? 1 : 1.05 }}
            whileTap={{ 
              scale: 0.92,
              transition: { duration: 0.1 }
            }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <span className="font-medium">{weight.label}</span>
            {value === index && (
              <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                {weight.percentage}
              </span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

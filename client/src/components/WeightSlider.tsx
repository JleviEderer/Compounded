import { motion } from 'framer-motion';
import { useState, useRef, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { HabitWeight, WEIGHT_VALUES, WEIGHT_LABELS } from '@/types';

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

  const currentWeight = WEIGHTS[value];

  return (
    <div className="w-full space-y-3">
      <div className="relative py-4 px-2">
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
          className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer touch-manipulation slider-thumb focus:outline-none focus:ring-2 focus:ring-coral focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          style={{
            background: `linear-gradient(to right, #FF6B7D 0%, #FF6B7D ${(value / 4) * 100}%, #e5e7eb ${(value / 4) * 100}%, #e5e7eb 100%)`
          }}
          aria-label={`Weight slider: ${currentWeight.label}`}
          aria-valuemin={0}
          aria-valuemax={4}
          aria-valuenow={value}
          aria-valuetext={currentWeight.label}
        />

        {/* Custom thumb indicator */}
        <motion.div
          className="absolute top-1/2 w-8 h-8 bg-coral rounded-full shadow-lg pointer-events-none border-2 border-white dark:border-gray-800"
          style={{
            left: `calc(${(value / 4) * 100}% - 16px)`,
            transform: 'translateY(-50%)',
          }}
          animate={{
            scale: isDragging ? 1.3 : isFocused ? 1.1 : 1,
            boxShadow: isDragging 
              ? '0 8px 25px rgba(255, 107, 125, 0.4)' 
              : isFocused 
                ? '0 6px 20px rgba(255, 107, 125, 0.25)' 
                : '0 2px 10px rgba(0, 0, 0, 0.1)',
          }}
          transition={{ 
            type: 'spring', 
            stiffness: isMobile ? 400 : 300,
            damping: isMobile ? 25 : 20
          }}
        />

        {/* Value display tooltip */}
        <motion.div
          className="absolute -top-14 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-lg text-sm font-medium pointer-events-none shadow-lg z-10"
          style={{
            left: `calc(${(value / 4) * 100}% - 0px)`,
            transform: 'translateX(-50%)',
          }}
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{
            opacity: (isDragging || isFocused) ? 1 : 0,
            scale: (isDragging || isFocused) ? 1 : 0.8,
            y: (isDragging || isFocused) ? 0 : 10,
          }}
          transition={{ duration: 0.2 }}
        >
          <div className="text-center">
            <div className="font-semibold">{currentWeight.label}</div>
            <div className="text-xs opacity-90">{currentWeight.percentage}</div>
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-100" />
        </motion.div>
      </div>

      {/* Clickable labels */}
      <div className="flex justify-between items-center gap-0.5 px-2">
        {WEIGHTS.map((weight, index) => (
          <motion.button
            key={index}
            onClick={() => onChange(index)}
            className={`text-xs px-1.5 py-2.5 rounded-lg min-h-[44px] flex-1 touch-manipulation transition-all duration-200 flex items-center justify-center font-medium ${
              value === index 
                ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 shadow-sm' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
            whileHover={{ scale: isMobile ? 1 : 1.02 }}
            whileTap={{ 
              scale: 0.95,
              transition: { duration: 0.1 }
            }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            {weight.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
import { motion } from 'framer-motion';
import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { HabitWeight, WEIGHT_VALUES, WEIGHT_LABELS } from '@/types';

interface WeightSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  isHabitWeight?: boolean;
}

export default function WeightSlider({ 
  value, 
  onChange, 
  min = 0, 
  max = 100,
  isHabitWeight = false
}: WeightSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const sliderRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  }, [onChange]);

  const handleTouchStart = useCallback(() => {
    setIsDragging(true);
    // Prevent scrolling while dragging on mobile
    document.body.style.overflow = 'hidden';
  }, []);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    document.body.style.overflow = '';
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const step = isMobile ? 5 : 1; // Larger steps on mobile for easier control
    
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        e.preventDefault();
        onChange(Math.max(min, value - step));
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        e.preventDefault();
        onChange(Math.min(max, value + step));
        break;
      case 'Home':
        e.preventDefault();
        onChange(min);
        break;
      case 'End':
        e.preventDefault();
        onChange(max);
        break;
    }
  }, [value, onChange, min, max, isMobile]);

  return (
    <div className="w-full space-y-4">
      <div className="relative py-4"> {/* Increased padding for mobile */}
        <input
          ref={sliderRef}
          type="range"
          min={min}
          max={max}
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
            background: `linear-gradient(to right, #FF6B7D 0%, #FF6B7D ${((value - min) / (max - min)) * 100}%, #e5e7eb ${((value - min) / (max - min)) * 100}%, #e5e7eb 100%)`
          }}
          aria-label={isHabitWeight ? `Weight slider: ${value}` : `Weight slider: ${value}%`}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={isHabitWeight ? `${value}` : `${value} percent`}
        />

        {/* Custom thumb indicator - enhanced for mobile with haptic-like feedback */}
        <motion.div
          className="absolute top-1/2 w-10 h-10 bg-coral rounded-full shadow-lg pointer-events-none border-3 border-white dark:border-gray-800"
          style={{
            left: `calc(${((value - min) / (max - min)) * 100}% - 20px)`,
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
          {/* Inner circle for visual feedback */}
          <motion.div
            className="absolute inset-2 bg-white dark:bg-gray-100 rounded-full opacity-30"
            animate={{
              scale: isDragging ? 0.8 : 1,
              opacity: isDragging ? 0.6 : 0.3,
            }}
            transition={{ duration: 0.2 }}
          />
        </motion.div>

        {/* Value display tooltip - shows weight value on mobile during interaction */}
        <motion.div
          className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-1 rounded-lg text-sm font-medium pointer-events-none"
          style={{
            left: `calc(${((value - min) / (max - min)) * 100}% - 0px)`,
            transform: 'translateX(-50%)',
          }}
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{
            opacity: (isDragging || isFocused) && isMobile && isHabitWeight ? 1 : 0,
            scale: (isDragging || isFocused) && isMobile && isHabitWeight ? 1 : 0.8,
            y: (isDragging || isFocused) && isMobile && isHabitWeight ? 0 : 10,
          }}
          transition={{ duration: 0.2 }}
        >
          {isHabitWeight ? `${value}` : `${value}%`}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-100" />
        </motion.div>
      </div>

      {/* Quick preset buttons - enhanced for mobile with haptic-style feedback */}
      <div className="flex gap-2 justify-center flex-wrap">
        {isHabitWeight ? (
          WEIGHT_VALUES.map((weightValue) => {
            const label = WEIGHT_LABELS[weightValue].split(' ')[0]; // Get just "Micro", "Small", etc.
            return (
              <motion.div key={weightValue}>
                <Button
                  variant={value === weightValue ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onChange(weightValue)}
                  className={`text-xs min-h-[44px] min-w-[60px] touch-manipulation transition-all duration-200 ${
                    value === weightValue 
                      ? 'bg-coral text-white shadow-lg' 
                      : 'hover:bg-coral/10 hover:border-coral/50'
                  }`}
                  asChild
                >
                  <motion.button
                    whileHover={{ scale: isMobile ? 1 : 1.05 }}
                    whileTap={{ 
                      scale: 0.92,
                      transition: { duration: 0.1 }
                    }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    {label}
                  </motion.button>
                </Button>
              </motion.div>
            );
          })
        ) : (
          [0, 25, 50, 75, 100].map((preset) => (
            <motion.div key={preset}>
              <Button
                variant={value === preset ? 'default' : 'outline'}
                size="sm"
                onClick={() => onChange(preset)}
                className={`text-xs min-h-[44px] min-w-[44px] touch-manipulation transition-all duration-200 ${
                  value === preset 
                    ? 'bg-coral text-white shadow-lg' 
                    : 'hover:bg-coral/10 hover:border-coral/50'
                }`}
                asChild
              >
                <motion.button
                  whileHover={{ scale: isMobile ? 1 : 1.05 }}
                  whileTap={{ 
                    scale: 0.92,
                    transition: { duration: 0.1 }
                  }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  {preset}%
                </motion.button>
              </Button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

      
    </div>
  );
}
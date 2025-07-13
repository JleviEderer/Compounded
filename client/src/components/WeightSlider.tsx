import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useCallback, useEffect } from 'react';
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
  const [showPeek, setShowPeek] = useState(false);
  const [peekPosition, setPeekPosition] = useState(0);
  const sliderRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const animationFrameRef = useRef<number>();

  const updatePeekPosition = useCallback((currentValue: number) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      const position = (currentValue / 4) * 100;
      setPeekPosition(position);
    });
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    onChange(newValue);
    if (showPeek) {
      updatePeekPosition(newValue);
    }
  }, [onChange, showPeek, updatePeekPosition]);

  const handlePointerDown = useCallback(() => {
    setIsDragging(true);
    setShowPeek(true);
    updatePeekPosition(value);
    document.body.style.overflow = 'hidden';
  }, [value, updatePeekPosition]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    setShowPeek(false);
    document.body.style.overflow = '';
  }, []);

  const handleTouchStart = useCallback(() => {
    handlePointerDown();
  }, [handlePointerDown]);

  const handleTouchEnd = useCallback(() => {
    handlePointerUp();
  }, [handlePointerUp]);

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

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Safely access currentWeight with fallback
  const currentWeight = WEIGHTS[value] || { label: 'Unknown', percentage: '0.000%' };

  return (
    <div className="space-y-3">
      {/* Progress indicator */}
      <div className="relative w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(value / 4) * 100}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      </div>

      {/* Hidden native slider for accessibility */}
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
        onTouchStart={() => {
          setIsDragging(true);
          setShowPeek(true);
          updatePeekPosition(value);
        }}
        onTouchEnd={() => {
          setIsDragging(false);
          setShowPeek(false);
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={(e) => {
          const step = e.shiftKey ? 2 : 1;
          if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
            e.preventDefault();
            onChange(Math.max(0, value - step));
          } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
            e.preventDefault();
            onChange(Math.min(4, value + step));
          }
        }}
        className="sr-only"
        aria-label="Habit weight selector"
        aria-valuetext={`${WEIGHTS[value].label} impact: ${WEIGHTS[value].percentage}`}
      />

      {/* Peek tooltip for mobile */}
      <AnimatePresence>
        {showPeek && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-0 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg z-10"
            style={{
              left: `${peekPosition}%`,
              transform: 'translateX(-50%)',
              marginTop: '-3rem'
            }}
          >
            <div className="text-center">
              <div>{WEIGHTS[value].label}</div>
              <div className="text-xs text-gray-300">{WEIGHTS[value].percentage}</div>
            </div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compact current selection display */}
      <div className="text-center py-1">
        <div className="text-base font-medium text-gray-900 dark:text-white">
          {WEIGHTS[value].label}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          +{WEIGHTS[value].percentage} impact
        </div>
      </div>

      {/* Clickable labels */}
      <div className="flex justify-between items-center gap-0.5">
        {WEIGHTS.map((weight, index) => (
          <motion.button
            key={index}
            onClick={() => onChange(index)}
            className={`text-xs px-1.5 py-2 rounded-lg min-h-[40px] flex-1 touch-manipulation transition-all duration-200 flex items-center justify-center font-medium ${
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
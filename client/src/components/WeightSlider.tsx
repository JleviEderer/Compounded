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
  const [showPill, setShowPill] = useState(false);
  const [pillPosition, setPillPosition] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const sliderRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const animationFrameRef = useRef<number>();

  const updatePillPosition = useCallback((currentValue: number) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      const position = (currentValue / 4) * 100;
      setPillPosition(position);
    });
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    onChange(newValue);
    if (showPill) {
      updatePillPosition(newValue);
    }
  }, [onChange, showPill, updatePillPosition]);

  const handlePointerDown = useCallback(() => {
    setIsDragging(true);
    setShowPill(true);
    updatePillPosition(value);
    document.body.style.overflow = 'hidden';
  }, [value, updatePillPosition]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    setIsTransitioning(true);
    document.body.style.overflow = '';
    
    // Fade out pill then hide it
    setTimeout(() => {
      setShowPill(false);
      setIsTransitioning(false);
    }, 150);
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
          onMouseDown={handlePointerDown}
          onMouseUp={handlePointerUp}
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

        {/* Live percentage pill */}
        <AnimatePresence>
          {showPill && (
            <motion.div
              className="absolute pointer-events-none rounded-full bg-zinc-900/90 text-xs px-2 py-0.5 shadow-sm flex items-center justify-center text-white font-medium"
              style={{
                left: `calc(${pillPosition}% - 24px)`,
                top: '-36px',
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ 
                opacity: isTransitioning ? 0 : 1, 
                scale: isTransitioning ? 0.9 : 1 
              }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              aria-live="polite"
            >
              <span 
                className={`${
                  value <= 1 ? 'text-red-400' : 
                  value === 2 ? 'text-yellow-400' : 
                  'text-green-400'
                }`}
              >
                {currentWeight.percentage}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        
      </div>

      {/* Clickable labels */}
      <div 
        className={`flex justify-between items-center gap-0.5 px-2 transition-opacity duration-200 ${
          showPill ? 'opacity-30' : 'opacity-100'
        }`}
      >
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
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface WeightSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export default function WeightSlider({ 
  value, 
  onChange, 
  min = 0, 
  max = 100 
}: WeightSliderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  return (
    <div className="w-full space-y-4">
      <div className="relative py-2">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={handleChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer touch-manipulation slider-thumb"
          style={{
            background: `linear-gradient(to right, #FF6B7D 0%, #FF6B7D ${((value - min) / (max - min)) * 100}%, #e5e7eb ${((value - min) / (max - min)) * 100}%, #e5e7eb 100%)`
          }}
        />

        {/* Custom thumb indicator - larger for mobile */}
        <motion.div
          className="absolute top-1/2 w-8 h-8 bg-coral rounded-full shadow-lg pointer-events-none border-2 border-white dark:border-gray-800"
          style={{
            left: `calc(${((value - min) / (max - min)) * 100}% - 16px)`,
            transform: 'translateY(-50%)',
          }}
          animate={{
            scale: isDragging ? 1.3 : 1,
            boxShadow: isDragging ? '0 8px 25px rgba(255, 107, 125, 0.3)' : '0 4px 15px rgba(0, 0, 0, 0.1)',
          }}
          transition={{ type: 'spring', stiffness: 300 }}
        />
      </div>

      {/* Quick preset buttons - enlarged for mobile */}
      <div className="flex gap-2 justify-center flex-wrap">
        {[0, 25, 50, 75, 100].map((preset) => (
          <Button
            key={preset}
            variant={value === preset ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange(preset)}
            className="text-xs min-h-[44px] min-w-[44px] touch-manipulation"
          >
            {preset}%
          </Button>
        ))}
      </div>
    </div>
  );
}
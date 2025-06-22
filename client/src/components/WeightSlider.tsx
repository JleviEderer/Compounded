import { motion } from 'framer-motion';
import { HabitWeight, WEIGHT_LABELS, WEIGHT_VALUES } from '../types';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface WeightSliderProps {
  value: HabitWeight;
  onChange: (weight: HabitWeight) => void;
  label?: string;
}

export default function WeightSlider({ 
  value, 
  onChange, 
  label = "Impact Weight" 
}: WeightSliderProps) {
  const currentIndex = WEIGHT_VALUES.indexOf(value);
  
  const handleChange = (values: number[]) => {
    const index = values[0];
    onChange(WEIGHT_VALUES[index]);
  };

  return (
    <motion.div 
      className="space-y-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </Label>
      
      <div className="space-y-4">
        <Slider
          value={[currentIndex]}
          onValueChange={handleChange}
          max={4}
          step={1}
          className="w-full"
        />
        
        <div className="flex justify-between text-xs text-gray-500">
          {WEIGHT_VALUES.map((weight, index) => (
            <motion.span 
              key={weight}
              className={`${
                index === currentIndex ? 'font-medium text-coral' : ''
              }`}
              animate={{ 
                scale: index === currentIndex ? 1.05 : 1,
                color: index === currentIndex ? 'var(--coral)' : undefined
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {WEIGHT_LABELS[weight].split(' (+')[0]}
            </motion.span>
          ))}
        </div>
        
        <motion.div 
          className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl"
          key={value}
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="text-lg font-bold text-coral">
            {WEIGHT_LABELS[value]}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Daily compound rate
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

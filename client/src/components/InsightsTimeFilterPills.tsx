
import React from 'react';
import { motion } from 'framer-motion';

type InsightsViewMode = 'week' | 'month' | 'quarter' | 'all-time';

interface InsightsTimeFilterPillsProps {
  activeView: InsightsViewMode;
  setActiveView: (view: InsightsViewMode) => void;
}

export const InsightsTimeFilterPills: React.FC<InsightsTimeFilterPillsProps> = ({
  activeView,
  setActiveView
}) => {
  return (
    <div className="flex gap-2 mb-6">
      {(['week', 'month', 'quarter', 'all-time'] as InsightsViewMode[]).map((view) => (
        <motion.button
          key={view}
          onClick={() => setActiveView(view)}
          className={`relative flex px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeView === view
              ? 'text-white dark:text-white'
              : 'text-teal-700 dark:text-teal-300 hover:text-teal-600 dark:hover:text-teal-200'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {activeView === view && (
            <motion.div
              layoutId="insightsRange"
              className="absolute inset-0 bg-teal-600 dark:bg-teal-400 rounded-full"
              initial={false}
              transition={{
                type: "spring",
                stiffness: 350,
                damping: 30
              }}
            />
          )}
          <span className="relative z-10 capitalize">{view.replace('-', ' ')}</span>
        </motion.button>
      ))}
    </div>
  );
};

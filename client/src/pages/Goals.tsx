
import React from 'react';
import { motion } from 'framer-motion';
import { Target, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FEATURE_FLAGS } from '../utils/featureFlags';

// Empty state component to keep main Goals component under 250 LoC
const EmptyState = ({ onAddGoal }: { onAddGoal: () => void }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
    <div className="w-24 h-24 bg-gradient-to-r from-coral to-pink-400 rounded-full flex items-center justify-center mb-6">
      <Target className="w-12 h-12 text-white" />
    </div>
    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
      Create your first goal
    </h2>
    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
      Set meaningful goals and connect your habits to track your progress towards what matters most.
    </p>
    <Button
      onClick={onAddGoal}
      className="bg-coral hover:bg-coral/90 text-white px-6 py-3 text-lg"
    >
      <Plus className="w-5 h-5 mr-2" />
      Add Your First Goal
    </Button>
  </div>
);

export default function Goals() {
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);

  // Handler for Phase 2 modal (not implemented yet)
  const handleAddGoal = () => {
    setIsAddModalOpen(true);
    // TODO: Phase 2 - Open goal creation modal
  };

  // Mock goals list - will be replaced with real data in Phase 2
  const goals: any[] = [];

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-7xl mx-auto"
      >
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Goals
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Define your objectives and connect them to your daily habits
          </p>
        </div>

        {/* Goals List Container - Ready for Phase 2 */}
        {goals.length === 0 ? (
          <EmptyState onAddGoal={handleAddGoal} />
        ) : (
          <div className="space-y-4">
            {/* Goals list will be implemented in Phase 2 */}
            {goals.map((goal) => (
              <div key={goal.id} className="p-4 card-glass rounded-lg">
                {/* Goal cards coming in Phase 2 */}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}


import { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { 
  Home, 
  BarChart2, 
  Repeat, 
  Settings, 
  TrendingUp
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface LayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Insights', href: '/insights', icon: BarChart2 },
  { name: 'Habits', href: '/habits', icon: Repeat },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="lg:grid lg:grid-cols-[220px_1fr] h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <motion.div 
        className="hidden lg:flex flex-col card-glass border-r border-white/20 dark:border-gray-700/50"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-6 border-b border-white/10 dark:border-gray-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-coral to-pink-400 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">Compounded</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tiny gains, massive growth</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.name} href={item.href}>
                <motion.div
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? 'bg-coral/10 text-coral dark:bg-coral/20' 
                      : 'hover:bg-white/50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Dark Mode</span>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={toggleTheme}
            />
          </div>
        </div>
      </motion.div>

      {/* Desktop Main Content */}
      <div className="hidden lg:flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-[640px] md:max-w-[960px] lg:max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8"
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Mobile/Tablet Layout */}
      <div className="flex h-screen overflow-hidden lg:hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header */}
          <div className="card-glass border-b border-white/20 dark:border-gray-700/50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="w-8 h-8 bg-gradient-to-r from-coral to-pink-400 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-lg font-bold text-gray-800 dark:text-white truncate">Compounded</h1>
              </div>
              <div className="ml-4">
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={toggleTheme}
                />
              </div>
            </div>
          </div>

          {/* Mobile Page Content */}
          <main className="flex-1 overflow-y-auto p-4">
            <motion.div
              key={location}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-[640px] md:max-w-[960px] mx-auto px-4 sm:px-6"
            >
              {children}
            </motion.div>
          </main>

          {/* Mobile Bottom Navigation */}
          <div className="card-glass border-t border-white/20 dark:border-gray-700/50 p-4">
            <nav className="flex justify-around">
              {navigation.map((item) => {
                const isActive = location === item.href;
                const Icon = item.icon;

                return (
                  <Link key={item.name} href={item.href}>
                    <motion.div
                      className={`flex flex-col items-center space-y-1 p-2 cursor-pointer ${
                        isActive 
                          ? 'text-coral' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-medium">{item.name}</span>
                    </motion.div>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}

import { ReactNode, useEffect } from 'react';
import { Home, BarChart3, Target, Settings, TrendingUp } from 'lucide-react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Insights', href: '/insights', icon: BarChart3 },
  { name: 'Habits', href: '/habits', icon: Target },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();

  // Keyboard shortcut for sidebar toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        // The sidebar will handle this via its context
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
        {/* Enhanced Sidebar - Hidden on mobile, collapsible on desktop */}
        <Sidebar className="border-r-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md">
          <div className="flex items-center gap-2 px-4 py-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <TrendingUp className="w-6 h-6 text-coral" />
            <span className="font-bold text-lg text-gray-800 dark:text-white">
              Compounded
            </span>
          </div>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton
                        asChild
                        isActive={location === item.href}
                        className="w-full justify-start gap-3 py-3 px-4 text-gray-700 dark:text-gray-300 hover:text-coral hover:bg-coral/10 data-[active=true]:bg-coral/10 data-[active=true]:text-coral data-[active=true]:border-r-2 data-[active=true]:border-coral"
                      >
                        <button onClick={() => setLocation(item.href)}>
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.name}</span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          {/* Theme toggle in sidebar */}
          <div className="mt-auto p-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="w-full justify-start gap-3 text-gray-700 dark:text-gray-300 hover:text-coral hover:bg-coral/10"
            >
              {theme === 'dark' ? '🌙' : '☀️'}
              <span>{theme === 'dark' ? 'Dark' : 'Light'} Mode</span>
            </Button>
          </div>
        </Sidebar>

        {/* Main Content - CRITICAL: No padding constraints for mobile full bleeding */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header with sidebar trigger - Only visible on desktop */}
          <div className="hidden lg:flex items-center gap-2 p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border-b border-gray-200/20 dark:border-gray-700/20">
            <SidebarTrigger className="text-gray-600 dark:text-gray-400 hover:text-coral" />
          </div>

          {/* Page Content - NO PADDING on mobile to preserve FullBleed */}
          <main className="flex-1 lg:p-6">
            <div className="lg:max-w-6xl lg:mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="p-4 lg:p-0" // Only add padding on desktop
              >
                {children}
              </motion.div>
            </div>
          </main>

          {/* Mobile Bottom Navigation - Only visible on mobile when sidebar is hidden */}
          <div className="lg:hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-700/50 safe-area-pb">
            <div className="flex items-center justify-around px-4 py-2">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => setLocation(item.href)}
                  className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${
                    location === item.href
                      ? 'text-coral bg-coral/10'
                      : 'text-gray-600 dark:text-gray-400 hover:text-coral'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
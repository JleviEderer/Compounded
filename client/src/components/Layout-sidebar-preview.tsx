
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
import { Switch } from '@/components/ui/switch';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/components/ui/sidebar';

interface LayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Insights', href: '/insights', icon: BarChart2 },
  { name: 'Habits', href: '/habits', icon: Repeat },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function LayoutSidebarPreview({ children }: LayoutProps) {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full">
        {/* Enhanced Sidebar with your coral branding */}
        <Sidebar 
          side="left" 
          variant="sidebar"
          collapsible="icon"
          className="border-r border-white/20 dark:border-gray-700/50"
        >
          <div className="flex h-full w-full flex-col card-glass">
            {/* Header - Preserves your branding */}
            <SidebarHeader className="p-6 border-b border-white/10 dark:border-gray-700/50">
              <motion.div 
                className="flex items-center space-x-3 group-data-[collapsible=icon]:justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-10 h-10 bg-gradient-to-r from-coral to-pink-400 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="group-data-[collapsible=icon]:hidden">
                  <h1 className="text-xl font-bold text-gray-800 dark:text-white">Compounded</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tiny gains, massive growth</p>
                </div>
              </motion.div>
            </SidebarHeader>

            {/* Navigation - Enhanced with collapsible functionality */}
            <SidebarContent className="flex-1 p-4">
              <SidebarMenu className="space-y-2">
                {navigation.map((item) => {
                  const isActive = location === item.href;
                  const Icon = item.icon;

                  return (
                    <SidebarMenuItem key={item.name}>
                      <Link href={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 cursor-pointer w-full ${
                            isActive 
                              ? 'bg-coral/10 text-coral dark:bg-coral/20 hover:bg-coral/15' 
                              : 'hover:bg-white/50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <motion.div
                            className="flex items-center space-x-3 w-full"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="group-data-[collapsible=icon]:hidden">{item.name}</span>
                          </motion.div>
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarContent>

            {/* Footer - Theme toggle preserved */}
            <SidebarFooter className="p-4 border-t border-white/10 dark:border-gray-700/50">
              <div className="flex items-center justify-between group-data-[collapsible=icon]:justify-center">
                <span className="text-sm text-gray-600 dark:text-gray-400 group-data-[collapsible=icon]:hidden">
                  Dark Mode
                </span>
                <div className="p-2 -m-2">
                  <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={toggleTheme}
                  />
                </div>
              </div>
            </SidebarFooter>
          </div>
        </Sidebar>

        {/* Main Content Area */}
        <SidebarInset className="flex-1">
          {/* Mobile Header with Sidebar Trigger */}
          <div className="lg:hidden card-glass border-b border-white/20 dark:border-gray-700/50 p-4 h-16 sm:h-14">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <SidebarTrigger className="h-8 w-8" />
                <div className="w-8 h-8 bg-gradient-to-r from-coral to-pink-400 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-lg font-bold text-gray-800 dark:text-white">Compounded</h1>
              </div>
              <div className="ml-4 p-2 -m-2 lg:hidden">
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={toggleTheme}
                />
              </div>
            </div>
          </div>

          {/* Desktop Header with Sidebar Trigger */}
          <div className="hidden lg:flex items-center h-16 px-6 border-b border-white/20 dark:border-gray-700/50 card-glass">
            <SidebarTrigger className="h-7 w-7" />
          </div>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6 mx-auto max-w-3xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[1600px] w-full">
            <motion.div
              key={location}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </main>
        </SidebarInset>
      </div>

      {/* Custom CSS for enhanced styling */}
      <style jsx global>{`
        /* Preserve your coral theme */
        [data-sidebar="sidebar"] {
          --sidebar-background: rgba(255, 255, 255, 0.1);
          --sidebar-foreground: rgb(55, 65, 81);
          --sidebar-accent: rgb(255, 127, 80);
          --sidebar-accent-foreground: white;
          --sidebar-border: rgba(255, 255, 255, 0.2);
        }
        
        .dark [data-sidebar="sidebar"] {
          --sidebar-background: rgba(0, 0, 0, 0.2);
          --sidebar-foreground: rgb(229, 231, 235);
          --sidebar-border: rgba(107, 114, 128, 0.5);
        }

        /* Keyboard shortcut indicator */
        .sidebar-shortcut::after {
          content: "⌘B";
          position: absolute;
          top: 1rem;
          right: 1rem;
          font-size: 0.75rem;
          opacity: 0.5;
        }
      `}</style>
    </SidebarProvider>
  );
}

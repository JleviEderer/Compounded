import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, Upload, Trash2 } from 'lucide-react';
import { useHabitsContext as useHabits } from '../contexts/HabitsContext';
import { useTheme } from '../hooks/useTheme';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { habits, logs, settings, updateSettings, exportData, importData, resetData } = useHabits();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const success = await importData(file);
      if (success) {
        toast({
          title: "Import Successful",
          description: "Your habit data has been imported successfully.",
        });
      } else {
        toast({
          title: "Import Failed",
          description: "Invalid JSON file. Please check your backup file.",
          variant: "destructive",
        });
      }
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleReset = () => {
    resetData();
    toast({
      title: "Data Reset",
      description: "All your data has been reset successfully.",
    });
  };

  const handleExport = () => {
    exportData();
    toast({
      title: "Export Successful",
      description: "Your data has been downloaded as a JSON file.",
    });
  };

  return (
    <div className="space-y-8">
      <motion.div 
        className="card-glass p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-8">
          Settings & Preferences
        </h2>

        <div className="space-y-8">
          {/* Appearance Settings */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Appearance
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div>
                  <div className="font-medium text-gray-800 dark:text-white">Dark Mode</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Toggle between light and dark themes
                  </div>
                </div>
                <div className="min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation">
                  <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={toggleTheme}
                    className="data-[state=checked]:bg-coral"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div>
                  <div className="font-medium text-gray-800 dark:text-white">Nerd Mode</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Show analytical labels and detailed metrics
                  </div>
                </div>
                <div className="min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation">
                  <Switch
                    checked={settings.nerdMode}
                    onCheckedChange={(checked) => updateSettings({ nerdMode: checked })}
                    className="data-[state=checked]:bg-coral"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Data Management */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Data Management
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div>
                  <div className="font-medium text-gray-800 dark:text-white">Export Data</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Download your habit data as JSON
                  </div>
                </div>
                <Button
                  onClick={handleExport}
                  variant="outline"
                  className="border-coral text-coral hover:bg-coral hover:text-white dark:border-coral dark:text-coral dark:hover:bg-coral dark:hover:text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div>
                  <div className="font-medium text-gray-800 dark:text-white">Import Data</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Restore data from a JSON backup file
                  </div>
                </div>
                <div>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    ref={fileInputRef}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="border-coral text-coral hover:bg-coral hover:text-white dark:border-coral dark:text-coral dark:hover:bg-coral dark:hover:text-white"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Import
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <div>
                  <div className="font-medium text-red-800 dark:text-red-300">Reset All Data</div>
                  <div className="text-sm text-red-600 dark:text-red-400">
                    Permanently delete all habits and progress
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reset All Data</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to reset all data? This will permanently delete 
                        all your habits and progress. This action cannot be undone.

                        Consider exporting your data first as a backup.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleReset}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Reset All Data
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </motion.div>

          {/* About Section */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">About</h3>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Version</span>
                  <span className="font-medium text-gray-800 dark:text-white">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Last Updated</span>
                  <span className="font-medium text-gray-800 dark:text-white">November 2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Habits</span>
                  <span className="font-medium text-gray-800 dark:text-white">{habits.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Days Tracked</span>
                  <span className="font-medium text-gray-800 dark:text-white">
                    {logs.length > 0 ? Math.ceil(logs.length / Math.max(habits.length, 1)) : 0}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
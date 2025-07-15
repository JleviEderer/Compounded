
import React, { useState } from 'react';
import { X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { dataSourceConfig } from '@/services/dataSourceConfig';

export const DevBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [showDocs, setShowDocs] = useState(false);

  if (dataSourceConfig.source !== 'mock' || !isVisible) {
    return null;
  }

  return (
    <>
      {/* Main Banner */}
      <div className="fixed top-0 right-0 z-50 m-4">
        <div className="bg-blue-500 text-white px-3 py-1 rounded-lg shadow-lg flex items-center gap-2 text-sm">
          <span>📊 Mock data mode</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 text-white hover:bg-white/20"
            onClick={() => setShowDocs(true)}
          >
            <Info className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 text-white hover:bg-white/20"
            onClick={() => setIsVisible(false)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Documentation Popup */}
      {showDocs && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Mock Data Mode</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDocs(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                You're viewing demo data with pre-filled habits and logs. Perfect for development and testing.
              </AlertDescription>
            </Alert>

            <div className="space-y-3 text-sm">
              <div>
                <strong>To switch to real user data:</strong>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded font-mono text-xs">
                {`// client/src/services/dataSourceConfig.ts
export const dataSourceConfig = {
  source: 'user', // Change from 'mock'
  enableLocalStorage: true
};`}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Your data will persist in localStorage and survive page reloads.
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

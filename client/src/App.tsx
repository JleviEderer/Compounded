import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import Home from './pages/Home';
import Habits from './pages/Habits';
import Goals from './pages/Goals';
import Insights from './pages/Insights';
import Settings from './pages/Settings';
import NotFound from './pages/not-found';
import { HabitsProvider } from './contexts/HabitsProvider';
import { GoalsProvider } from './contexts/GoalsContext';
import { runPhase05Migration, runFrequencyMigration } from './utils/migration';
import { dataService } from './services/dataService';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  useEffect(() => {
    // Run bucket migration first
    dataService.migrateSplitBuckets();
    // Then run data migrations
    runPhase05Migration();
    runFrequencyMigration();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <HabitsProvider>
        <GoalsProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/habits" element={<Habits />} />
                <Route path="/goals" element={<Goals />} />
                <Route path="/insights" element={<Insights />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </Router>
        </GoalsProvider>
      </HabitsProvider>
    </QueryClientProvider>
  );
}

export default App;
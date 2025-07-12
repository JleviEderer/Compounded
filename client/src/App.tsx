import React, { Suspense } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./hooks/useTheme";
import { FEATURE_FLAGS } from "./utils/featureFlags";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Insights from "./pages/Insights";
import Habits from "./pages/Habits";
import Settings from "./pages/Settings";

// Lazy load Goals page for smaller initial bundle
const Goals = FEATURE_FLAGS.GOALS_V1 ? React.lazy(() => import("./pages/Goals")) : null;

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        {FEATURE_FLAGS.GOALS_V1 && Goals && (
          <Route path="/goals">
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-pulse text-gray-500">Loading Goals...</div>
              </div>
            }>
              <Goals />
            </Suspense>
          </Route>
        )}
        <Route path="/insights" component={Insights} />
        <Route path="/habits" component={Habits} />
        <Route path="/settings" component={Settings} />
        <Route component={Home} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
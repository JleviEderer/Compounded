import { Switch, Route, useLocation } from "wouter";
import { AnimatePresence } from "framer-motion";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./hooks/useTheme";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Insights from "./pages/Insights";
import Habits from "./pages/Habits";
import Settings from "./pages/Settings";

function Router() {
  const [location] = useLocation();
  
  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Switch key={location}>
          <Route path="/" component={Home} />
          <Route path="/insights" component={Insights} />
          <Route path="/habits" component={Habits} />
          <Route path="/settings" component={Settings} />
          <Route component={Home} />
        </Switch>
      </AnimatePresence>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

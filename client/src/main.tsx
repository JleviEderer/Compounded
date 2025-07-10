import { createRoot } from "react-dom/client";
import App from "./App";
import { HabitsProvider } from "./contexts/HabitsProvider";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <HabitsProvider>
    <App />
  </HabitsProvider>
);

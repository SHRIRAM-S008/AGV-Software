import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Clear all service workers and caches
import("../public/sw-unregister.js");

createRoot(document.getElementById("root")!).render(<App />);

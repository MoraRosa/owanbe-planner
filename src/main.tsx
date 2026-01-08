import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Bust PWA/service-worker caches when we ship UI changes.
// This helps mobile users who can't easily hard-refresh.
const BUILD_ID = "2026-01-08-ankara-pattern-1";

async function maybeBustCaches() {
  try {
    const lastBuild = localStorage.getItem("owambe_build_id");
    if (lastBuild === BUILD_ID) return;

    localStorage.setItem("owambe_build_id", BUILD_ID);

    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }

    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }

    // Reload once so the browser pulls fresh assets.
    window.location.reload();
  } catch {
    // If anything fails, just continue booting the app.
  }
}

void maybeBustCaches().finally(() => {
  createRoot(document.getElementById("root")!).render(
    
    <App />
  );
});

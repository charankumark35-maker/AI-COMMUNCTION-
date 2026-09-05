import { useState, useEffect } from "react";
import { Wifi, WifiOff, X, Loader2 } from "lucide-react";
import { checkBackendHealth } from "../services/api";

/**
 * ApiStatusBanner
 * Shows a small dismissible banner at the top of the page indicating
 * whether the backend API is reachable. Auto-dismisses after 5s if healthy.
 */
export default function ApiStatusBanner() {
  const [status, setStatus] = useState("checking"); // "checking" | "online" | "offline"
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let timer;
    checkBackendHealth().then(({ ok }) => {
      setStatus(ok ? "online" : "offline");
      // Auto-dismiss success banner after 4 seconds
      if (ok) {
        timer = setTimeout(() => setDismissed(true), 4000);
      }
    });
    return () => clearTimeout(timer);
  }, []);

  if (dismissed || status === "checking") return null;

  if (status === "online") {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg backdrop-blur-sm">
        <Wifi className="w-3.5 h-3.5 text-emerald-400" />
        <span>Backend Connected</span>
        <button
          onClick={() => setDismissed(true)}
          className="ml-1 text-emerald-500 hover:text-emerald-300 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // Offline
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-red-900/80 border border-red-500/40 text-red-300 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg backdrop-blur-sm max-w-xs">
      <WifiOff className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
      <span>Backend offline — start the FastAPI server on port 8000</span>
      <button
        onClick={() => setDismissed(true)}
        className="ml-1 text-red-500 hover:text-red-300 transition-colors flex-shrink-0"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

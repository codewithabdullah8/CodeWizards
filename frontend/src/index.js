import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

// Import i18n configuration
import "./i18n";

// Import Bootstrap CSS and JS
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// Import Bootstrap Icons
import "bootstrap-icons/font/bootstrap-icons.css";

// (optional) global styles
import "./styles.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    if (process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/service-worker.js")
        .then(() => console.log("Service Worker Registered"))
        .catch((err) => console.log("SW registration failed", err));
      return;
    }

    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));

    if (window.caches) {
      const cacheKeys = await window.caches.keys();
      await Promise.all(cacheKeys.map((cacheKey) => window.caches.delete(cacheKey)));
    }
  });
}

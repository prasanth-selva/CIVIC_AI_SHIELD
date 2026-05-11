// Global error handler that writes to DOM
window.onerror = function(msg, source, line, col, error) {
  const el = document.createElement('pre');
  el.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#111;color:#f00;padding:40px;font-size:14px;white-space:pre-wrap;overflow:auto;max-height:100vh';
  el.textContent = `RUNTIME ERROR:\n${msg}\n\nSource: ${source}\nLine: ${line}, Col: ${col}\n\nStack: ${error?.stack || 'N/A'}`;
  document.body.appendChild(el);
};

window.addEventListener('unhandledrejection', (event) => {
  const el = document.createElement('pre');
  el.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#111;color:#ff0;padding:40px;font-size:14px;white-space:pre-wrap;overflow:auto;max-height:100vh';
  el.textContent = `UNHANDLED PROMISE REJECTION:\n${event.reason}\n\nStack: ${event.reason?.stack || 'N/A'}`;
  document.body.appendChild(el);
});

import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";

// Lazy import App to catch any module-level errors
async function boot() {
  try {
    const rootEl = document.getElementById("root");
    if (!rootEl) {
      document.body.innerHTML = '<h1 style="color:red;padding:40px">FATAL: No #root element</h1>';
      return;
    }

    // Show loading indicator
    rootEl.innerHTML = '<div style="color:#666;padding:80px;font-family:monospace;font-size:14px">ASWIG_CORE: Loading modules...</div>';

    const { default: App } = await import("./App");
    
    rootEl.innerHTML = ''; // clear loading text
    ReactDOM.createRoot(rootEl).render(
      <AuthProvider>
        <App />
      </AuthProvider>
    );
  } catch (err: any) {
    const el = document.createElement('pre');
    el.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#111;color:#f00;padding:40px;font-size:14px;white-space:pre-wrap;overflow:auto;max-height:100vh';
    el.textContent = `BOOT FAILURE:\n${err?.message}\n\nStack:\n${err?.stack || 'N/A'}`;
    document.body.appendChild(el);
  }
}

boot();

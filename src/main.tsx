import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";

console.log("MAIN_INIT: Starting React Mount...");

const rootElement = document.getElementById("root");
if (!rootElement) {
    console.error("FATAL: Root element not found!");
} else {
    console.log("MAIN_INIT: Root element found, mounting...");
    ReactDOM.createRoot(rootElement).render(
        <AuthProvider>
            <App />
        </AuthProvider>
    );
    console.log("MAIN_INIT: Render call completed.");
}

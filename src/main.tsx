import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { AuthProvider, useAuth } from "./context/AuthContext";

function TestApp() {
  const { user, loading } = useAuth();
  return React.createElement("div", {
    style: { color: "lime", fontSize: "32px", padding: "60px", background: "#111", minHeight: "100vh" }
  }, 
    "AUTH_STATE: loading=" + String(loading) + " user=" + String(!!user)
  );
}

const root = document.getElementById("root");
if (root) {
  ReactDOM.createRoot(root).render(
    React.createElement(AuthProvider, null,
      React.createElement(TestApp)
    )
  );
}

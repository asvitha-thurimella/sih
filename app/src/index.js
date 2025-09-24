import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.js"; // ✅ added .js extension
import { LanguageProvider } from "./contexts/LanguageContext.js"; // ✅ import context

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>
);
